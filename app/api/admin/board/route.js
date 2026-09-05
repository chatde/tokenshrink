import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/admin';
import { db } from '@/app/lib/db';
import { sql } from 'drizzle-orm';
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const [accounts, usage, telemetry, daily, feedback] = await Promise.all([
      db.execute(sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE created_at >= now()-interval '30 days')::int AS new_accounts FROM users`),
      db.execute(sql`SELECT
        count(*)::bigint AS lifetime_requests,
        count(*) FILTER (WHERE tokens_saved > 0)::bigint AS lifetime_successful_compressions,
        count(*) FILTER (WHERE tokens_saved <= 0)::bigint AS lifetime_no_savings_requests,
        COALESCE(sum(tokens_saved),0)::bigint AS lifetime_estimated_tokens_saved,
        count(*) FILTER (WHERE created_at >= now()-interval '30 days')::bigint AS requests,
        count(*) FILTER (WHERE created_at >= now()-interval '30 days' AND tokens_saved > 0)::bigint AS successful_compressions,
        count(*) FILTER (WHERE created_at >= now()-interval '30 days' AND tokens_saved <= 0)::bigint AS no_savings_requests,
        count(distinct user_id) FILTER (WHERE created_at >= now()-interval '30 days')::int AS active_accounts,
        COALESCE(sum(tokens_saved) FILTER (WHERE created_at >= now()-interval '30 days'),0)::bigint AS estimated_tokens_saved
        FROM compressions WHERE user_id IS NOT NULL`),
      db.execute(sql`SELECT source, count(*)::int AS events, COALESCE(sum(saved_tokens),0)::bigint AS reported_tokens_saved FROM analytics_events WHERE created_at >= now()-interval '30 days' GROUP BY source ORDER BY events DESC`),
      db.execute(sql`SELECT to_char(created_at, 'YYYY-MM-DD') AS day, count(*)::int AS requests, count(*) FILTER (WHERE tokens_saved > 0)::int AS successful_compressions, count(distinct user_id)::int AS active_accounts FROM compressions WHERE user_id IS NOT NULL AND created_at >= now()-interval '30 days' GROUP BY 1 ORDER BY 1 DESC`),
      db.execute(sql`SELECT id, category, message, status, summary, resolution, created_at, updated_at FROM feedback ORDER BY created_at DESC LIMIT 100`),
    ]);
    return NextResponse.json({ generatedAt: new Date().toISOString(), accounts: accounts.rows[0], usage: usage.rows[0], telemetry: telemetry.rows, daily: daily.rows, feedback: feedback.rows }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Usage board unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
