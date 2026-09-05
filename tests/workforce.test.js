import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readSource } from '../scripts/workforce-review.mjs';

describe('workforce source boundary', () => {
  it('rejects environment files and traversal before reading', () => {
    for (const file of ['.env.production.local', 'sdk/src/../../.env', '/tmp/test.js', 'app/api/auth.js']) {
      expect(() => readSource(file)).toThrow('Only explicit');
    }
  });
  it('allows explicit source, but blocks credential patterns, oversized files and symlinks', () => {
    const base = mkdtempSync(path.join(tmpdir(), 'workforce-'));
    try {
      mkdirSync(path.join(base, 'sdk/src'), { recursive: true });
      const file = path.join(base, 'sdk/src/example.js');
      writeFileSync(file, 'export const example = true;');
      expect(readSource('sdk/src/example.js', base)).toContain('example');
      symlinkSync(file, path.join(base, 'sdk/src/link.js'));
      expect(() => readSource('sdk/src/link.js', base)).toThrow('Symlinks');
      writeFileSync(file, 'sk_live_abcdefghijklmnop');
      expect(() => readSource('sdk/src/example.js', base)).toThrow('Possible credential');
      writeFileSync(file, 'x'.repeat(12001));
      expect(() => readSource('sdk/src/example.js', base)).toThrow('12,000');
    } finally { rmSync(base, { recursive: true, force: true }); }
  });
});
