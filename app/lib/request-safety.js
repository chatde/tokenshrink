export class RequestError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

// Count actual streamed bytes; Content-Length alone is not trustworthy.
export async function readJsonLimited(request, maxBytes = 10000) {
  const declared = Number(request.headers.get('content-length'));
  if (declared > maxBytes) throw new RequestError('Request body is too large', 413);
  if (!request.body) throw new RequestError('Invalid JSON body');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestError('Request body is too large', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new RequestError('Invalid JSON body'); }
}

export function isSameOrigin(request) {
  try {
    const origin = new URL(request.headers.get('origin'));
    return ['http:', 'https:'].includes(origin.protocol)
      && origin.host === (request.headers.get('host') || new URL(request.url).host);
  } catch { return false; }
}
