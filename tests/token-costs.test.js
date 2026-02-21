import { describe, it, expect } from 'vitest';
import { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS } from '../sdk/src/token-costs.js';
import { COMMON } from '../app/lib/compression/dictionaries.js';

describe('TOKEN_COSTS', () => {
  it('has entries', () => {
    expect(Object.keys(TOKEN_COSTS).length).toBeGreaterThan(100);
  });

  it('has positive integer values', () => {
    for (const [word, cost] of Object.entries(TOKEN_COSTS)) {
      expect(cost).toBeGreaterThan(0);
      expect(Number.isInteger(cost)).toBe(true);
    }
  });

  it('knows token cost for common English words', () => {
    expect(TOKEN_COSTS['function']).toBe(1);
    expect(TOKEN_COSTS['database']).toBe(1);
    expect(TOKEN_COSTS['configuration']).toBe(1);
    expect(TOKEN_COSTS['consequently']).toBe(3);
  });
});

describe('ZERO_SAVINGS', () => {
  it('contains words where abbreviation saves nothing', () => {
    expect(ZERO_SAVINGS.has('function')).toBe(true);
    expect(ZERO_SAVINGS.has('database')).toBe(true);
    expect(ZERO_SAVINGS.has('string')).toBe(true);
    expect(ZERO_SAVINGS.has('you')).toBe(true);
    expect(ZERO_SAVINGS.has('your')).toBe(true);
  });

  it('zero-savings words are NOT in the active COMMON dictionary', () => {
    for (const word of ZERO_SAVINGS) {
      // If a word is in ZERO_SAVINGS, it should NOT be in the active dictionary
      if (!word.includes(' ')) { // only check single words
        expect(Object.hasOwn(COMMON, word)).toBe(false);
      }
    }
  });
});

describe('NEGATIVE_SAVINGS', () => {
  it('contains words where abbreviation costs MORE tokens', () => {
    expect(NEGATIVE_SAVINGS.has('should')).toBe(true);
    expect(NEGATIVE_SAVINGS.has('without')).toBe(true);
    expect(NEGATIVE_SAVINGS.has('help')).toBe(true);
    expect(NEGATIVE_SAVINGS.has('provide')).toBe(true);
  });

  it('negative-savings words are NOT in the active COMMON dictionary', () => {
    for (const word of NEGATIVE_SAVINGS) {
      if (!word.includes(' ')) {
        expect(Object.hasOwn(COMMON, word)).toBe(false);
      }
    }
  });
});
