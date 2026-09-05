import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { sql } from 'drizzle-orm';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import { validateFeedback } from '@/app/lib/feedback-input';
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rate = await checkRateLimit(`feedback:${ip}`, { limit: 3, windowMs: 3600000 });
    if (!rate.allowed) return rateLimitResponse(rate.retryAfter);
    const raw = await request.text();
    if (raw.length > 10000) return NextResponse.json({ error: 'Feedback is too long' }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { body = null; }
    const feedback = validateFeedback(body);
    if (!feedback) return NextResponse.json({ error: 'Choose a category and write 10–2,000 characters.' }, { status: 400 });
    const id = crypto.randomUUID();
    await db.execute(sql`INSERT INTO feedback (id, category, message) VALUES (${id}, ${feedback.category}, ${feedback.message})`);
    return NextResponse.json({ ok: true, id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Feedback could not be saved. Please try again.' }, { status: 503 });
  }
}
