import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { encode as cl100k } from 'gpt-tokenizer/encoding/cl100k_base';
import { encode as o200k } from 'gpt-tokenizer/encoding/o200k_base';
import { compress } from '../sdk/src/engine.js';
const fixtures = JSON.parse(readFileSync(new URL('../benchmarks/quality-fixtures.json', import.meta.url)));
for (const [name, encode] of Object.entries({ cl100k, o200k })) {
  describe(name, () => {
    for (const fixture of fixtures) {
      it(`preserves invariants and counts the full output: ${fixture.name}`, () => {
        const result = compress(fixture.text, { tokenizer: t => encode(t).length, analytics: false });
        expect(result.stats.totalCompressedTokens).toBe(encode(result.compressed).length);
        expect(encode(result.compressed).length).toBeLessThanOrEqual(encode(fixture.text).length);
        for (const literal of fixture.preserve) expect(result.compressed).toContain(literal);
      });
    }
  });
}
it('preserves whitespace around code and literals', () => {
  const text = '  "utilize"\n';
  expect(compress(text, { analytics: false }).compressed).toBe(text);
});
