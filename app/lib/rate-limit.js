import { kv } from '@vercel/kv';
import { db } from '@/app/lib/db';
import { rateLimits } from '@/schema/schema';
import { sql, lt } from 'drizzle-orm';

const rateLimit = new Map();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimit) {
    if (now - record.start > windowMs) {
      rateLimit.delete(key);
    }
  }
}

function normalizeResult({ count, limit, reset, windowMs }) {
  const remaining = Math.max(0, limit - count);
  const retryAfter = count > limit ? Math.max(1, Math.ceil((reset - Date.now()) / 1000)) : undefined;

  return {
    success: count <= limit,
    allowed: count <= limit,
    limit,
    remaining,
    reset,
    retryAfter,
    windowMs,
  };
}

function inMemoryRateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  cleanup(windowMs);

  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now - record.start > windowMs) {
    rateLimit.set(key, { start: now, count: 1 });
    return normalizeResult({ count: 1, limit, reset: now + windowMs, windowMs });
  }

  record.count += 1;
  return normalizeResult({
    count: record.count,
    limit,
    reset: record.start + windowMs,
    windowMs,
  });
}

export async function checkRateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();

  if (process.env.KV_URL) {
    const window = Math.floor(now / windowMs);
    const kvKey = `rl:${key}:${window}`;
    const reset = (window + 1) * windowMs;

    try {
      const count = await kv.incr(kvKey);
      if (count === 1) {
        await kv.expire(kvKey, Math.ceil(windowMs / 1000) + 1);
      }

      return normalizeResult({ count, limit, reset, windowMs });
    } catch {
      return inMemoryRateLimit(key, { limit, windowMs });
    }
  }

  // No KV configured — use Postgres-backed fixed-window limiter.
  try {
    const windowIndex = Math.floor(now / windowMs);
    const id = `${key}:${windowIndex}`;
    const reset = (windowIndex + 1) * windowMs;

    const rows = await db.insert(rateLimits)
      .values({ id, count: 1, expiresAt: new Date(reset + windowMs) })
      .onConflictDoUpdate({ target: rateLimits.id, set: { count: sql`${rateLimits.count} + 1` } })
      .returning({ count: rateLimits.count });

    const count = rows[0].count;

    if (Math.random() < 0.01) {
      try {
        await db.delete(rateLimits).where(lt(rateLimits.expiresAt, new Date()));
      } catch {
        // swallow cleanup errors
      }
    }

    return normalizeResult({ count, limit, reset, windowMs });
  } catch {
    return inMemoryRateLimit(key, { limit, windowMs });
  }
}

/**
 * Build a 429 Response with standard rate-limit headers.
 */
export function rateLimitResponse(retryAfter, extraHeaders = {}) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded', retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
        ...extraHeaders,
      },
    },
  );
}
