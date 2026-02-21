// Rosetta Stone generator — creates the decoder header that teaches LLMs the abbreviations
import { UNIVERSAL_ABBREVIATIONS } from './dictionaries';
import { countTokens } from '../billing';

export function generateRosetta(replacements, patternReplacements = [], tokenizer) {
  // Filter out universal abbreviations — LLMs already understand these
  const filtered = replacements.filter(({ replacement }) => {
    return !UNIVERSAL_ABBREVIATIONS.has(replacement);
  });

  // Only include entries where net token savings are positive
  // A Rosetta entry costs ~2 tokens (e.g. "fn=function\n")
  const netPositive = filtered.filter(({ original, replacement, occurrences }) => {
    const entryCost = countTokens(`${replacement}=${original}`, tokenizer);
    const savedPerOccurrence = countTokens(original, tokenizer) - countTokens(replacement, tokenizer);
    const count = occurrences || 1;
    return (savedPerOccurrence * count) > entryCost;
  });

  if (netPositive.length === 0 && patternReplacements.length === 0) {
    return '';
  }

  const lines = ['[DECODE]'];

  if (netPositive.length > 0) {
    for (const { original, replacement } of netPositive) {
      lines.push(`${replacement}=${original}`);
    }
  }

  if (patternReplacements.length > 0) {
    for (const { code, phrase } of patternReplacements) {
      lines.push(`${code}="${phrase}"`);
    }
  }

  lines.push('[/DECODE]');
  return lines.join('\n');
}

/**
 * @deprecated Use countRosettaTokens() for accurate token counting
 */
export function countRosettaWords(rosettaText) {
  if (!rosettaText) return 0;
  return rosettaText.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count tokens in a Rosetta Stone header.
 */
export function countRosettaTokens(rosettaText, tokenizer) {
  if (!rosettaText) return 0;
  return countTokens(rosettaText, tokenizer);
}
