export function validateAnalyticsEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (!['compress', 'compressHistory'].includes(body.event)) return null;
  if (![body.before, body.after].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 2_000_000)) return null;
  if (body.after > body.before) return null;
  if (typeof body.source !== 'string' || !/^[a-zA-Z0-9_.-]{1,64}$/.test(body.source)) return null;
  return { event: body.event, before: body.before, after: body.after, saved: body.before - body.after, source: body.source };
}
