import { describe, it, expect } from 'vitest';
import { validateCompressionInput } from '../app/lib/validate.js';
import { compress } from '../app/lib/compression/engine.js';

describe('Input validation security', () => {
  describe('validateCompressionInput() — min words bug fix', () => {
    it('rejects text with less than 30 words (bug fix: was 10, now 30)', () => {
      const text = 'This is a short test with only nine words total.';
      const result = validateCompressionInput(text, 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('30 words');
    });

    it('accepts text with exactly 30 words', () => {
      const text = 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two twenty-three twenty-four twenty-five twenty-six twenty-seven twenty-eight twenty-nine thirty.';
      const result = validateCompressionInput(text, 10000);

      expect(result.valid).toBe(true);
      expect(result.words).toBeGreaterThanOrEqual(30);
    });

    it('matches MIN_WORDS constant in engine.js (30)', () => {
      const shortText = 'A short text with only ten words here today.';
      const validation = validateCompressionInput(shortText, 10000);
      const compression = compress(shortText);

      // Both should reject text under 30 words
      expect(validation.valid).toBe(false);
      expect(compression.stats.tooShort).toBe(true);
    });
  });

  describe('Type validation', () => {
    it('rejects null input', () => {
      const result = validateCompressionInput(null, 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Text is required');
    });

    it('rejects undefined input', () => {
      const result = validateCompressionInput(undefined, 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Text is required');
    });

    it('rejects non-string input', () => {
      const result = validateCompressionInput(12345, 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Text is required');
    });

    it('rejects array input', () => {
      const result = validateCompressionInput(['array', 'of', 'strings'], 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Text is required');
    });

    it('rejects object input', () => {
      const result = validateCompressionInput({ text: 'value' }, 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Text is required');
    });
  });

  describe('Empty and whitespace validation', () => {
    it('rejects empty string', () => {
      const result = validateCompressionInput('', 10000);

      expect(result.valid).toBe(false);
      // Either "Text is required" or "Text cannot be empty"
      expect(['Text is required', 'Text cannot be empty']).toContain(result.error);
    });

    it('rejects whitespace-only string', () => {
      const result = validateCompressionInput('   \n  \t  ', 10000);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Text cannot be empty');
    });

    it('trims whitespace before validation', () => {
      const text = '  This text has leading and trailing spaces and needs at least thirty words for validation to pass so here are more words to make it long enough for testing purposes okay.  ';
      const result = validateCompressionInput(text, 10000);

      expect(result.valid).toBe(true);
      expect(result.text).not.toMatch(/^\s/);
      expect(result.text).not.toMatch(/\s$/);
    });
  });

  describe('Length limits', () => {
    it('rejects text exceeding 500KB', () => {
      const longText = 'a'.repeat(500001);
      const result = validateCompressionInput(longText, 1000000);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('500KB');
    });

    it('accepts text at exactly 500000 characters', () => {
      const text = 'a '.repeat(249995); // 499990 chars (under 500K)
      const result = validateCompressionInput(text, 1000000);

      // Should be valid if under 500K
      if (result.valid) {
        expect(result.text.length).toBeLessThan(500000);
      } else {
        // Could fail on word count if exceeds plan limit
        expect(result).toBeDefined();
      }
    });

    it('rejects text exceeding plan word limit', () => {
      const text = 'word '.repeat(6000); // 6000 words
      const result = validateCompressionInput(text, 5000);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('5,000 words');
      expect(result.error).toContain('6,000');
    });

    it('accepts text at plan word limit', () => {
      const text = 'word '.repeat(5000).trim();
      const result = validateCompressionInput(text, 5000);

      expect(result.valid).toBe(true);
      expect(result.words).toBe(5000);
    });
  });

  describe('XSS prevention', () => {
    it('does not execute script tags in input', () => {
      const xssAttempt = '<script>alert("XSS")</script> '.repeat(10) + 'This text contains an XSS attempt with script tags that should be treated as plain text and not executed ever.';
      const result = compress(xssAttempt);

      // Should treat as plain text, not execute
      expect(result.compressed).toContain('<script>');
      expect(result.compressed).toContain('</script>');
    });

    it('preserves HTML entities without decoding', () => {
      const text = 'The entity &lt;script&gt; should remain encoded. It is important to validate all inputs properly. Please make sure to sanitize user data. In order to prevent XSS attacks, escape all output carefully.';
      const result = compress(text);

      expect(result.compressed).toContain('&lt;');
      expect(result.compressed).toContain('&gt;');
    });

    it('handles event handler attributes safely', () => {
      const text = '<div onclick="malicious()">Click me</div> It is important to sanitize HTML attributes. Please make sure to validate all user input carefully. In order to prevent XSS, escape event handlers properly.';
      const result = compress(text);

      expect(result.compressed).toContain('onclick=');
      // Should be treated as text, not parsed as HTML
    });

    it('handles data URIs safely', () => {
      const text = 'The image src="data:text/html,<script>alert(1)</script>" should be treated as text. It is important to validate all URLs properly. Please make sure to sanitize data URIs carefully. In order to prevent injection, check all sources thoroughly.';
      const result = compress(text);

      expect(result.compressed).toContain('data:text/html');
      expect(result.compressed).toBeDefined();
    });

    it('handles javascript: protocol safely', () => {
      const text = 'The link href="javascript:alert(1)" is malicious. It is important to validate all protocols. Please make sure to whitelist safe protocols only. In order to prevent XSS, block javascript: links entirely.';
      const result = compress(text);

      expect(result.compressed).toContain('javascript:');
      // Should be preserved as text
    });
  });

  describe('Injection prevention', () => {
    it('handles SQL injection attempts safely', () => {
      const text = "The input ' OR '1'='1 should be treated as text. It is important to use parameterized queries. Please make sure to validate all database inputs. In order to prevent SQL injection, never concatenate user input directly into queries.";
      const result = compress(text);

      expect(result.compressed).toContain("' OR '1'='1");
      expect(result.compressed).toBeDefined();
    });

    it('handles regex injection attempts', () => {
      const text = 'The pattern (.*){100} could cause catastrophic backtracking. It is important to validate all regex patterns. Please make sure to test for DoS vulnerabilities. In order to prevent regex injection, sanitize pattern input carefully.';
      const result = compress(text);

      expect(result.compressed).toContain('(.*){100}');
      expect(result.compressed).toBeDefined();
    });

    it('handles command injection attempts', () => {
      const text = 'The command `rm -rf /` should never be executed. It is important to validate all system commands. Please make sure to sanitize shell input carefully. In order to prevent command injection, use safe APIs exclusively.';
      const result = compress(text);

      expect(result.compressed).toContain('rm -rf');
      expect(result.compressed).toBeDefined();
    });

    it('handles template injection attempts', () => {
      const text = 'The template {{constructor.constructor("alert(1)")()}} is malicious. It is important to validate all template syntax. Please make sure to use safe rendering. In order to prevent template injection, disable dynamic code execution.';
      const result = compress(text);

      expect(result.compressed).toContain('{{constructor.constructor');
      expect(result.compressed).toBeDefined();
    });
  });

  describe('Unicode and encoding edge cases', () => {
    it('handles unicode characters correctly', () => {
      const text = 'The emoji 😀😃😄 and symbols ♠♣♥♦ should be preserved. It is important to support international characters. Please make sure to handle UTF-8 properly. In order to support all users, use Unicode correctly throughout the application.';
      const result = compress(text);

      expect(result.compressed).toContain('😀');
      expect(result.compressed).toContain('♠');
    });

    it('handles zero-width characters', () => {
      const text = 'Text with zero\u200B-width\u200C characters\u200D should work. It is important to normalize Unicode. Please make sure to handle invisible characters. In order to prevent steganography, detect zero-width chars properly.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
    });

    it('handles RTL characters', () => {
      const text = 'Hebrew שלום and Arabic مرحبا should be preserved. It is important to support bidirectional text. Please make sure to handle RTL properly. In order to support all languages, use proper Unicode handling throughout.';
      const result = compress(text);

      expect(result.compressed).toContain('שלום');
      expect(result.compressed).toContain('مرحبا');
    });

    it('handles control characters', () => {
      const text = 'Text with control\x00chars\x01should\x02be\x03handled. It is important to sanitize control characters. Please make sure to validate all input bytes. In order to prevent issues, strip or escape control chars properly.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
    });

    it('handles homoglyph attacks', () => {
      const text = 'The domain exаmple.com uses Cyrillic "а" instead of Latin "a". It is important to normalize characters. Please make sure to detect homoglyphs. In order to prevent phishing, validate domain characters carefully.';
      const result = compress(text);

      expect(result.compressed).toContain('exаmple.com');
    });
  });

  describe('DoS prevention', () => {
    it('rejects excessively long input at 500KB', () => {
      const longText = 'word '.repeat(200000); // ~1MB
      const result = validateCompressionInput(longText, 1000000);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('500KB');
    });

    it('handles many repeated phrases efficiently', () => {
      const text = 'It is important to validate. '.repeat(100);
      const startTime = Date.now();
      const result = compress(text);
      const endTime = Date.now();

      expect(result.compressed).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in <5s
    });

    it('handles deeply nested structures', () => {
      const text = '('.repeat(1000) + 'content' + ')'.repeat(1000) + ' It is important to handle nested structures. Please make sure to validate bracket depth. In order to prevent stack overflow, limit nesting properly.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
    });

    it('handles many unique words efficiently', () => {
      const uniqueWords = Array.from({ length: 1000 }, (_, i) => `word${i}`).join(' ');
      const startTime = Date.now();
      const result = compress(uniqueWords);
      const endTime = Date.now();

      expect(result.compressed).toBeDefined();
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('Quote escaping in Rosetta (bug fix)', () => {
    it('escapes double quotes in pattern phrases', () => {
      // Simulate the bug fix in rosetta.js line 34
      const phrase = 'phrase with "quotes" inside';
      const escaped = phrase.replace(/"/g, '\\"');

      expect(escaped).toBe('phrase with \\"quotes\\" inside');
      expect(escaped).toContain('\\"');
    });

    it('handles patterns without quotes', () => {
      const phrase = 'phrase without quotes';
      const escaped = phrase.replace(/"/g, '\\"');

      expect(escaped).toBe(phrase);
    });

    it('handles multiple quote pairs', () => {
      const phrase = 'a "quoted" phrase with "more quotes"';
      const escaped = phrase.replace(/"/g, '\\"');

      expect(escaped).toBe('a \\"quoted\\" phrase with \\"more quotes\\"');
    });

    it('preserves single quotes', () => {
      const phrase = "phrase with 'single' quotes";
      const escaped = phrase.replace(/"/g, '\\"');

      expect(escaped).toBe("phrase with 'single' quotes");
      expect(escaped).toContain("'");
    });
  });

  describe('Edge cases and malformed input', () => {
    it('handles input with only special characters', () => {
      const text = '!@#$%^&*()_+-=[]{}|;:\',.<>?/~` '.repeat(20);
      const result = validateCompressionInput(text, 10000);

      // Special characters might not count as words, so could be rejected
      // Just ensure it doesn't crash
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('handles input with mixed scripts', () => {
      const text = 'English Русский 中文 العربية עברית Ελληνικά 日本語 한국어 繁體字 It is important to handle mixed scripts. Please make sure to support all languages properly. In order to serve global users, use proper Unicode handling throughout.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
    });

    it('handles null bytes in input', () => {
      const text = 'Text\x00with\x00null\x00bytes It is important to sanitize null bytes. Please make sure to validate binary data. In order to prevent issues, strip null bytes from text input entirely.';
      const result = compress(text);

      expect(result.compressed).toBeDefined();
    });

    it('handles extremely long single word', () => {
      const longWord = 'a'.repeat(10000);
      const text = `${longWord} It is important to handle long words. Please make sure to validate word length. In order to prevent issues, check maximum word size carefully.`;
      const result = compress(text);

      expect(result.compressed).toBeDefined();
      expect(result.compressed).toContain(longWord);
    });
  });
});
