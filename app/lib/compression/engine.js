import { getDictionary } from './dictionaries';
import { detectStrategy, findRepeatedPhrases } from './strategies';
import { generateRosetta, countRosettaWords } from './rosetta';
import { countWords, wordsToTokens, tokensToDollars } from '../billing';

const MIN_WORDS_FOR_COMPRESSION = 50;
const MIN_SAVINGS_RATIO = 0.20; // Only compress if saving >20%

export function compress(text, options = {}) {
  const { domain = 'auto', forceStrategy } = options;
  const originalText = text.trim();
  const originalWords = countWords(originalText);
  const originalTokens = wordsToTokens(originalWords);

  // Too short — compression overhead exceeds savings
  if (originalWords < MIN_WORDS_FOR_COMPRESSION) {
    return {
      compressed: originalText,
      rosetta: '',
      original: originalText,
      stats: {
        originalWords,
        compressedWords: originalWords,
        rosettaWords: 0,
        totalCompressedWords: originalWords,
        ratio: 1,
        tokensSaved: 0,
        dollarsSaved: 0,
        strategy: 'none',
        tooShort: true,
      },
    };
  }

  // Detect best strategy
  const detected = forceStrategy
    ? { strategy: forceStrategy, domain: domain, confidence: 1 }
    : detectStrategy(originalText);

  const dict = getDictionary(detected.domain);

  // Phase 1: Phrase compression (longest first to avoid partial matches)
  let compressed = originalText;
  const usedReplacements = [];

  const phraseEntries = Object.entries(dict)
    .filter(([key]) => key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, abbr] of phraseEntries) {
    const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
    if (regex.test(compressed)) {
      compressed = compressed.replace(regex, abbr);
      usedReplacements.push({ original: phrase, replacement: abbr });
    }
  }

  // Phase 2: Single word abbreviation (case-insensitive, preserve first occurrence case)
  const wordEntries = Object.entries(dict)
    .filter(([key]) => !key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [word, abbr] of wordEntries) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    if (regex.test(compressed)) {
      compressed = compressed.replace(regex, abbr);
      usedReplacements.push({ original: word, replacement: abbr });
    }
  }

  // Phase 3: Pattern detection — find repeated phrases and replace with codes
  const patternReplacements = [];
  const repeatedPhrases = findRepeatedPhrases(compressed, 3, 2);

  let patternIdx = 1;
  for (const { phrase, count } of repeatedPhrases.slice(0, 10)) {
    // Only replace if the phrase appears in compressed text
    const regex = new RegExp(escapeRegex(phrase), 'gi');
    if (regex.test(compressed)) {
      const code = `P${patternIdx}`;
      compressed = compressed.replace(regex, code);
      patternReplacements.push({ code, phrase, count });
      patternIdx++;
    }
  }

  // Phase 4: Structural compression (remove redundant whitespace, shorten JSON keys)
  compressed = compressed
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .replace(/\t+/g, ' ')
    .trim();

  // Generate Rosetta Stone
  const rosetta = generateRosetta(usedReplacements, patternReplacements);
  const rosettaWords = countRosettaWords(rosetta);
  const compressedWords = countWords(compressed);
  const totalCompressedWords = compressedWords + rosettaWords;

  // Calculate savings
  const ratio = originalWords / totalCompressedWords;
  const tokensSaved = wordsToTokens(originalWords - totalCompressedWords);
  const dollarsSaved = tokensToDollars(Math.max(0, tokensSaved));

  // If savings are below threshold, return original
  if (ratio < (1 + MIN_SAVINGS_RATIO)) {
    return {
      compressed: originalText,
      rosetta: '',
      original: originalText,
      stats: {
        originalWords,
        compressedWords: originalWords,
        rosettaWords: 0,
        totalCompressedWords: originalWords,
        ratio: 1,
        tokensSaved: 0,
        dollarsSaved: 0,
        strategy: 'none',
        belowThreshold: true,
      },
    };
  }

  // Combine rosetta + compressed text
  const fullCompressed = rosetta ? `${rosetta}\n\n${compressed}` : compressed;

  return {
    compressed: fullCompressed,
    rosetta,
    compressedBody: compressed,
    original: originalText,
    stats: {
      originalWords,
      compressedWords,
      rosettaWords,
      totalCompressedWords,
      ratio: Math.round(ratio * 10) / 10,
      tokensSaved: Math.max(0, tokensSaved),
      dollarsSaved: Math.round(dollarsSaved * 100) / 100,
      strategy: detected.strategy,
      domain: detected.domain,
      confidence: detected.confidence,
      replacementCount: usedReplacements.length,
      patternCount: patternReplacements.length,
    },
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
