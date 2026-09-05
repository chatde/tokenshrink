import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { compressions, usageMeters, users, apiKeys } from '@/schema/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { readJsonLimited, RequestError } from '@/app/lib/request-safety';
import { compress } from '@/app/lib/compression/engine';
import { validateCompressionInput } from '@/app/lib/validate';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import {
  getPlan,
  getCurrentPeriod,
} from '@/app/lib/billing';
import { getCompressionTier } from '@/app/lib/gates';
import { createHash } from 'crypto';

export async function POST(request) {
  try {
    // Rate limit by IP — 10 requests per minute for anonymous, 30 for authenticated
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const body = await readJsonLimited(request, 2_000_000);
    const { text, domain } = body;

    // Determine user — check API key first, then session
    let userId = null;
    let apiKeyId = null;
    const maxWordsPerShrink = getPlan('free').maxWordsPerShrink;

    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      if (apiKey.length > 256) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      const keyHash = createHash('sha256').update(apiKey).digest('hex');
      const result = await db
        .select({
          apiKeyId: apiKeys.id,
          userId: users.id,
        })
        .from(apiKeys)
        .innerJoin(users, eq(apiKeys.userId, users.id))
        .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      apiKeyId = result[0].apiKeyId;
      userId = result[0].userId;
    } else {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    // Check compression tier
    const tierInfo = await getCompressionTier(userId);
    const isProUser = tierInfo.tier === 'pro';
    const isFreeExceeded = tierInfo.tier === 'free_exceeded';

    // Rate limit — authenticated users get 30/min, anonymous get 10/min
    const rateKey = userId ? `user:${userId}` : `ip:${ip}`;
    const rateOptions = userId ? { limit: 30, windowMs: 60_000 } : { limit: 10, windowMs: 60_000 };
    const { allowed, remaining, retryAfter } = await checkRateLimit(rateKey, rateOptions);

    if (!allowed) {
      return rateLimitResponse(retryAfter, { 'X-RateLimit-Limit': String(rateOptions.limit) });
    }

    // Validate input
    const validation = validateCompressionInput(text, maxWordsPerShrink);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Compress
    const result = compress(text, {
      domain,
      tier: isProUser ? 'pro' : (isFreeExceeded ? 'basic' : 'free'),
    });

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
        originalTokens: result.stats.originalTokens,
        compressedTokens: result.stats.totalCompressedTokens,
      });

      // Atomic increments avoid lost usage when a user sends concurrent calls.
      await db.insert(usageMeters).values({
          userId,
          period,
          wordsProcessed: validation.words,
          compressionCount: 1,
          tokensSaved: result.stats.tokensSaved,
          dollarsSaved: result.stats.dollarsSaved,
        }).onConflictDoUpdate({ target: [usageMeters.userId, usageMeters.period], set: {
          wordsProcessed: sql`${usageMeters.wordsProcessed} + ${validation.words}`,
          compressionCount: sql`${usageMeters.compressionCount} + 1`,
          tokensSaved: sql`${usageMeters.tokensSaved} + ${result.stats.tokensSaved}`,
          dollarsSaved: sql`${usageMeters.dollarsSaved} + ${result.stats.dollarsSaved}`,
        } });

      // Update lastUsedAt on API key
      if (apiKeyId) {
        await db
          .update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, apiKeyId));
      }
    }

    const responseExtra = isFreeExceeded ? {
      plan: 'free',
      callsUsed: tierInfo.callsUsed,
      callsLimit: 500,
      upgrade_prompt: 'You\'ve used 500/500 free API calls this month. Upgrade to Pro for unlimited calls + advanced compression.',
      upgrade_url: 'https://tokenshrink.com/pricing',
    } : {};

    return NextResponse.json({
      compressed: result.compressed,
      rosetta: result.rosetta,
      stats: result.stats,
      ...responseExtra,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Compression error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
