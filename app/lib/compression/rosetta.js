// Rosetta Stone generator — creates the decoder header that teaches LLMs the abbreviations

export function generateRosetta(replacements, patternReplacements = []) {
  if (replacements.length === 0 && patternReplacements.length === 0) {
    return '';
  }

  const lines = ['[DECODE]'];

  // Word/phrase abbreviations
  if (replacements.length > 0) {
    for (const { original, replacement } of replacements) {
      lines.push(`${replacement}=${original}`);
    }
  }

  // Pattern codes (P1, P2, etc.)
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
