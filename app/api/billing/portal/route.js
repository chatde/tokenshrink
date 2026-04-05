import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { users } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getStripe } from '@/app/lib/stripe';

export async function POST() {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Billing unavailable' }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!dbUser[0]?.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account' }, { status: 400 });
    }

    const portalSessionParams = {
      customer: dbUser[0].stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    };
    if (process.env.STRIPE_PORTAL_CONFIG_ID) {
      portalSessionParams.configuration = process.env.STRIPE_PORTAL_CONFIG_ID;
    }
    const portalSession = await stripe.billingPortal.sessions.create(portalSessionParams);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
