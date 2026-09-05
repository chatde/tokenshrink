import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { users, subscriptions } from '@/schema/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getStripe } from '@/app/lib/stripe';
import { isSameOrigin, readJsonLimited, RequestError } from '@/app/lib/request-safety';

const PRICE_MAP = {
  advanced: process.env.STRIPE_ADVANCED_PRICE_ID,
  advanced_annual: process.env.STRIPE_ADVANCED_ANNUAL_PRICE_ID || process.env.STRIPE_ADVANCED_PRICE_ID_ANNUAL,
};

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(ip, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Billing unavailable' }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await readJsonLimited(request);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: error instanceof RequestError ? error.status : 400 });
    }

    const plan = typeof body?.plan === 'string' ? body.plan : '';
    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await db.select({ id: subscriptions.id }).from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), inArray(subscriptions.status, ['active', 'trialing', 'past_due']))).limit(1);
    if (existing.length) {
      return NextResponse.json({ error: 'An existing subscription must be managed in the billing portal' }, { status: 409 });
    }
    let customerId = dbUser[0].stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          email: session.user.email,
          name: session.user.name,
          metadata: { userId: session.user.id },
        },
        { idempotencyKey: `customer-create-${session.user.id}` },
      );
      customerId = customer.id;

      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, session.user.id));
    }

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
        metadata: { userId: session.user.id, plan },
        subscription_data: { metadata: { userId: session.user.id, plan } },
      },
      { idempotencyKey: `checkout-${session.user.id}-${plan}-${Math.floor(Date.now() / 300000)}` },
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Billing checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
