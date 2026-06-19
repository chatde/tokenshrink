import { db } from '@/app/lib/db';
import { usageMeters, subscriptions } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentPeriod } from '@/app/lib/billing';

export const FREE_TIER_CALL_LIMIT = 500;

export async function getCompressionTier(userId) {
  if (!userId) return { tier: 'anonymous' };

  // Subscription records are the source of truth for billing state.
  const sub = await db
    .select({
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active'),
    ))
    .limit(1);

  if (sub.length > 0) {
    return { tier: 'pro' };
  }

  // Check free tier call usage this month
  const period = getCurrentPeriod();
  const usage = await db
    .select()
    .from(usageMeters)
    .where(and(eq(usageMeters.userId, userId), eq(usageMeters.period, period)))
    .limit(1);

  const callsUsed = usage[0]?.compressionCount || 0;

  return {
    tier: callsUsed >= FREE_TIER_CALL_LIMIT ? 'free_exceeded' : 'free',
    callsUsed,
    callsRemaining: Math.max(0, FREE_TIER_CALL_LIMIT - callsUsed),
  };
}
