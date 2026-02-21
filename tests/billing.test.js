import { describe, it, expect } from 'vitest';
import {
  countWords, wordsToTokens, tokensToDollars, getPlan, getCurrentPeriod,
  countTokens, replacementTokenSavings,
} from '../app/lib/billing.js';

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

describe('countTokens()', () => {
  it('counts tokens for known words using built-in lookup', () => {
    const tokens = countTokens('function database string');
    expect(tokens).toBeGreaterThan(0);
    // "function", "database", "string" are each 1 token in cl100k_base
    expect(tokens).toBe(3);
  });

  it('uses heuristic for unknown words', () => {
    const tokens = countTokens('xylophone');
    expect(tokens).toBeGreaterThan(0);
    // "xylophone" = 9 chars, ceil(9/4) = 3
    expect(tokens).toBe(3);
  });

  it('returns 0 for empty string', () => {
    expect(countTokens('')).toBe(0);
    expect(countTokens('   ')).toBe(0);
  });

  it('accepts a custom tokenizer function', () => {
    const mockTokenizer = (text) => text.length;
    expect(countTokens('hello', mockTokenizer)).toBe(5);
  });
});

describe('replacementTokenSavings()', () => {
  it('returns positive for multi-token → fewer-token replacements', () => {
    // "consequently" is 3 tokens, "so" is 1 token
    const savings = replacementTokenSavings('consequently', 'so');
    expect(savings).toBeGreaterThan(0);
  });

  it('returns 0 for equal-token replacements', () => {
    // "function" and "fn" are each 1 token
    const savings = replacementTokenSavings('function', 'fn');
    expect(savings).toBe(0);
  });

  it('returns negative for worse replacements', () => {
    // "should" (1t) → "shd" (2t)
    const savings = replacementTokenSavings('should', 'shd');
    expect(savings).toBeLessThan(0);
  });

  it('handles empty replacement', () => {
    const savings = replacementTokenSavings('you should', '');
    expect(savings).toBeGreaterThan(0);
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
