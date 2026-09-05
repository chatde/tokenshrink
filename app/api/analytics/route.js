import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import { validateAnalyticsEvent } from '@/app/lib/analytics-input';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, retryAfter } = await checkRateLimit(`analytics:${ip}`, { limit: 120, windowMs: 60_000 });
    if (!allowed) {
      const response = rateLimitResponse(retryAfter);
      for (const [key, value] of Object.entries(CORS_HEADERS)) response.headers.set(key, value);
      return response;
    }
    let body;
    try { body = await request.json(); } catch { body = null; }
    const event = validateAnalyticsEvent(body);
    if (!event) return NextResponse.json({ ok: false, error: 'Invalid analytics event' }, { status: 400, headers: CORS_HEADERS });
    await db.execute(sql`INSERT INTO analytics_events (event, before_tokens, after_tokens, saved_tokens, source)
      VALUES (${event.event}, ${event.before}, ${event.after}, ${event.saved}, ${event.source})`);
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch {
    // SDK requests remain non-blocking, but operators must see persistence failures.
    console.error('Analytics persistence unavailable');
    return NextResponse.json({ ok: false, error: 'Analytics unavailable' }, { status: 503, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
