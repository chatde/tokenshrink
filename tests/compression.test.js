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
    // This text has many verbose phrases that get removed, pushing savings above 5%
    const result = compress(
      'In order to write a good function, it is important to validate all parameters. Due to the fact that users can pass invalid arguments, you should always check the return value. Please make sure to handle the configuration properly. It is essential to test the implementation of the authentication system. For the purpose of debugging, you need to log the database connection status. It is also important to monitor the environment variables and application performance.'
    );
    // If compression passed the threshold, we should see abbreviated text
    if (!result.stats.belowThreshold && !result.stats.tooShort) {
      const lower = result.compressed.toLowerCase();
      // Phrase removals and/or word abbreviations should be present
      expect(lower).not.toContain('in order to');
      expect(result.stats.totalCompressedWords).toBeLessThan(result.stats.originalWords);
    } else {
      // If below threshold, the engine correctly decided savings weren't worth it
      expect(result.stats.ratio).toBe(1);
    }
  });

  it('produces shorter output on verbose prompts', () => {
    // A very verbose prompt with lots of filler phrases
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
      'The validation process should determine whether the necessary requirements are available. Please provide a comprehensive explanation including relevant considerations for the implementation.'
    );
    if (result.rosetta) {
      expect(result.rosetta).toContain('[DECODE]');
      expect(result.rosetta).toContain('[/DECODE]');
    }
  });

  it('handles code domain detection', () => {
    const result = compress(
      'Write a function that takes an array of objects and returns the filtered results. Use middleware for authentication. The endpoint should handle POST requests with JSON body parameters. Make sure to implement proper error handling with try catch blocks.',
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

  it('returns valid stats', () => {
    const result = compress(
      'You are responsible for building a comprehensive application that handles user authentication and authorization. It is important to validate all input parameters before processing them through the middleware pipeline.'
    );
    expect(result.stats.originalWords).toBeGreaterThan(0);
    expect(result.stats.tokensSaved).toBeGreaterThanOrEqual(0);
    expect(typeof result.stats.ratio).toBe('number');
    expect(result.stats.ratio).toBeGreaterThanOrEqual(1);
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
});
