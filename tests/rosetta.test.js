import { describe, it, expect } from 'vitest';
import { generateRosetta, countRosettaWords, countRosettaTokens } from '../app/lib/compression/rosetta.js';

describe('generateRosetta()', () => {
  it('generates a decoder header for multi-word replacements', () => {
    // Multi-word → shorter replacements that save enough tokens to pass net-positive filter
    const replacements = [
      { original: 'in order to', replacement: 'to', occurrences: 3 },
      { original: 'due to the fact that', replacement: 'because', occurrences: 3 },
    ];
    const rosetta = generateRosetta(replacements);
    expect(rosetta).toContain('[DECODE]');
    expect(rosetta).toContain('[/DECODE]');
  });

  it('skips universal abbreviations', () => {
    // spec, async are universal — should NOT appear in Rosetta
    const replacements = [
      { original: 'specification', replacement: 'spec', occurrences: 5 },
      { original: 'asynchronous', replacement: 'async', occurrences: 5 },
    ];
    const rosetta = generateRosetta(replacements);
    // All are universal, so Rosetta should be empty
    expect(rosetta).toBe('');
  });

  it('returns empty string when no entries needed', () => {
    const rosetta = generateRosetta([]);
    expect(rosetta).toBe('');
  });
});

describe('countRosettaWords()', () => {
  it('counts words in a Rosetta header', () => {
    const header = '[DECODE] cfg=configuration, impl=implementation [/DECODE]';
    const count = countRosettaWords(header);
    expect(count).toBeGreaterThan(0);
  });

  it('returns 0 for empty string', () => {
    expect(countRosettaWords('')).toBe(0);
  });
});

describe('countRosettaTokens()', () => {
  it('counts tokens in a Rosetta header', () => {
    const header = '[DECODE]\nfull=comprehensive\n[/DECODE]';
    const count = countRosettaTokens(header);
    expect(count).toBeGreaterThan(0);
  });

  it('returns 0 for empty string', () => {
    expect(countRosettaTokens('')).toBe(0);
  });

  it('accepts a custom tokenizer', () => {
    const header = '[DECODE]\nfull=comprehensive\n[/DECODE]';
    const mockTokenizer = (text) => text.length;
    const count = countRosettaTokens(header, mockTokenizer);
    expect(count).toBe(header.length);
  });
});
