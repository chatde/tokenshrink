import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users } from '@/schema/schema';
import { eq, sql } from 'drizzle-orm';
import { getStripe } from '@/app/lib/stripe';
import { subscriptionState } from '@/app/lib/subscription-state';

const SUBSCRIPTION_EVENTS = new Set([
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
]);

export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Billing unavailable' }, { status: 503 });
  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  try {
    const object = event.data.object;
    const checkout = event.type === 'checkout.session.completed';
    if (!checkout && !SUBSCRIPTION_EVENTS.has(event.type)) return NextResponse.json({ received: true });
    const subscriptionId = checkout
      ? (typeof object.subscription === 'string' ? object.subscription : object.subscription?.id)
      : object.id;
    if (!subscriptionId) return NextResponse.json({ received: true });
    // Fetch current state, rather than trusting delayed/out-of-order event payloads.
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const state = subscriptionState(subscription);
    if (!state) return NextResponse.json({ received: true });
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
    const records = await db.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
    if (!records.length) throw new Error('Subscription customer is not linked');
    const userId = records[0].id;

    // One SQL statement makes event deduplication, subscription state and plan
    // updates atomic. A failed statement is retried by Stripe without lost events.
    await db.execute(sql`
      WITH accepted AS (
        INSERT INTO stripe_webhook_events (id) VALUES (${event.id})
        ON CONFLICT (id) DO NOTHING RETURNING id
      ), synced AS (
        INSERT INTO subscriptions
          (id, user_id, stripe_subscription_id, status, current_period_start, current_period_end, last_stripe_event_created)
        SELECT ${crypto.randomUUID()}, ${userId}, ${subscription.id}, ${state.status},
          ${state.currentPeriodStart}, ${state.currentPeriodEnd}, ${event.created}
        FROM accepted
        ON CONFLICT (user_id) DO UPDATE SET
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          status = EXCLUDED.status,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          last_stripe_event_created = EXCLUDED.last_stripe_event_created,
          updated_at = NOW()
        WHERE subscriptions.last_stripe_event_created <= EXCLUDED.last_stripe_event_created
          AND (subscriptions.stripe_subscription_id = EXCLUDED.stripe_subscription_id
            OR EXCLUDED.status = 'active')
        RETURNING user_id
      )
      UPDATE users SET plan = ${state.plan}, updated_at = NOW()
      WHERE id IN (SELECT user_id FROM synced)
    `);
    return NextResponse.json({ received: true });
  } catch {
    console.error('Stripe subscription synchronization failed');
    return NextResponse.json({ error: 'Subscription synchronization failed' }, { status: 500 });
  }
}
