import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { compressions, usageMeters, users, apiKeys } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { compress } from '@/app/lib/compression/engine';
import { validateCompressionInput } from '@/app/lib/validate';
import {
  getPlan,
  countWords,
  getCurrentPeriod,
  ANONYMOUS_WORD_LIMIT,
  wordsToTokens,
  tokensToDollars,
} from '@/app/lib/billing';
import { createHash } from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, domain } = body;

    // Determine user — check API key first, then session
    let userId = null;
    let plan = 'free';
    let maxWordsPerShrink = 1000;

    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      const keyHash = createHash('sha256').update(apiKey).digest('hex');
      const keyRecord = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.revokedAt, null)))
        .limit(1);

      if (keyRecord.length === 0) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, keyRecord[0].userId))
        .limit(1);

      if (user.length > 0) {
        userId = user[0].id;
        plan = user[0].plan;
        maxWordsPerShrink = getPlan(plan).maxWordsPerShrink;
      }
    } else {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
        plan = session.user.plan || 'free';
        maxWordsPerShrink = getPlan(plan).maxWordsPerShrink;
      } else {
        // Anonymous — very limited
        maxWordsPerShrink = ANONYMOUS_WORD_LIMIT;
      }
    }

    // Validate input
    const validation = validateCompressionInput(text, maxWordsPerShrink);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check quota for authenticated users
    if (userId) {
      const period = getCurrentPeriod();
      const planLimits = getPlan(plan);
      const usage = await db
        .select()
        .from(usageMeters)
        .where(and(eq(usageMeters.userId, userId), eq(usageMeters.period, period)))
        .limit(1);

      const wordsUsed = usage.length > 0 ? usage[0].wordsProcessed : 0;
      if (wordsUsed + validation.words > planLimits.wordsPerMonth) {
        return NextResponse.json({
          error: `Monthly quota exceeded. You've used ${wordsUsed.toLocaleString()} of ${planLimits.wordsPerMonth.toLocaleString()} words. Upgrade your plan for more.`,
          quota: {
            used: wordsUsed,
            limit: planLimits.wordsPerMonth,
            plan,
          },
        }, { status: 429 });
      }
    }

    // Compress
    const result = compress(validation.text, { domain });

    // Log compression and update usage (for authenticated users)
    if (userId) {
      const period = getCurrentPeriod();

      await db.insert(compressions).values({
        userId,
        originalWords: result.stats.originalWords,
        compressedWords: result.stats.totalCompressedWords,
        rosettaWords: result.stats.rosettaWords,
        ratio: result.stats.ratio,
        strategy: result.stats.strategy,
        tokensSaved: result.stats.tokensSaved,
      });

      // Upsert usage meter
      const existing = await db
        .select()
        .from(usageMeters)
        .where(and(eq(usageMeters.userId, userId), eq(usageMeters.period, period)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(usageMeters)
          .set({
            wordsProcessed: existing[0].wordsProcessed + validation.words,
            compressionCount: existing[0].compressionCount + 1,
            tokensSaved: existing[0].tokensSaved + result.stats.tokensSaved,
            dollarsSaved: existing[0].dollarsSaved + result.stats.dollarsSaved,
          })
          .where(eq(usageMeters.id, existing[0].id));
      } else {
        await db.insert(usageMeters).values({
          userId,
          period,
          wordsProcessed: validation.words,
          compressionCount: 1,
          tokensSaved: result.stats.tokensSaved,
          dollarsSaved: result.stats.dollarsSaved,
        });
      }
    }

    return NextResponse.json({
      compressed: result.compressed,
      rosetta: result.rosetta,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Compression error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
