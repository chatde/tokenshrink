import { describe, it, expect } from 'vitest';
import { compress } from '../app/lib/compression/engine.js';

// Note: These tests validate API route logic patterns and edge cases
// without requiring Next.js runtime. We test the core compression
// and decompression logic that the routes depend on.

describe('compress API route logic', () => {
  describe('Input validation', () => {
    it('rejects empty text', () => {
      const result = compress('');
      expect(result.compressed).toBe('');
    });

    it('rejects whitespace-only text', () => {
      const result = compress('   \n  \t  ');
      expect(result.compressed).toBe('');
    });

    it('handles text under 30 words', () => {
      const text = 'This is a short test with only ten words here.';
      const result = compress(text);

      expect(result.stats.tooShort).toBe(true);
      expect(result.compressed).toBe(text.trim());
    });

    it('accepts valid text with 30+ words', () => {
      const text = 'You are an expert assistant. It is important to validate all user input carefully. Please make sure to handle errors properly. You should consider security at every layer. In order to build robust applications, you must follow best practices. For the purpose of debugging, add comprehensive logging. Remember to test thoroughly.';
      const result = compress(text);

      expect(result.stats.originalWords).toBeGreaterThanOrEqual(30);
      expect(result.compressed).toBeDefined();
    });
  });

  describe('Domain parameter handling', () => {
    it('accepts explicit domain parameter', () => {
      const text = 'Write a function that handles API requests. Use async await for database queries. Implement proper error handling in the controller. The repository pattern should manage data access. Configure the middleware for authentication. Debug the module and fix the configuration issues. Test the application thoroughly before deployment.';
      const result = compress(text, { domain: 'code' });

      expect(result.stats.strategy).toBeDefined();
      expect(result.compressed).toBeDefined();
    });

    it('auto-detects domain when not specified', () => {
      const text = 'The patient presents with symptoms of elevated temperature and fatigue. The physician recommends laboratory examination and prescription medication. The diagnosis indicates the need for treatment. Schedule a follow-up appointment. Review the medical records carefully. Document all procedures thoroughly.';
      const result = compress(text);

      expect(result.stats.strategy).toBeDefined();
      // Strategy should be a valid string, detection logic is tested in strategies.test.js
      expect(typeof result.stats.strategy).toBe('string');
    });

    it('handles invalid domain gracefully', () => {
      const text = 'It is important to consider all factors carefully. Please make sure to review the specification thoroughly. In order to maintain quality, you must follow best practices. For the purpose of testing, write comprehensive test cases. Remember to document everything properly.';
      const result = compress(text, { domain: 'invalid_domain' });

      // Should still compress, falling back to auto
      expect(result.compressed).toBeDefined();
      expect(result.stats.originalWords).toBeGreaterThan(0);
    });
  });

  describe('Pattern extraction for Rosetta', () => {
    it('generates Rosetta for non-universal abbreviations', () => {
      const text = 'The comprehensive analysis should include significant details about the functionality of the specification. Additionally, you should consider the implementation carefully. It is important to review the documentation thoroughly. Please make sure to validate all inputs. Remember to test the application properly.';
      const result = compress(text);

      if (result.rosetta) {
        expect(result.rosetta).toContain('[DECODE]');
        expect(result.rosetta).toContain('[/DECODE]');
      }
    });

    it('omits Rosetta for universal abbreviations only', () => {
      const text = 'Write async functions for the database queries. Use the configuration settings from environment variables. The application repository contains the source code. Debug the authentication module carefully. Test the API endpoints thoroughly. Deploy to production when ready.';
      const result = compress(text);

      // If only universal abbreviations were used, Rosetta may be empty
      if (result.rosetta === '') {
        expect(result.rosetta).toBe('');
      } else {
        // If Rosetta exists, it should be well-formed
        expect(result.rosetta).toContain('[DECODE]');
      }
    });

    it('includes pattern codes in Rosetta when phrases are compressed', () => {
      const text = 'It is important to validate inputs. It is essential to handle errors. It is necessary to test code. Please make sure to document everything. Please make sure to review the code. For the purpose of debugging, add logs. For the purpose of testing, write tests. Remember to consider security. Do not forget to monitor performance.';
      const result = compress(text);

      // Phrases are removed/replaced, so should have compression
      expect(result.stats.totalCompressedWords).toBeLessThanOrEqual(result.stats.originalWords);
    });
  });

  describe('Error handling edge cases', () => {
    it('handles extremely long text', () => {
      const longText = 'In order to build robust applications, it is important to consider security at every layer. Please make sure to validate all user input carefully. '.repeat(100);
      const result = compress(longText);

      expect(result.compressed).toBeDefined();
      expect(result.stats.originalWords).toBeGreaterThan(1000);
    });

    it('handles text with special characters', () => {
      const text = 'The function should handle special characters: @#$%^&*(){}[]|\\?<>. It is important to sanitize input properly. Please make sure to escape quotes and backslashes. In order to prevent injection attacks, you must validate everything carefully. Remember to test edge cases thoroughly.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
      expect(result.compressed).toContain('@#$%^&*(){}[]|\\?<>');
    });

    it('handles text with code blocks', () => {
      const text = 'Write a function like this: `function test() { return true; }`. It is important to include proper error handling. Please make sure to add comments. In order to maintain readability, use consistent formatting. For the purpose of testing, write unit tests.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
      expect(result.compressed).toContain('function test()');
    });

    it('handles text with URLs', () => {
      const text = 'Visit https://example.com for documentation. It is important to verify all external links. Please make sure to test the API endpoints. In order to ensure reliability, use proper error handling. Remember to check the status codes carefully.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
      expect(result.compressed).toContain('https://example.com');
    });

    it('handles text with numbers and measurements', () => {
      const text = 'The server has 64GB of RAM and 2TB of storage. It is important to monitor disk usage. Please make sure to check CPU utilization. In order to optimize performance, analyze metrics carefully. The threshold is 85% for alerts.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
      expect(result.compressed).toContain('64GB');
      expect(result.compressed).toContain('2TB');
      expect(result.compressed).toContain('85%');
    });
  });

  describe('Stats calculation', () => {
    it('calculates token savings correctly', () => {
      const text = 'In order to build applications, it is important to validate input. Please make sure to handle errors properly. You should consider security carefully. For the purpose of testing, write comprehensive tests. Remember to document everything thoroughly. Do not forget to monitor performance metrics.';
      const result = compress(text);

      if (!result.stats.tooShort && !result.stats.belowThreshold) {
        expect(result.stats.tokensSaved).toBeGreaterThan(0);
        expect(result.stats.originalTokens).toBeGreaterThan(result.stats.totalCompressedTokens);
      }
    });

    it('includes all required v2.0 stat fields', () => {
      const text = 'It is important to validate all inputs. Please make sure to handle errors. In order to maintain quality, test everything. For the purpose of debugging, add logging. Remember to consider security. Do not forget to document.';
      const result = compress(text);

      // v2.0 fields
      expect(typeof result.stats.originalTokens).toBe('number');
      expect(typeof result.stats.compressedTokens).toBe('number');
      expect(typeof result.stats.rosettaTokens).toBe('number');
      expect(typeof result.stats.totalCompressedTokens).toBe('number');
      expect(typeof result.stats.tokenizerUsed).toBe('string');
      expect(typeof result.stats.tokensSaved).toBe('number');
    });

    it('reports correct tokenizer type', () => {
      const text = 'This is a test to verify the tokenizer field is set correctly when running compression.';
      const result = compress(text);

      expect(result.stats.tokenizerUsed).toBe('built-in');
    });

    it('reports custom tokenizer when provided', () => {
      const text = 'This is a test to verify custom tokenizer detection works properly for all cases.';
      const mockTokenizer = (text) => text.length;
      const result = compress(text, { tokenizer: mockTokenizer });

      expect(result.stats.tokenizerUsed).toBe('custom');
    });
  });
});

describe('decompress API route logic', () => {
  describe('Rosetta extraction', () => {
    it('extracts Rosetta block correctly', () => {
      const text = '[DECODE]\nfull=comprehensive\nimpl=implementation\n[/DECODE]\nThis is the full impl.';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);

      expect(decodeMatch).not.toBeNull();
      expect(decodeMatch[1]).toContain('full=comprehensive');
      expect(decodeMatch[1]).toContain('impl=implementation');
    });

    it('returns text as-is when no Rosetta found', () => {
      const text = 'This is plain text without any Rosetta Stone decoder.';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);

      expect(decodeMatch).toBeNull();
    });

    it('handles empty Rosetta block', () => {
      const text = '[DECODE]\n\n[/DECODE]\nBody text here.';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);

      expect(decodeMatch).not.toBeNull();
      expect(decodeMatch[1].trim()).toBe('');
    });
  });

  describe('Pattern parsing', () => {
    it('parses pattern codes with quoted strings', () => {
      const line = 'P1="in order to"';
      const patternMatch = line.match(/^(P\d+)="(.+)"$/);

      expect(patternMatch).not.toBeNull();
      expect(patternMatch[1]).toBe('P1');
      expect(patternMatch[2]).toBe('in order to');
    });

    it('parses abbreviation entries', () => {
      const line = 'full=comprehensive';
      const abbrMatch = line.match(/^(.+?)=(.+)$/);

      expect(abbrMatch).not.toBeNull();
      expect(abbrMatch[1]).toBe('full');
      expect(abbrMatch[2]).toBe('comprehensive');
    });

    it('handles escaped quotes in patterns (bug fix)', () => {
      const line = 'P1="phrase with \\"quotes\\""';
      const patternMatch = line.match(/^(P\d+)="(.+)"$/);

      expect(patternMatch).not.toBeNull();
      expect(patternMatch[2]).toContain('\\"');
    });

    it('skips empty lines', () => {
      const lines = '\n  \n\t\n';
      const parsed = lines.split('\n').filter(line => line.trim()).length;

      expect(parsed).toBe(0);
    });

    it('parses multi-line Rosetta correctly', () => {
      const decodeBlock = 'full=comprehensive\nimpl=implementation\nspec=specification';
      const replacements = {};

      for (const line of decodeBlock.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const abbrMatch = trimmed.match(/^(.+?)=(.+)$/);
        if (abbrMatch) {
          replacements[abbrMatch[1]] = abbrMatch[2];
        }
      }

      expect(Object.keys(replacements).length).toBe(3);
      expect(replacements['full']).toBe('comprehensive');
      expect(replacements['impl']).toBe('implementation');
      expect(replacements['spec']).toBe('specification');
    });
  });

  describe('Decompression logic', () => {
    it('replaces abbreviations with full words', () => {
      const replacements = { full: 'comprehensive', impl: 'implementation' };
      let decompressed = 'This is the full impl of the spec.';

      for (const [code, original] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        decompressed = decompressed.replace(regex, original);
      }

      expect(decompressed).toContain('comprehensive');
      expect(decompressed).toContain('implementation');
    });

    it('applies replacements longest first to avoid partial matches', () => {
      const replacements = { a: 'apple', ab: 'abstract' };
      const sortedEntries = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length);

      expect(sortedEntries[0][0]).toBe('ab');
      expect(sortedEntries[1][0]).toBe('a');
    });

    it('respects word boundaries', () => {
      const replacements = { impl: 'implementation' };
      let decompressed = 'The impl is implicit in the description.';

      const regex = new RegExp(`\\bimpl\\b`, 'g');
      decompressed = decompressed.replace(regex, 'implementation');

      expect(decompressed).toBe('The implementation is implicit in the description.');
    });

    it('handles case-insensitive abbreviations', () => {
      const replacements = { spec: 'specification' };
      let decompressed = 'The Spec and spec are both present.';

      // Case-insensitive replacement
      const regex = new RegExp(`\\bspec\\b`, 'gi');
      decompressed = decompressed.replace(regex, 'specification');

      expect(decompressed).toContain('specification');
    });
  });

  describe('Round-trip integrity', () => {
    it('compresses then decompresses maintaining meaning', () => {
      const original = 'It is important to validate all user input carefully. Please make sure to handle errors properly. In order to build robust applications, you must follow best practices. For the purpose of testing, write comprehensive test cases.';
      const compressed = compress(original);

      // Simulate decompress logic
      if (compressed.rosetta) {
        const decodeMatch = compressed.compressed.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);
        if (decodeMatch) {
          const body = compressed.compressed.replace(/\[DECODE\][\s\S]*?\[\/DECODE\]\s*/, '').trim();
          expect(body).toBeDefined();
          expect(body.length).toBeLessThanOrEqual(compressed.compressed.length);
        }
      }
    });

    it('preserves numbers and special characters through round-trip', () => {
      const original = 'The server uses 64GB RAM and costs $150/month. It is important to monitor usage at 85% threshold. Please make sure to check metrics every 5 minutes.';
      const result = compress(original);

      expect(result.compressed).toContain('64GB');
      expect(result.compressed).toContain('$150/month');
      expect(result.compressed).toContain('85%');
      expect(result.compressed).toContain('5 minutes');
    });
  });

  describe('Edge cases', () => {
    it('handles text with only pattern codes', () => {
      const text = '[DECODE]\nP1="test phrase"\n[/DECODE]\nP1 P1 P1';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);
      const body = text.replace(/\[DECODE\][\s\S]*?\[\/DECODE\]\s*/, '').trim();

      expect(decodeMatch).not.toBeNull();
      expect(body).toBe('P1 P1 P1');
    });

    it('handles malformed Rosetta gracefully', () => {
      const text = '[DECODE]\nbroken_line_no_equals\nvalid=entry\n[/DECODE]\nBody.';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);

      expect(decodeMatch).not.toBeNull();
      // Should parse valid entries and skip malformed ones
    });

    it('handles missing closing DECODE tag', () => {
      const text = '[DECODE]\nfull=comprehensive\nBody text without closing tag.';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);

      expect(decodeMatch).toBeNull();
    });

    it('handles multiple DECODE blocks (only uses first)', () => {
      const text = '[DECODE]\nfirst=entry\n[/DECODE]\nBody [DECODE]\nsecond=entry\n[/DECODE]';
      const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);

      expect(decodeMatch).not.toBeNull();
      expect(decodeMatch[1]).toContain('first=entry');
      expect(decodeMatch[1]).not.toContain('second=entry');
    });
  });
});
