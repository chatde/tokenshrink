import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { usageMeters, compressions } from '@/schema/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getPlan, getCurrentPeriod, tokensToDollars, AVG_COST_PER_1K_TOKENS } from '@/app/lib/billing';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const { allowed, retryAfter } = await checkRateLimit(`usage:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!allowed) {
      return rateLimitResponse(retryAfter);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const plan = getPlan(session.user.plan || 'free');
    const period = getCurrentPeriod();

    const [usage, recentCompressions, successful] = await Promise.all([
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
      db.execute(sql`SELECT count(*)::int AS count FROM compressions WHERE user_id=${userId}
        AND tokens_saved>0 AND created_at>=${period+'-01'}::timestamp
        AND created_at<${period+'-01'}::timestamp+interval '1 month'`),
    ]);

    const currentUsage = usage.find((u) => u.period === period);

    return NextResponse.json(
      {
        plan: session.user.plan || 'free',
        currentPeriod: period,
        generatedAt: new Date().toISOString(),
        successfulCompressionCount: successful.rows[0].count,
        wordsUsed: currentUsage?.wordsProcessed || 0,
        wordsLimit: plan.wordsPerMonth,
        compressionCount: currentUsage?.compressionCount || 0,
        tokensSaved: currentUsage?.tokensSaved || 0,
        dollarsSaved: tokensToDollars(currentUsage?.tokensSaved || 0),
        costAssumptionUsdPerMillion: AVG_COST_PER_1K_TOKENS * 1000,
        history: usage.map(row => ({ ...row, dollarsSaved: tokensToDollars(row.tokensSaved) })),
        recentCompressions,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Usage route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
