import { it, expect, vi } from 'vitest';
import { readJsonLimited, isSameOrigin } from '../app/lib/request-safety.js';
import { decodeLegacy } from '../app/lib/decode.js';

it('rejects streamed oversized data even without Content-Length and cancels the reader', async () => {
  const cancel = vi.fn();
  const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{"x":"' + 'a'.repeat(50))); }, cancel });
  const request = new Request('https://example.test', { method: 'POST', body, duplex: 'half' });
  await expect(readJsonLimited(request, 20)).rejects.toMatchObject({ status: 413 });
  expect(cancel).toHaveBeenCalledOnce();
});
it('counts multibyte input in bytes', async () => {
  const req = new Request('https://example.test', { method: 'POST', body: JSON.stringify({ x: '😀'.repeat(10) }) });
  await expect(readJsonLimited(req, 40)).rejects.toMatchObject({ status: 413 });
});
it.each(['null', '[]', '"string"', '{oops'])('rejects malformed or non-object JSON: %s', async body => {
  await expect(readJsonLimited(new Request('https://example.test', { method: 'POST', body }))).rejects.toMatchObject({ status: 400 });
});
it('accepts valid JSON and boundary-sized data', async () => {
  const body = '{"a":1}';
  expect(await readJsonLimited(new Request('https://example.test', { method: 'POST', body }), body.length)).toEqual({ a: 1 });
});
it.each([undefined, 'null', 'https://evil.test', 'https://example.test.evil.test', 'ftp://example.test'])('rejects unsafe browser origins: %s', origin => {
  expect(isSameOrigin(new Request('https://example.test', { headers: origin ? { origin } : {} }))).toBe(false);
});
it('accepts actual host behind a proxy', () => {
  expect(isSameOrigin(new Request('http://localhost:3000', { headers: { host: 'tokenshrink.com', origin: 'https://tokenshrink.com' } }))).toBe(true);
});
it('decodes literal replacement dollars and does not cascade dictionary references', () => {
  expect(decodeLegacy('[DECODE]\na=b\nb=$& $$ $`\n[/DECODE]\na b').decompressed).toBe('b $& $$ $`');
});
it('treats prototype names as ordinary dictionary entries', () => {
  expect(decodeLegacy('[DECODE]\n__proto__=literal\n[/DECODE]\n__proto__').decompressed).toBe('literal');
});
it('rejects expansion beyond the output limit before allocating it', () => {
  expect(() => decodeLegacy('[DECODE]\na=' + 'z'.repeat(80) + '\n[/DECODE]\na a a', 150)).toThrow('Decoded text is too large');
});
