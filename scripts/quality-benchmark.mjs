import { readFileSync, writeFileSync } from 'node:fs';
import { encode as cl100k } from 'gpt-tokenizer/encoding/cl100k_base';
import { encode as o200k } from 'gpt-tokenizer/encoding/o200k_base';
import { compress } from '../sdk/src/engine.js';
const fixtures = JSON.parse(readFileSync(new URL('../benchmarks/quality-fixtures.json', import.meta.url)));
const results = [];
for (const [encoding, encode] of Object.entries({ cl100k, o200k })) {
  for (const fixture of fixtures) {
    const tokenizer = text => encode(text).length;
    const result = compress(fixture.text, { tokenizer, analytics: false });
    const before = tokenizer(fixture.text);
    const after = tokenizer(result.compressed);
    results.push({ encoding, name: fixture.name, before, after,
      savingsPercent: Number(((before - after) / before * 100).toFixed(2)),
      accountingCorrect: result.stats.totalCompressedTokens === after,
      missingInvariants: fixture.preserve.filter(value => !result.compressed.includes(value)),
      output: result.compressed });
  }
}
const report = { scope: 'Synthetic diagnostic fixtures. Invariants test literal preservation, not downstream model answer quality. No model API calls.', results };
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n');
console.table(results.map(({ output, missingInvariants, ...row }) => ({ ...row, missingInvariants: missingInvariants.length })));
