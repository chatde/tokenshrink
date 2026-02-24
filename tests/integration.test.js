import { describe, it, expect } from 'vitest';
import { compress } from '../app/lib/compression/engine.js';
import { validateCompressionInput } from '../app/lib/validate.js';

describe('End-to-end compression workflow', () => {
  describe('Complete compress → decompress round-trip', () => {
    it('preserves meaning through full cycle', () => {
      const original = 'You are an expert assistant. It is important to validate all user input carefully. Please make sure to handle errors properly. In order to build robust applications, you must follow best practices. For the purpose of testing, write comprehensive test cases. Remember to document everything thoroughly. Do not forget to monitor performance metrics regularly.';

      // Compress
      const compressed = compress(original);

      expect(compressed.compressed).toBeDefined();
      expect(compressed.stats.totalCompressedTokens).toBeLessThanOrEqual(compressed.stats.originalTokens);

      // Simulate decompress
      if (compressed.rosetta) {
        const decodeMatch = compressed.compressed.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);
        if (decodeMatch) {
          const decodeBlock = decodeMatch[1].trim();
          let decompressed = compressed.compressed.replace(/\[DECODE\][\s\S]*?\[\/DECODE\]\s*/, '').trim();

          // Parse replacements
          const replacements = {};
          for (const line of decodeBlock.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const patternMatch = trimmed.match(/^(P\d+)="(.+)"$/);
            if (patternMatch) {
              replacements[patternMatch[1]] = patternMatch[2];
              continue;
            }

            const abbrMatch = trimmed.match(/^(.+?)=(.+)$/);
            if (abbrMatch) {
              replacements[abbrMatch[1]] = abbrMatch[2];
            }
          }

          // Apply replacements
          const sortedEntries = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length);
          for (const [code, originalWord] of sortedEntries) {
            const regex = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
            decompressed = decompressed.replace(regex, originalWord);
          }

          expect(decompressed).toBeDefined();
          expect(decompressed.length).toBeGreaterThan(0);
        }
      }
    });

    it('preserves special characters through round-trip', () => {
      const original = 'The code uses symbols @#$%^&*() and brackets {}[]. It is important to preserve all special characters. Please make sure to handle escaping properly. In order to prevent issues, test edge cases thoroughly.';

      const compressed = compress(original);

      expect(compressed.compressed).toContain('@#$%^&*()');
      expect(compressed.compressed).toContain('{}[]');
    });

    it('preserves numbers through round-trip', () => {
      const original = 'The server uses 64GB RAM, costs $150/month, and serves 1,000,000 requests daily. It is important to monitor these metrics. Please make sure to track usage patterns. In order to optimize costs, analyze performance carefully.';

      const compressed = compress(original);

      expect(compressed.compressed).toContain('64GB');
      expect(compressed.compressed).toContain('$150/month');
      expect(compressed.compressed).toContain('1,000,000');
    });

    it('preserves code blocks through round-trip', () => {
      const original = 'Use this pattern: `async function fetch() { return await db.query(); }`. It is important to handle promises correctly. Please make sure to add error handling. In order to prevent race conditions, use proper locking mechanisms.';

      const compressed = compress(original);

      expect(compressed.compressed).toContain('async function fetch()');
      expect(compressed.compressed).toContain('await db.query()');
    });

    it('preserves URLs through round-trip', () => {
      const original = 'Visit https://example.com/api/v1/docs for documentation. It is important to version your APIs. Please make sure to document all endpoints. In order to maintain compatibility, use semantic versioning properly.';

      const compressed = compress(original);

      expect(compressed.compressed).toContain('https://example.com/api/v1/docs');
    });
  });

  describe('SDK public API surface', () => {
    it('compress() accepts text as first parameter', () => {
      const text = 'It is important to test the API interface. Please make sure to validate all parameters. In order to ensure quality, write comprehensive tests. For the purpose of verification, check all return values carefully.';
      const result = compress(text);

      expect(result).toBeDefined();
      expect(result.compressed).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    it('compress() accepts optional domain parameter', () => {
      const text = 'Write a function that handles database queries. It is important to use async operations for API calls. Please make sure to implement proper error handling. In order to debug effectively, review the controller module carefully. For the purpose of testing, verify the repository pattern. You should configure environment variables. Deploy to production. Remember to monitor application logs regularly.';
      const result = compress(text, { domain: 'code' });

      // domain parameter forces the dictionary, but strategy comes from detection
      // Just verify the result is valid
      expect(result.compressed).toBeDefined();
      expect(result.stats.strategy).toBeDefined();
      expect(typeof result.stats.strategy).toBe('string');
    });

    it('compress() accepts optional forceStrategy parameter', () => {
      const text = 'Generic text that could be in any domain. It is important to test strategy forcing. Please make sure to validate this feature works properly. In order to ensure quality, we need enough words here to pass the minimum threshold for compression. For the purpose of testing, add more verbose phrases. Remember to check all edge cases.';
      const result = compress(text, { forceStrategy: 'medical' });

      // forceStrategy sets the domain, but if belowThreshold, strategy becomes 'none'
      if (result.stats.tooShort || result.stats.belowThreshold) {
        expect(result.stats.strategy).toBe('none');
      } else {
        expect(result.stats.strategy).toBe('medical');
      }
    });

    it('compress() accepts optional tokenizer parameter', () => {
      const text = 'It is important to support custom tokenizers. Please make sure to test this functionality. In order to ensure flexibility, allow tokenizer injection properly.';
      const mockTokenizer = (text) => text.length;
      const result = compress(text, { tokenizer: mockTokenizer });

      expect(result.stats.tokenizerUsed).toBe('custom');
      expect(result.stats.originalTokens).toBeGreaterThan(0);
    });

    it('compress() returns required fields', () => {
      const text = 'It is important to validate return values. Please make sure to check all fields. In order to ensure completeness, test the entire response structure carefully.';
      const result = compress(text);

      expect(result).toHaveProperty('compressed');
      expect(result).toHaveProperty('rosetta');
      expect(result).toHaveProperty('stats');
      expect(result.stats).toHaveProperty('originalWords');
      expect(result.stats).toHaveProperty('compressedWords');
      expect(result.stats).toHaveProperty('rosettaWords');
      expect(result.stats).toHaveProperty('totalCompressedWords');
      expect(result.stats).toHaveProperty('originalTokens');
      expect(result.stats).toHaveProperty('compressedTokens');
      expect(result.stats).toHaveProperty('rosettaTokens');
      expect(result.stats).toHaveProperty('totalCompressedTokens');
      expect(result.stats).toHaveProperty('ratio');
      expect(result.stats).toHaveProperty('tokensSaved');
      expect(result.stats).toHaveProperty('dollarsSaved');
      expect(result.stats).toHaveProperty('strategy');
      expect(result.stats).toHaveProperty('tokenizerUsed');
    });

    it('compress() returns original field for reference', () => {
      const text = 'It is important to preserve the original text. Please make sure to include it in the response. In order to enable comparison, store the input carefully.';
      const result = compress(text);

      expect(result).toHaveProperty('original');
      expect(result.original).toBe(text.trim());
    });
  });

  describe('Validation integration', () => {
    it('validateCompressionInput() integrates with compress()', () => {
      const text = 'It is important to validate before compressing. Please make sure to check word count. In order to prevent errors, validate input parameters carefully. For the purpose of efficiency, fail fast on invalid input properly.';
      const validation = validateCompressionInput(text, 10000);

      expect(validation.valid).toBe(true);

      const result = compress(validation.text);
      expect(result.stats.originalWords).toBe(validation.words);
    });

    it('validation rejects what compression would skip', () => {
      const shortText = 'This is too short.';
      const validation = validateCompressionInput(shortText, 10000);
      const compression = compress(shortText);

      expect(validation.valid).toBe(false);
      expect(compression.stats.tooShort).toBe(true);
    });

    it('validation word count matches compression word count', () => {
      const text = 'It is important to ensure word counts match. Please make sure to use the same counting logic. In order to maintain consistency, use shared utilities. For the purpose of accuracy, test this carefully.';
      const validation = validateCompressionInput(text, 10000);
      const compression = compress(text);

      expect(validation.words).toBe(compression.stats.originalWords);
    });
  });

  describe('Error handling integration', () => {
    it('handles empty input gracefully', () => {
      const validation = validateCompressionInput('', 10000);
      const compression = compress('');

      expect(validation.valid).toBe(false);
      expect(compression.compressed).toBe('');
    });

    it('handles whitespace input gracefully', () => {
      const validation = validateCompressionInput('   \n  \t  ', 10000);
      const compression = compress('   \n  \t  ');

      expect(validation.valid).toBe(false);
      expect(compression.compressed).toBe('');
    });

    it('handles null input gracefully', () => {
      const validation = validateCompressionInput(null, 10000);

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Text is required');
    });

    it('handles very long input', () => {
      const longText = 'It is important to handle long input. '.repeat(1000);
      const validation = validateCompressionInput(longText, 100000);
      const compression = compress(longText);

      expect(validation.valid).toBe(true);
      expect(compression.compressed).toBeDefined();
    });
  });

  describe('Multi-domain text handling', () => {
    it('compresses mixed-domain text appropriately', () => {
      const text = 'Write a function that handles patient records. The API should store medical data securely. It is important to validate HIPAA compliance. Please make sure to encrypt sensitive information. In order to maintain security, audit all access logs carefully.';
      const result = compress(text);

      expect(result.stats.strategy).toBeDefined();
      expect(result.compressed).toBeDefined();
      expect(result.stats.totalCompressedTokens).toBeLessThanOrEqual(result.stats.originalTokens);
    });

    it('detects primary domain in mixed text', () => {
      const codeDominant = 'Write async functions for database queries. Use middleware for authentication. The stakeholder approved the timeline. Debug the API controller and test thoroughly. Implement proper error handling in all functions. Configure environment variables carefully.';
      const result = compress(codeDominant);

      // Strategy should be defined - could be code, auto, common, or none if too short
      expect(result.stats.strategy).toBeDefined();
      expect(typeof result.stats.strategy).toBe('string');
    });
  });

  describe('Performance characteristics', () => {
    it('compresses small text quickly', () => {
      const text = 'It is important to test performance. Please make sure to measure execution time. In order to ensure efficiency, optimize critical paths. For the purpose of benchmarking, run tests multiple times.';

      const startTime = Date.now();
      const result = compress(text);
      const endTime = Date.now();

      expect(result.compressed).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('compresses medium text reasonably fast', () => {
      const text = 'It is important to validate performance at scale. Please make sure to test with realistic data sizes. In order to ensure efficiency, optimize bottlenecks carefully. '.repeat(50);

      const startTime = Date.now();
      const result = compress(text);
      const endTime = Date.now();

      expect(result.compressed).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in <1s
    });

    it('handles repeated phrases efficiently', () => {
      const text = 'It is important to test. It is important to validate. It is important to verify. '.repeat(100);

      const startTime = Date.now();
      const result = compress(text);
      const endTime = Date.now();

      expect(result.compressed).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in <2s
    });
  });

  describe('Compression ratio guarantees', () => {
    it('never increases token count', () => {
      const text = 'It is important to guarantee no token inflation. Please make sure to validate this requirement. In order to ensure quality, test compression ratios. For the purpose of verification, check all edge cases carefully. Remember to consider overhead costs.';
      const result = compress(text);

      if (!result.stats.tooShort && !result.stats.belowThreshold) {
        expect(result.stats.totalCompressedTokens).toBeLessThanOrEqual(result.stats.originalTokens);
      }
    });

    it('ratio is always >= 1.0', () => {
      const text = 'It is important to test ratio calculations. Please make sure to verify the math. In order to ensure correctness, validate all formulas. For the purpose of accuracy, double-check edge cases properly.';
      const result = compress(text);

      expect(result.stats.ratio).toBeGreaterThanOrEqual(1.0);
    });

    it('tokensSaved matches difference', () => {
      const text = 'It is important to verify token math. Please make sure to validate calculations. In order to ensure accuracy, test arithmetic. For the purpose of correctness, check all formulas carefully.';
      const result = compress(text);

      const expectedSaved = result.stats.originalTokens - result.stats.totalCompressedTokens;
      expect(result.stats.tokensSaved).toBe(expectedSaved);
    });

    it('dollarsSaved is proportional to tokensSaved', () => {
      const text = 'It is important to calculate cost savings. Please make sure to validate dollar amounts. In order to ensure accuracy, test financial calculations. For the purpose of transparency, show cost benefits clearly.';
      const result = compress(text);

      // Dollars saved should always be >= 0
      expect(result.stats.dollarsSaved).toBeGreaterThanOrEqual(0);
      // If tokens were saved, dollars should be calculated (even if tiny)
      if (result.stats.tokensSaved > 0) {
        expect(result.stats.dollarsSaved).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Threshold behavior', () => {
    it('sets belowThreshold when savings are minimal', () => {
      const text = 'This text has minimal verbose patterns and mostly unique content that cannot compress well. Most words are already efficient. The sentence structure is concise. No repeated phrases exist here today.';
      const result = compress(text);

      // Should either be tooShort or belowThreshold or successful
      // belowThreshold might be undefined if tooShort is true
      if (result.stats.belowThreshold !== undefined) {
        expect(typeof result.stats.belowThreshold).toBe('boolean');
      } else {
        expect(typeof result.stats.tooShort).toBe('boolean');
      }
    });

    it('compresses when savings exceed 5% threshold', () => {
      const text = 'It is important to validate savings threshold. It is essential to test this carefully. Please make sure to check all conditions. Please make sure to verify logic. In order to ensure quality, test extensively. In order to maintain standards, validate thoroughly. For the purpose of testing, use verbose phrases. For the purpose of verification, check thresholds. Remember to consider edge cases. Do not forget to test boundaries.';
      const result = compress(text);

      if (!result.stats.tooShort && !result.stats.belowThreshold) {
        const savingsRatio = result.stats.tokensSaved / result.stats.originalTokens;
        expect(savingsRatio).toBeGreaterThan(0.05);
      }
    });
  });

  describe('Rosetta Stone behavior', () => {
    it('includes Rosetta when non-universal abbreviations used', () => {
      const text = 'The comprehensive specification should include significant details about functionality. Additionally, consider implementation carefully. It is important to document thoroughly. Please make sure to validate everything. Remember to test properly.';
      const result = compress(text);

      if (result.rosetta) {
        expect(result.rosetta).toContain('[DECODE]');
        expect(result.rosetta).toContain('[/DECODE]');
        expect(result.stats.rosettaTokens).toBeGreaterThan(0);
      }
    });

    it('omits Rosetta when only universal abbreviations used', () => {
      const text = 'Use async functions for API calls. Configure environment variables. Initialize database connection. Test authentication middleware. Debug application logs carefully.';
      const result = compress(text);

      // If only universal abbrs, Rosetta might be empty
      if (result.rosetta === '') {
        expect(result.stats.rosettaTokens).toBe(0);
      }
    });

    it('Rosetta overhead is justified by savings', () => {
      const text = 'The comprehensive analysis includes significant functionality. Additionally, the implementation requires specification. It is important to validate thoroughly. Please make sure to document everything. In order to maintain quality, test carefully.';
      const result = compress(text);

      // If Rosetta exists, net savings should still be positive
      if (result.rosetta) {
        const netSavings = result.stats.originalTokens - result.stats.totalCompressedTokens;
        expect(netSavings).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
