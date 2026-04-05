import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { users } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getStripe } from '@/app/lib/stripe';

export async function POST() {
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

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser[0].stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
