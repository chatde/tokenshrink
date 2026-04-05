import { kv } from '@vercel/kv';

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
  if (!process.env.KV_URL) {
    return inMemoryRateLimit(key, { limit, windowMs });
  }

  const now = Date.now();
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
