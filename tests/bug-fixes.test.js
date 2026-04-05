import { describe, it, expect } from 'vitest';
import { compress } from '../app/lib/compression/engine.js';
import { validateCompressionInput } from '../app/lib/validate.js';
import { compressions } from '../schema/schema.js';

describe('Bug Fix: Schema — originalTokens + compressedTokens columns', () => {
  it('compressions table has originalTokens column', () => {
    expect(compressions.originalTokens).toBeDefined();
    expect(compressions.originalTokens.name).toBe('original_tokens');
  });

  it('compressions table has compressedTokens column', () => {
    expect(compressions.compressedTokens).toBeDefined();
    expect(compressions.compressedTokens.name).toBe('compressed_tokens');
  });

  it('originalTokens defaults to 0', () => {
    expect(compressions.originalTokens.hasDefault).toBe(true);
  });

  it('compressedTokens defaults to 0', () => {
    expect(compressions.compressedTokens.hasDefault).toBe(true);
  });

  it('compress() returns stats that map to schema columns', () => {
    const result = compress(
      'You are responsible for building applications. It is important to consider security at every layer. In order to maintain code quality, you must follow consistent naming conventions. Due to the fact that users can be malicious, you should validate all input.'
    );
    // These values should be available to write to the new schema columns
    expect(typeof result.stats.originalTokens).toBe('number');
    expect(typeof result.stats.totalCompressedTokens).toBe('number');
    expect(result.stats.originalTokens).toBeGreaterThan(0);
  });
});

describe('Bug Fix: MIN_WORDS mismatch — SDK vs API aligned to 30', () => {
  it('SDK rejects text under 30 words with tooShort flag', () => {
    // 15-word text — was accepted by old SDK (MIN_WORDS=10) but rejected by API
    const text = 'This is a fifteen word sentence that we are using to test the minimum word count validation check.';
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    // This text is under 30 words
    expect(wordCount).toBeLessThan(30);

    const result = compress(text);
    expect(result.stats.tooShort).toBe(true);
  });

  it('API validation rejects text under 30 words', () => {
    const text = 'This is a short text that has fewer than thirty words for testing.';
    const validation = validateCompressionInput(text, 100000);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('30 words');
  });

  it('SDK and API agree on 30-word boundary', () => {
    // Exactly 29 words — should be rejected by both
    const words29 = Array(29).fill('word').join(' ');
    const sdkResult = compress(words29);
    const apiResult = validateCompressionInput(words29, 100000);

    expect(sdkResult.stats.tooShort).toBe(true);
    expect(apiResult.valid).toBe(false);
  });

  it('both accept text at exactly 30 words', () => {
    const words30 = Array(30).fill('word').join(' ');
    const sdkResult = compress(words30);
    const apiResult = validateCompressionInput(words30, 100000);

    expect(sdkResult.stats.tooShort).toBeFalsy();
    expect(apiResult.valid).toBe(true);
  });
});

describe('Bug Fix: Dead PRICE_MAP entries removed', () => {
  it('PRICE_MAP only has advanced plan', async () => {
    // Read the checkout route source and verify no pro/team references
    const { readFileSync } = await import('fs');
    const source = readFileSync(new URL('../app/api/billing/checkout/route.js', import.meta.url), 'utf8');

    expect(source).not.toContain('STRIPE_PRO_PRICE_ID');
    expect(source).not.toContain('STRIPE_TEAM_PRICE_ID');
    expect(source).toContain('STRIPE_ADVANCED_PRICE_ID');
  });

  it('billing plans config only has free and advanced', async () => {
    const { PLANS } = await import('../app/lib/billing.js');

    expect(Object.keys(PLANS)).toEqual(['free', 'advanced']);
    expect(PLANS.pro).toBeUndefined();
    expect(PLANS.team).toBeUndefined();
  });
});
