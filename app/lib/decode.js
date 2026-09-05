import { RequestError } from './request-safety';

// Legacy decoder: literal, single-pass replacements with bounded output.
// It cannot restore phrases removed by the heuristic compressor.
export function decodeLegacy(text, maxOutput = 500000) {
  if (typeof text !== 'string' || !text) throw new RequestError('Text is required');
  if (text.length > maxOutput) throw new RequestError('Text is too large', 413);
  const match = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);
  if (!match) return { decompressed: text, note: 'No Rosetta Stone decoder found — text returned as-is' };
  const body = text.replace(/\[DECODE\][\s\S]*?\[\/DECODE\]\s*/, '').trim();
  const entries = new Map();
  for (const line of match[1].split('\n')) {
    const parsed = line.trim().match(/^(P\d+)="(.+)"$/) || line.trim().match(/^(.+?)=(.+)$/);
    if (!parsed) continue;
    if (parsed[1].length > 128 || parsed[2].length > 10000 || entries.size >= 256) {
      throw new RequestError('Decoder dictionary is too large', 413);
    }
    entries.set(parsed[1], parsed[2]);
  }
  if (!entries.size) return { decompressed: body };
  const codes = [...entries.keys()].sort((a, b) => b.length - a.length)
    .map(code => code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(?:${codes.join('|')})\\b`, 'g');
  const chunks = [];
  let last = 0;
  let size = 0;
  for (const found of body.matchAll(pattern)) {
    const prefix = body.slice(last, found.index);
    const literal = entries.get(found[0]);
    size += prefix.length + literal.length;
    if (size > maxOutput) throw new RequestError('Decoded text is too large', 413);
    chunks.push(prefix, literal);
    last = found.index + found[0].length;
  }
  if (size + body.length - last > maxOutput) throw new RequestError('Decoded text is too large', 413);
  chunks.push(body.slice(last));
  return { decompressed: chunks.join('') };
}
