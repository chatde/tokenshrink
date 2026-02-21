import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { compressions, usageMeters, users, apiKeys } from '@/schema/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { compress } from '@/app/lib/compression/engine';
import { validateCompressionInput } from '@/app/lib/validate';
import {
  getPlan,
  getCurrentPeriod,
} from '@/app/lib/billing';
import { createHash } from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, domain } = body;

    // Determine user — check API key first, then session
    let userId = null;
    let apiKeyId = null;
    const maxWordsPerShrink = getPlan('free').maxWordsPerShrink;

    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      const keyHash = createHash('sha256').update(apiKey).digest('hex');
      const keyRecord = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
        .limit(1);

      if (keyRecord.length === 0) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      apiKeyId = keyRecord[0].id;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, keyRecord[0].userId))
        .limit(1);

      if (user.length > 0) {
        userId = user[0].id;
      }
    } else {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    // Validate input
    const validation = validateCompressionInput(text, maxWordsPerShrink);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
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
        originalTokens: result.stats.originalTokens,
        compressedTokens: result.stats.totalCompressedTokens,
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

      // Update lastUsedAt on API key
      if (apiKeyId) {
        await db
          .update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, apiKeyId));
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
