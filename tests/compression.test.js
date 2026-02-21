import { describe, it, expect } from 'vitest';
import { compress } from '../app/lib/compression/engine.js';

describe('compress()', () => {
  it('returns compressed text for a valid prompt', () => {
    const result = compress(
      'You are an advanced AI assistant. Your primary responsibility is to help developers write clean code. Please make sure to explain your reasoning before writing code.'
    );
    expect(result.compressed).toBeDefined();
    expect(result.stats.originalWords).toBeGreaterThan(0);
    expect(result.stats.totalCompressedWords).toBeLessThanOrEqual(result.stats.originalWords);
  });

  it('skips compression for short text', () => {
    const result = compress('Hello world, this is a test.');
    expect(result.stats.tooShort).toBe(true);
    expect(result.compressed).toBe('Hello world, this is a test.');
  });

  it('removes verbose phrases', () => {
    const result = compress(
      'In order to build a good application, it is important to consider security at every layer. Due to the fact that users can be malicious, you should validate all input. Please make sure to handle errors properly. It is essential to test your code thoroughly before deployment.'
    );
    // "in order to" should become "to", "due to the fact that" should become "because"
    expect(result.compressed).not.toContain('in order to');
    expect(result.compressed).not.toContain('due to the fact that');
  });

  it('applies abbreviations when savings exceed threshold', () => {
    const result = compress(
      'In order to write a good application, it is important to validate all inputs. Due to the fact that users can pass invalid data, you should always check carefully. Please make sure to handle the setup properly. It is essential to test the code thoroughly. For the purpose of debugging, you need to log the status. It is also important to monitor the variables and track performance. You are responsible for identifying issues in the system. Remember to consider optimization in every step. Do not forget to include health check endpoints for monitoring.'
    );
    // If compression passed the threshold, we should see changes
    if (!result.stats.belowThreshold && !result.stats.tooShort) {
      const lower = result.compressed.toLowerCase();
      // Phrase removals should be present
      expect(lower).not.toContain('in order to');
      expect(result.stats.totalCompressedWords).toBeLessThan(result.stats.originalWords);
    } else {
      // If below threshold, the engine correctly decided savings weren't worth it
      expect(result.stats.ratio).toBe(1);
    }
  });

  it('produces shorter output on verbose prompts', () => {
    const result = compress(
      'You are responsible for building applications. It is important to consider security at every layer. In order to maintain code quality, you must follow consistent naming conventions. Due to the fact that users can be malicious, you should validate all input. Please make sure to explain your reasoning before writing code. Please make sure to break complex problems into smaller steps. Please make sure to consider edge cases and failure modes. It is essential to design APIs with clear documentation. It is essential to implement rate limiting. It is essential to use environment variables. For the purpose of debugging, walk through the code step by step. For the purpose of testing, write both unit tests and integration tests. Remember to consider performance optimization. Do not forget to include migration scripts. Be sure to include health check endpoints.'
    );
    // This has enough verbose phrases that it should compress meaningfully
    expect(result.stats.belowThreshold).toBeFalsy();
    expect(result.stats.totalCompressedWords).toBeLessThan(result.stats.originalWords);
    expect(result.stats.tokensSaved).toBeGreaterThan(0);
  });

  it('generates a Rosetta Stone header for non-universal abbreviations', () => {
    const result = compress(
      'The validation process should determine whether the necessary items are available. Please provide a comprehensive explanation including relevant details for the implementation. It is important to consider all the factors carefully. You should review the comprehensive analysis of the specification.'
    );
    if (result.rosetta) {
      expect(result.rosetta).toContain('[DECODE]');
      expect(result.rosetta).toContain('[/DECODE]');
    }
  });

  it('handles code domain detection', () => {
    const result = compress(
      'Write a piece of code that takes some data and returns the filtered results. Use a layer for security. The route should handle POST calls with JSON body inputs. Make sure to implement proper error handling with try catch blocks.',
      { domain: 'code' }
    );
    expect(result.stats.strategy).toBeDefined();
    expect(result.compressed).toBeDefined();
  });

  it('preserves meaning — no content is invented', () => {
    const original = 'Analyze the performance metrics and identify potential bottlenecks in the application architecture. Recommend appropriate caching strategies for database queries.';
    const result = compress(original);
    // The compressed version should not contain words that weren't conceptually in the original
    expect(result.compressed).not.toContain('security');
    expect(result.compressed).not.toContain('testing');
    expect(result.compressed).not.toContain('deployment');
  });

  it('returns valid stats with token fields', () => {
    const result = compress(
      'You are responsible for building a comprehensive application that handles user authentication and authorization. It is important to validate all input parameters before processing them through the pipeline. Additionally, you should consider all the factors and determine the best approach. Please make sure to review the specification thoroughly.'
    );
    expect(result.stats.originalWords).toBeGreaterThan(0);
    expect(result.stats.tokensSaved).toBeGreaterThanOrEqual(0);
    expect(typeof result.stats.ratio).toBe('number');
    expect(result.stats.ratio).toBeGreaterThanOrEqual(1);
    // v2.0 token fields
    expect(typeof result.stats.originalTokens).toBe('number');
    expect(typeof result.stats.compressedTokens).toBe('number');
    expect(typeof result.stats.rosettaTokens).toBe('number');
    expect(typeof result.stats.totalCompressedTokens).toBe('number');
    expect(typeof result.stats.tokenizerUsed).toBe('string');
    expect(result.stats.originalTokens).toBeGreaterThan(0);
  });

  it('handles empty and whitespace input', () => {
    const result = compress('');
    expect(result.compressed).toBe('');
  });

  it('does not corrupt structured content', () => {
    const result = compress(
      'Follow these steps in order to set up the environment: First, install the dependencies. Second, configure the database connection string. Third, set up the authentication middleware. It is important to test each step before proceeding to the next one.'
    );
    // Should still have ordered structure words
    const lower = result.compressed.toLowerCase();
    expect(lower).toMatch(/first/i);
    expect(lower).toMatch(/second/i);
    expect(lower).toMatch(/third/i);
  });

  // New v2.0 tests
  it('skips replacements that save zero tokens', () => {
    const result = compress(
      'The database function returns a string from the array of objects. The boolean parameter and integer argument are processed by the application. The authentication module handles the configuration of environment variables in production. The directory structure contains the repository for development resources. Please make sure to check all the items. It is important to verify everything works correctly. You should test all the features properly.'
    );
    // These words are all 1 token in cl100k_base — abbreviating them saves nothing
    // They should NOT be replaced in v2.0
    if (!result.stats.belowThreshold && !result.stats.tooShort) {
      const body = result.compressedBody || result.compressed;
      const lower = body.toLowerCase();
      expect(lower).toContain('database');
      expect(lower).toContain('function');
      expect(lower).toContain('string');
      expect(lower).toContain('array');
      expect(lower).toContain('boolean');
      expect(lower).toContain('integer');
    }
  });

  it('never increases token count', () => {
    const result = compress(
      'You are responsible for building applications. It is important to consider security at every layer. In order to maintain code quality, you must follow consistent naming conventions. Due to the fact that users can be malicious, you should validate all input. Please make sure to explain your reasoning. It is essential to design APIs with clear documentation. For the purpose of testing, write tests. Remember to consider performance.'
    );
    if (!result.stats.belowThreshold && !result.stats.tooShort) {
      expect(result.stats.totalCompressedTokens).toBeLessThanOrEqual(result.stats.originalTokens);
    }
  });

  it('accepts a custom tokenizer function', () => {
    // Mock tokenizer: 1 token per character (simple, deterministic)
    const mockTokenizer = (text) => text.length;

    const result = compress(
      'You are responsible for building applications. It is important to consider security at every layer. In order to maintain code quality, you must follow consistent naming conventions. Due to the fact that users can be malicious, you should validate all input. Please make sure to explain your reasoning. It is essential to design APIs with documentation. For the purpose of testing, write tests. Remember to consider optimization.',
      { tokenizer: mockTokenizer }
    );

    expect(result.stats.tokenizerUsed).toBe('custom');
    expect(result.stats.originalTokens).toBeGreaterThan(0);
  });

  it('reports tokenizerUsed as built-in when no tokenizer provided', () => {
    const result = compress('This is a short test to verify the tokenizer field is set correctly when running.');
    expect(result.stats.tokenizerUsed).toBe('built-in');
  });
});
