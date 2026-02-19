import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { usageMeters, compressions } from '@/schema/schema';
import { eq, desc } from 'drizzle-orm';
import { getPlan, getCurrentPeriod } from '@/app/lib/billing';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const plan = getPlan(session.user.plan || 'free');
  const period = getCurrentPeriod();

  const [usage, recentCompressions] = await Promise.all([
    db
      .select()
      .from(usageMeters)
      .where(eq(usageMeters.userId, userId))
      .orderBy(desc(usageMeters.period))
      .limit(12),
    db
      .select()
      .from(compressions)
      .where(eq(compressions.userId, userId))
      .orderBy(desc(compressions.createdAt))
      .limit(20),
  ]);

  const currentUsage = usage.find((u) => u.period === period);

  return NextResponse.json({
    plan: session.user.plan || 'free',
    currentPeriod: period,
    wordsUsed: currentUsage?.wordsProcessed || 0,
    wordsLimit: plan.wordsPerMonth,
    compressionCount: currentUsage?.compressionCount || 0,
    tokensSaved: currentUsage?.tokensSaved || 0,
    dollarsSaved: currentUsage?.dollarsSaved || 0,
    history: usage,
    recentCompressions,
  });
}
