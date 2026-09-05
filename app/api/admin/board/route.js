import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/admin';
import { db } from '@/app/lib/db';
import { sql } from 'drizzle-orm';
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const [accounts, usage, telemetry, daily, feedback] = await Promise.all([
      db.execute(sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE created_at >= now()-interval '30 days')::int AS new_accounts FROM users`),
      db.execute(sql`SELECT count(*)::int AS requests, count(distinct user_id)::int AS active_accounts, COALESCE(sum(tokens_saved),0)::bigint AS estimated_tokens_saved FROM compressions WHERE created_at >= now()-interval '30 days'`),
      db.execute(sql`SELECT source, count(*)::int AS events, COALESCE(sum(saved_tokens),0)::bigint AS reported_tokens_saved FROM analytics_events WHERE created_at >= now()-interval '30 days' GROUP BY source ORDER BY events DESC`),
      db.execute(sql`SELECT to_char(created_at, 'YYYY-MM-DD') AS day, count(*)::int AS requests, count(distinct user_id)::int AS active_accounts FROM compressions WHERE created_at >= now()-interval '30 days' GROUP BY 1 ORDER BY 1 DESC`),
      db.execute(sql`SELECT id, category, message, status, summary, resolution, created_at, updated_at FROM feedback ORDER BY created_at DESC LIMIT 100`),
    ]);
    return NextResponse.json({ generatedAt: new Date().toISOString(), accounts: accounts.rows[0], usage: usage.rows[0], telemetry: telemetry.rows, daily: daily.rows, feedback: feedback.rows }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Usage board unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
