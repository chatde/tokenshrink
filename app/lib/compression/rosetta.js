// Rosetta Stone generator — creates the decoder header that teaches LLMs the abbreviations
import { UNIVERSAL_ABBREVIATIONS } from './dictionaries';

export function generateRosetta(replacements, patternReplacements = []) {
  // Filter out universal abbreviations — LLMs already understand these
  const filtered = replacements.filter(({ replacement }) => {
    return !UNIVERSAL_ABBREVIATIONS.has(replacement);
  });

  // Only include entries where net savings are positive
  // A Rosetta entry costs ~2 words (e.g. "fn=function"). Only include if it saves more than that.
  const netPositive = filtered.filter(({ original, replacement, occurrences }) => {
    const entryCost = 2; // approximate words for one Rosetta line
    const savedPerOccurrence = original.split(/\s+/).length - replacement.split(/\s+/).length;
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

export function countRosettaWords(rosettaText) {
  if (!rosettaText) return 0;
  return rosettaText.trim().split(/\s+/).filter(Boolean).length;
}
