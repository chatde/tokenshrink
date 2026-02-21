import { describe, it, expect } from 'vitest';
import { generateRosetta, countRosettaWords } from '../app/lib/compression/rosetta.js';

describe('generateRosetta()', () => {
  it('generates a decoder header for multi-word replacements', () => {
    // Multi-word → shorter replacements that save enough words to pass net-positive filter
    const replacements = [
      { original: 'in order to', replacement: 'to', occurrences: 3 },
      { original: 'due to the fact that', replacement: 'because', occurrences: 3 },
    ];
    const rosetta = generateRosetta(replacements);
    expect(rosetta).toContain('[DECODE]');
    expect(rosetta).toContain('[/DECODE]');
  });

  it('skips universal abbreviations', () => {
    // fn, db, u are universal — should NOT appear in Rosetta
    const replacements = [
      { original: 'function', replacement: 'fn', occurrences: 5 },
      { original: 'database', replacement: 'db', occurrences: 5 },
      { original: 'you', replacement: 'u', occurrences: 5 },
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
