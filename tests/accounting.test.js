import { it, expect } from 'vitest';
import { compressionRecordQuery } from '../app/lib/record-compression.js';
import { getCurrentPeriod } from '../app/lib/billing.js';

it('uses the UTC billing month across local timezone boundaries', () => {
  expect(getCurrentPeriod(new Date('2026-08-31T20:00:00-07:00'))).toBe('2026-09');
  expect(getCurrentPeriod(new Date('2026-09-01T01:00:00+08:00'))).toBe('2026-08');
});
it('rejects inconsistent accounting before any SQL execution', () => {
  expect(() => compressionRecordQuery({ stats: { originalTokens: 100, totalCompressedTokens: 80, tokensSaved: 30 } })).toThrow('Invalid compression accounting');
});
