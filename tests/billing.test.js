import { describe, it, expect } from 'vitest';
import { countWords, wordsToTokens, tokensToDollars, getPlan, getCurrentPeriod } from '../app/lib/billing.js';

describe('countWords()', () => {
  it('counts words correctly', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('one two three four five')).toBe(5);
    expect(countWords('  spaced   out  ')).toBe(2);
  });

  it('handles empty string', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });
});

describe('wordsToTokens()', () => {
  it('converts words to approximate token count', () => {
    expect(wordsToTokens(100)).toBe(130); // 100 * 1.3
    expect(wordsToTokens(0)).toBe(0);
  });
});

describe('tokensToDollars()', () => {
  it('calculates cost correctly', () => {
    expect(tokensToDollars(1000)).toBeCloseTo(0.005);
    expect(tokensToDollars(10000)).toBeCloseTo(0.05);
    expect(tokensToDollars(0)).toBe(0);
  });
});

describe('getPlan()', () => {
  it('returns free plan', () => {
    const plan = getPlan('free');
    expect(plan.name).toBe('Free');
    expect(plan.price).toBe(0);
    expect(plan.wordsPerMonth).toBeGreaterThan(0);
  });

  it('defaults to free for unknown plan', () => {
    const plan = getPlan('nonexistent');
    expect(plan.name).toBe('Free');
  });
});

describe('getCurrentPeriod()', () => {
  it('returns YYYY-MM format', () => {
    const period = getCurrentPeriod();
    expect(period).toMatch(/^\d{4}-\d{2}$/);
  });
});
