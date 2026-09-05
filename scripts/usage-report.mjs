// node --env-file=.env.production.local scripts/usage-report.mjs
import { neon } from '@neondatabase/serverless';
const sql=neon(process.env.DATABASE_URL);
const [accounts,usage,telemetry,feedback]=await Promise.all([
 sql`SELECT count(*)::int AS accounts FROM users`,
 sql`SELECT count(*)::int AS requests, count(distinct user_id)::int AS active_accounts, COALESCE(sum(tokens_saved),0)::bigint AS estimated_tokens_saved FROM compressions WHERE created_at>=now()-interval '30 days'`,
 sql`SELECT source, count(*)::int AS events FROM analytics_events WHERE created_at>=now()-interval '30 days' GROUP BY source`,
 sql`SELECT status, count(*)::int AS items FROM feedback GROUP BY status`
]);
console.log(JSON.stringify({asOf:new Date().toISOString(),accounts,usage30Days:usage,telemetry30Days:telemetry,feedback},null,2));
