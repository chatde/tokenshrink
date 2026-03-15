import { describe, it, expect } from 'vitest';

describe('SDK public exports', () => {
  it('exports all documented functions', async () => {
    const sdk = await import('../sdk/src/index.js');

    // Core compression
    expect(typeof sdk.compress).toBe('function');
    expect(typeof sdk.detectStrategy).toBe('function');
    expect(typeof sdk.getDictionary).toBe('function');

    // Utilities
    expect(typeof sdk.countWords).toBe('function');
    expect(typeof sdk.wordsToTokens).toBe('function');
    expect(typeof sdk.tokensToDollars).toBe('function');
    expect(typeof sdk.countTokens).toBe('function');
    expect(typeof sdk.replacementTokenSavings).toBe('function');

    // Dictionaries
    expect(typeof sdk.COMMON).toBe('object');
    expect(typeof sdk.PHRASES).toBe('object');
    expect(sdk.UNIVERSAL_ABBREVIATIONS instanceof Set).toBe(true);

    // Token data
    expect(typeof sdk.TOKEN_COSTS).toBe('object');
    expect(sdk.ZERO_SAVINGS instanceof Set).toBe(true);
    expect(sdk.NEGATIVE_SAVINGS instanceof Set).toBe(true);

    // History
    expect(typeof sdk.compressHistory).toBe('function');

    // Codebook store
    expect(typeof sdk.loadProjectCodebook).toBe('function');
    expect(typeof sdk.recordSessionFires).toBe('function');
    expect(typeof sdk.getHallOfFame).toBe('function');
    expect(typeof sdk.getProjectVocab).toBe('function');
    expect(typeof sdk.pruneDeadWeight).toBe('function');
    expect(typeof sdk.processFireLog).toBe('function');

    // Domain rotors
    expect(typeof sdk.getDomainVocab).toBe('function');
    expect(typeof sdk.DOMAIN_REGISTRY).toBe('object');
  });

  it('DOMAIN_REGISTRY has all 4 domains', async () => {
    const { DOMAIN_REGISTRY } = await import('../sdk/src/index.js');

    expect(Object.keys(DOMAIN_REGISTRY).sort()).toEqual(['node', 'python', 'react', 'supabase']);
  });

  it('compress() is callable and returns expected shape', async () => {
    const { compress } = await import('../sdk/src/index.js');

    const result = compress(
      'You are responsible for building applications. It is important to consider security. In order to maintain quality, follow best practices. Due to the fact that users exist, validate input. Please make sure to test.'
    );

    expect(result).toHaveProperty('compressed');
    expect(result).toHaveProperty('rosetta');
    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('original');
  });
});
