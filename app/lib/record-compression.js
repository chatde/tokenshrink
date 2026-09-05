import { sql } from 'drizzle-orm';

// One PostgreSQL statement: the event, monthly meter and key timestamp commit together.
export function compressionRecordQuery({ userId, apiKeyId = null, stats, words, now = new Date() }) {
  const saved = stats.originalTokens - stats.totalCompressedTokens;
  if (!Number.isSafeInteger(stats.tokensSaved) || stats.tokensSaved !== Math.max(0, saved)) {
    throw new Error('Invalid compression accounting');
  }
  const period = now.toISOString().slice(0, 7);
  const createdAt = now.toISOString();
  return sql`WITH recorded AS (
    INSERT INTO compressions (id,user_id,original_words,compressed_words,rosetta_words,ratio,strategy,tokens_saved,original_tokens,compressed_tokens,created_at)
    VALUES (${crypto.randomUUID()},${userId},${stats.originalWords},${stats.totalCompressedWords},${stats.rosettaWords},${stats.ratio},${stats.strategy},${stats.tokensSaved},${stats.originalTokens},${stats.totalCompressedTokens},${createdAt}::timestamptz AT TIME ZONE 'UTC')
    RETURNING user_id
  ), metered AS (
    INSERT INTO usage_meters (id,user_id,period,words_processed,compression_count,tokens_saved,dollars_saved)
    SELECT ${crypto.randomUUID()},user_id,${period},${words},1,${stats.tokensSaved},${stats.dollarsSaved} FROM recorded WHERE user_id IS NOT NULL
    ON CONFLICT (user_id,period) DO UPDATE SET
      words_processed=usage_meters.words_processed+EXCLUDED.words_processed,
      compression_count=usage_meters.compression_count+1,
      tokens_saved=usage_meters.tokens_saved+EXCLUDED.tokens_saved,
      dollars_saved=usage_meters.dollars_saved+EXCLUDED.dollars_saved
    RETURNING user_id
  ), touched AS (
    UPDATE api_keys SET last_used_at=${createdAt}::timestamptz AT TIME ZONE 'UTC'
    WHERE id=${apiKeyId} AND user_id IN (SELECT user_id FROM metered)
  ) SELECT user_id FROM recorded`;
}
