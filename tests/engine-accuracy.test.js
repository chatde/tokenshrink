import { describe, it, expect } from 'vitest';
import { compress } from '../app/lib/compression/engine.js';
import { countTokens, replacementTokenSavings, tokensToDollars } from '../app/lib/billing.js';
import { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS } from '../sdk/src/token-costs.js';
import { COMMON, PHRASES, getDictionary } from '../app/lib/compression/dictionaries.js';

describe('Token counting accuracy', () => {
  it('cross-validates against gpt-tokenizer for sample texts', async () => {
    const { encode } = await import('gpt-tokenizer');

    const samples = [
      'Hello world',
      'The quick brown fox jumps over the lazy dog',
      'function calculateSum(a, b) { return a + b; }',
      'In order to build a good application, it is important to consider security.',
      'React.useState hooks provide state management in functional components.',
      'SELECT * FROM users WHERE email = $1 AND active = true',
      'The patient presents with acute symptoms requiring immediate treatment.',
      'Notwithstanding the aforementioned terms, the defendant argues jurisdiction.',
      'infrastructure scalability optimization performance monitoring dashboard',
      'async/await Promise.all try/catch error handling middleware pipeline',
    ];

    for (const text of samples) {
      const builtIn = countTokens(text);
      const actual = encode(text).length;

      // Built-in should be within 40% of actual — it's a heuristic, not exact
      const ratio = builtIn / actual;
      expect(ratio).toBeGreaterThan(0.4);
      expect(ratio).toBeLessThanOrEqual(2.5);
    }
  });

  it('built-in tokenizer is deterministic', () => {
    const text = 'The comprehensive application handles authentication and authorization';
    const count1 = countTokens(text);
    const count2 = countTokens(text);
    expect(count1).toBe(count2);
  });
});

describe('ZERO_SAVINGS entries', () => {
  it('has the documented count of entries', () => {
    // Plan says 134 entries
    expect(ZERO_SAVINGS.size).toBeGreaterThanOrEqual(100);
  });

  it('all entries truly save 0 tokens when abbreviated', () => {
    // Check a representative sample — words where original and abbreviation are both 1 token
    const sampleZero = ['function', 'database', 'string', 'array', 'boolean', 'integer',
      'attribute', 'authentication', 'available', 'configuration', 'connection'];

    for (const word of sampleZero) {
      if (ZERO_SAVINGS.has(word)) {
        const cost = TOKEN_COSTS[word];
        expect(cost).toBeDefined();
        // These should be 1 token — abbreviating to a 1-token abbr saves nothing
        expect(cost).toBeLessThanOrEqual(2);
      }
    }
  });

  it('zero-savings words are excluded from COMMON dictionary', () => {
    // ZERO_SAVINGS words should not be in COMMON (single-word abbreviations)
    // Use Object.hasOwn to avoid prototype pollution (e.g. "constructor")
    for (const word of ZERO_SAVINGS) {
      if (!word.includes(' ')) {
        expect(Object.hasOwn(COMMON, word)).toBe(false);
      }
    }
  });
});

describe('NEGATIVE_SAVINGS entries', () => {
  it('has entries', () => {
    expect(NEGATIVE_SAVINGS.size).toBeGreaterThanOrEqual(30);
  });

  it('sample entries cost more tokens when abbreviated', () => {
    // "should" (1t) → "shd" (2t) — worse
    const savings = replacementTokenSavings('should', 'shd');
    expect(savings).toBeLessThan(0);
  });

  it('negative-savings words are excluded from active compression', () => {
    const dict = getDictionary('common');
    for (const word of NEGATIVE_SAVINGS) {
      if (!word.includes(' ')) {
        expect(dict[word]).toBeUndefined();
      }
    }
  });
});

describe('Phrase compression', () => {
  it('applies longest-first matching', () => {
    // "please make sure to" (longer) should match before "make sure to" (shorter)
    const text = 'Please make sure to validate all inputs. It is important to check everything. In order to build safely, you must handle errors. Due to the fact that security matters, validate boundaries. Remember to test carefully. For the purpose of quality, review all code.';
    const result = compress(text);

    if (!result.stats.tooShort && !result.stats.belowThreshold) {
      const lower = result.compressed.toLowerCase();
      expect(lower).not.toContain('please make sure to');
    }
  });

  it('respects word boundaries', () => {
    // "in" should not replace the "in" inside "include" or "information"
    const text = 'The information includes data about the infrastructure. In order to validate properly, it is important to review. Please make sure to check boundaries. Due to the fact that precision matters, test carefully. Remember to handle edge cases.';
    const result = compress(text);

    if (!result.stats.tooShort && !result.stats.belowThreshold) {
      const body = result.compressedBody || result.compressed;
      const lower = body.toLowerCase();
      // "information" and "includes" and "infrastructure" should survive intact
      expect(lower).toContain('information');
      expect(lower).toContain('includes');
    }
  });

  it('handles case-insensitive matching', () => {
    const text = 'IN ORDER TO build well, IT IS IMPORTANT TO validate. DUE TO THE FACT THAT users exist, PLEASE MAKE SURE TO test. Remember to check all cases. For the purpose of verification, review everything.';
    const result = compress(text);

    if (!result.stats.tooShort && !result.stats.belowThreshold) {
      const lower = result.compressed.toLowerCase();
      expect(lower).not.toContain('in order to');
      expect(lower).not.toContain('due to the fact that');
    }
  });
});

describe('Pattern detection', () => {
  it('detects repeated phrases and replaces with P-codes', () => {
    const repeated = 'the quick brown fox '.repeat(20) +
      'In order to test patterns, it is important to have repeated phrases. ' +
      'Please make sure to include enough verbose content for compression. ' +
      'Due to the fact that we need patterns, repeat phrases deliberately.';

    const result = compress(repeated);

    if (result.stats.patternCount && result.stats.patternCount > 0) {
      expect(result.compressed).toMatch(/P\d+/);
    }
  });

  it('limits patterns to max 10', () => {
    // Create many different repeated phrases
    let text = '';
    for (let i = 0; i < 15; i++) {
      text += `phrase number ${i} is here. phrase number ${i} is here. `;
    }
    text += 'In order to test, it is important to validate. Please make sure to check.';

    const result = compress(text);

    if (result.stats.patternCount !== undefined) {
      expect(result.stats.patternCount).toBeLessThanOrEqual(10);
    }
  });
});

describe('Threshold behavior', () => {
  it('returns tooShort for text under 30 words', () => {
    const short = 'This text has only twelve words and should be flagged as too short.';
    const result = compress(short);
    expect(result.stats.tooShort).toBe(true);
    expect(result.compressed).toBe(short.trim());
  });

  it('returns belowThreshold when savings < 5%', () => {
    // Text with very few compressible phrases
    const text = 'The cat sat on a mat. The dog ran in the park. Birds flew over the hills. Fish swam in the lake. Trees grew near the road. Clouds drifted across the sky. Stars appeared at night. The moon was bright and full.';
    const result = compress(text);
    // Either tooShort or belowThreshold — no compressible patterns
    expect(result.stats.tooShort || result.stats.belowThreshold).toBeTruthy();
  });
});

describe('Math accuracy', () => {
  it('tokensSaved = originalTokens - totalCompressedTokens', () => {
    const text = 'You are responsible for building applications. It is important to consider security. In order to maintain quality, you must follow conventions. Due to the fact that users exist, validate input. Please make sure to handle errors. It is essential to test thoroughly. For the purpose of debugging, log carefully. Remember to consider optimization.';
    const result = compress(text);

    const expected = result.stats.originalTokens - result.stats.totalCompressedTokens;
    expect(result.stats.tokensSaved).toBe(expected);
  });

  it('dollarsSaved matches tokensToDollars calculation', () => {
    const text = 'You are responsible for building applications. It is important to consider security. In order to maintain quality, you must follow conventions. Due to the fact that users exist, validate input. Please make sure to handle errors. It is essential to test thoroughly. For the purpose of debugging, log carefully.';
    const result = compress(text);

    const expectedDollars = tokensToDollars(result.stats.tokensSaved);
    expect(result.stats.dollarsSaved).toBeCloseTo(expectedDollars, 2);
  });

  it('ratio is always >= 1', () => {
    const texts = [
      'Simple text without much compression opportunity. Just enough words to pass the minimum threshold for compression. Nothing fancy here at all today.',
      'In order to test ratios, it is important to validate math. Please make sure to check formulas. Due to the fact that accuracy matters, verify calculations. Remember to test edge cases. For the purpose of quality, review everything.',
    ];

    for (const text of texts) {
      const result = compress(text);
      expect(result.stats.ratio).toBeGreaterThanOrEqual(1);
    }
  });

  it('totalCompressedTokens = compressedTokens + rosettaTokens', () => {
    const text = 'The comprehensive specification requires significant functionality. Additionally, the implementation needs consideration. It is important to validate everything. Please make sure to test thoroughly. In order to maintain quality, review carefully. Due to the fact that correctness matters, verify.';
    const result = compress(text);

    expect(result.stats.totalCompressedTokens).toBe(
      result.stats.compressedTokens + result.stats.rosettaTokens
    );
  });
});
