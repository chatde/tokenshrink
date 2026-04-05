import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Sanity caps — protects against absurd values without requiring external state.
// Note: in-process rate limiting is not reliable on Vercel serverless (no shared state
// across instances). These caps are the primary abuse protection.
const MAX_TOKENS = 2_000_000;
const MAX_STRING_LEN = 64;

export async function POST(request) {
  try {
    // Rate limit by IP — 120 requests per minute (telemetry is high-frequency)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const { allowed, retryAfter } = await checkRateLimit(`analytics:${ip}`, { limit: 120, windowMs: 60_000 });
    if (!allowed) {
      return rateLimitResponse(retryAfter);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // malformed body — apply defaults
    }

    if (body.before !== undefined && typeof body.before !== 'number') {
      return NextResponse.json({ ok: true }, { status: 400, headers: CORS_HEADERS });
    }
    if (body.after !== undefined && typeof body.after !== 'number') {
      return NextResponse.json({ ok: true }, { status: 400, headers: CORS_HEADERS });
    }
    if (body.event !== undefined && typeof body.event !== 'string') {
      return NextResponse.json({ ok: true }, { status: 400, headers: CORS_HEADERS });
    }

    const event = (typeof body.event === 'string' ? body.event : 'unknown').slice(0, MAX_STRING_LEN);
    const before = Math.min(typeof body.before === 'number' ? body.before : 0, MAX_TOKENS);
    const after = Math.min(typeof body.after === 'number' ? body.after : 0, MAX_TOKENS);
    const source = (typeof body.source === 'string' ? body.source : 'unknown').slice(0, MAX_STRING_LEN);
    const saved = before - after;

    try {
      await db.execute(
        sql`INSERT INTO analytics_events (event, before_tokens, after_tokens, saved_tokens, source, created_at)
            VALUES (${event}, ${before}, ${after}, ${saved}, ${source}, NOW())`,
      );
    } catch {
      console.log('[analytics]', { event, before, after, saved, source });
    }

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
