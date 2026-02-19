import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users, subscriptions } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, plan } = session.metadata;

      if (userId && plan) {
        await db
          .update(users)
          .set({ plan, updatedAt: new Date() })
          .where(eq(users.id, userId));

        // Store subscription
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await db
            .insert(subscriptions)
            .values({
              userId,
              stripeSubscriptionId: session.subscription,
              status: sub.status,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            })
            .onConflictDoUpdate({
              target: subscriptions.userId,
              set: {
                stripeSubscriptionId: session.subscription,
                status: sub.status,
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                updatedAt: new Date(),
              },
            });
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      await db
        .update(subscriptions)
        .set({
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      // Downgrade user to free
      const subRecord = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        .limit(1);

      if (subRecord.length > 0) {
        await db
          .update(users)
          .set({ plan: 'free', updatedAt: new Date() })
          .where(eq(users.id, subRecord[0].userId));

        await db
          .update(subscriptions)
          .set({ status: 'canceled', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
