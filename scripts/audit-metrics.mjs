// Read-only aggregate audit. Never exports account IDs, prompts, or credentials.
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const [records, meters] = await sql.transaction([
  sql`SELECT count(*)::int requests,
    count(*) FILTER (WHERE tokens_saved>0)::int positive_savings,
    coalesce(sum(tokens_saved),0)::bigint saved_total,
    count(*) FILTER (WHERE tokens_saved<>greatest(0,original_tokens-compressed_tokens))::int arithmetic_mismatches,
    count(*) FILTER (WHERE original_tokens=0)::int missing_original_tokens,
    count(*) FILTER (WHERE original_tokens<0 OR compressed_tokens<0 OR tokens_saved<0)::int negative_counts
    FROM compressions WHERE user_id IS NOT NULL`,
  sql`WITH event_totals AS (
      SELECT user_id,to_char(created_at,'YYYY-MM') period,count(*)::int requests,sum(tokens_saved)::bigint saved
      FROM compressions WHERE user_id IS NOT NULL GROUP BY 1,2
    ) SELECT count(*)::int user_months,
      count(*) FILTER (WHERE coalesce(e.requests,0)<>coalesce(m.compression_count,0))::int request_mismatches,
      count(*) FILTER (WHERE coalesce(e.saved,0)<>coalesce(m.tokens_saved,0))::int savings_mismatches,
      coalesce(sum(e.requests),0)::bigint event_requests,coalesce(sum(m.compression_count),0)::bigint meter_requests,
      coalesce(sum(e.saved),0)::bigint event_savings,coalesce(sum(m.tokens_saved),0)::bigint meter_savings
    FROM event_totals e FULL OUTER JOIN usage_meters m ON e.user_id=m.user_id AND e.period=m.period`,
], { readOnly: true, isolationLevel: 'RepeatableRead' });
process.stdout.write(JSON.stringify({ asOf: new Date().toISOString(), records: records[0], reconciliation: meters[0] }, null, 2) + '\n');
