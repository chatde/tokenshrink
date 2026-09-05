import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { apiKeys } from '@/schema/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import { isSameOrigin, readJsonLimited, RequestError } from '@/app/lib/request-safety';

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(ip, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await db
      .select({
        id: apiKeys.id,
        keyPrefix: apiKeys.keyPrefix,
        label: apiKeys.label,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, session.user.id), isNull(apiKeys.revokedAt)));

    return NextResponse.json({ keys }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('API keys GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(ip, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

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

    const label = typeof body?.label === 'string' && body.label.trim() ? body.label.trim() : 'Default';
    if (label.length > 100) return NextResponse.json({ error: 'Label must be at most 100 characters' }, { status: 400 });

    const rawKey = `ts_live_${randomBytes(16).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 12);

    await db.insert(apiKeys).values({
      userId: session.user.id,
      keyHash,
      keyPrefix,
      label,
    });

    return NextResponse.json({ key: rawKey, prefix: keyPrefix }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('API keys POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(ip, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

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

    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'API key id is required' }, { status: 400 });
    }

    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)));

    return NextResponse.json({ revoked: true });
  } catch (error) {
    console.error('API keys DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
