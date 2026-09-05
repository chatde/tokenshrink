import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { users, apiKeys } from '@/schema/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { compressionRecordQuery } from '@/app/lib/record-compression';
import { readJsonLimited, RequestError } from '@/app/lib/request-safety';
import { compress } from '@/app/lib/compression/engine';
import { validateCompressionInput } from '@/app/lib/validate';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import {
  getPlan,
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
      analytics: false,
    });

    // A response is returned only after the event and monthly meter commit together.
    await db.execute(compressionRecordQuery({ userId, apiKeyId, stats: result.stats, words: validation.words }));

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
