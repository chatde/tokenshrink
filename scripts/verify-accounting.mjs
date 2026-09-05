// Real SQL verification using transaction-local temporary tables only.
import assert from 'node:assert/strict';
import { neon } from '@neondatabase/serverless';
import { PgDialect } from 'drizzle-orm/pg-core';
import { compressionRecordQuery } from '../app/lib/record-compression.js';
const sql = neon(process.env.DATABASE_URL);
const dialect = new PgDialect();
const fixture = { userId: 'temporary-accounting-fixture', words: 40, now: new Date('2026-09-01T00:00:00Z'),
  stats: { originalWords: 40, totalCompressedWords: 30, rosettaWords: 0, ratio: 1.25, strategy: 'test', originalTokens: 100, totalCompressedTokens: 80, tokensSaved: 20, dollarsSaved: 0.0001 } };
function record(stats = fixture.stats, userId = fixture.userId) {
  const query = dialect.sqlToQuery(compressionRecordQuery({ ...fixture, userId, stats }));
  return sql.query(query.sql, query.params);
}
function setup() { return [
  sql`CREATE TEMP TABLE compressions (LIKE public.compressions INCLUDING DEFAULTS INCLUDING INDEXES) ON COMMIT DROP`,
  sql`CREATE TEMP TABLE usage_meters (LIKE public.usage_meters INCLUDING DEFAULTS INCLUDING INDEXES) ON COMMIT DROP`,
  sql`CREATE TEMP TABLE api_keys (LIKE public.api_keys INCLUDING DEFAULTS INCLUDING INDEXES) ON COMMIT DROP`,
]; }
const result = await sql.transaction([...setup(), record(), record(), record({ ...fixture.stats, tokensSaved: 0, totalCompressedTokens: 100 }),
  record(fixture.stats, null),
  sql`SELECT (SELECT count(*)::int FROM compressions) events,
    (SELECT count(*)::int FROM compressions WHERE tokens_saved>0) successful,
    compression_count,tokens_saved,words_processed,period FROM usage_meters`,
]);
assert.deepEqual(result.at(-1), [{ events: 4, successful: 3, compression_count: 3, tokens_saved: 40, words_processed: 120, period: '2026-09' }]);
await assert.rejects(sql.transaction([...setup(),
  sql`ALTER TABLE usage_meters ADD CONSTRAINT test_limit CHECK (compression_count<2)`, record(), record(),
]), error => error.code === '23514');
const publicRows = await sql`SELECT count(*)::int count FROM public.compressions WHERE user_id=${fixture.userId}`;
assert.equal(publicRows[0].count, 0);
console.log('PASS: event/meter increments, no-op classification, UTC month, rollback on meter failure; no public fixture rows.');
