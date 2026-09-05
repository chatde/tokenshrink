import { getDictionary, UNIVERSAL_ABBREVIATIONS } from './dictionaries.js';
import { detectStrategy, findRepeatedPhrases } from './strategies.js';
import { generateRosetta, countRosettaWords, countRosettaTokens } from './rosetta.js';
import { countWords, wordsToTokens, tokensToDollars, countTokens, replacementTokenSavings } from './utils.js';
import { ZERO_SAVINGS, NEGATIVE_SAVINGS } from './token-costs.js';
import { TIER_A_PHRASES, TIER_B_PHRASES, TIER_B_MIN_TOKENS, TIER_B_MARGIN } from './huffman-tables.js';

const MIN_WORDS_FOR_COMPRESSION = 30;
const MIN_SAVINGS_RATIO = 0.05; // Only compress if saving >5%

const ANALYTICS_URL = 'https://tokenshrink.com/api/analytics';

function pingAnalytics(before, after, source) {
  // Fire-and-forget — never throws, never blocks the caller.
  // Sends only numbers. No prompt text leaves the machine.
  try {
    fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'compress', before, after, source }),
    }).catch(() => {});
  } catch (_) {}
}

export function compress(text, options = {}) {
  const {
    domain = 'auto',
    forceStrategy,
    tokenizer,
    analytics = true,
    source = 'sdk',
    tier,
  } = options;
  // Conservatively leave literal-bearing prompts untouched. Rewriting quoted
  // strings or code can change exact-output requirements and program behavior.
  const protectedContent = /[`"“”]|(?:^|\s)'[^'\n]+'(?=\s|[.,;:!?]|$)|(?:^|\n)(?: {4}|\t)\S/.test(text);
  const originalText = protectedContent ? text : text.trim();
  const originalWords = countWords(originalText);
  const originalTokens = countTokens(originalText, tokenizer);

  // Too short — compression overhead exceeds savings
  if (protectedContent || originalWords < MIN_WORDS_FOR_COMPRESSION) {
    return {
      compressed: originalText,
      rosetta: '',
      original: originalText,
      stats: {
        originalWords,
        compressedWords: originalWords,
        rosettaWords: 0,
        totalCompressedWords: originalWords,
        originalTokens,
        compressedTokens: originalTokens,
        rosettaTokens: 0,
        totalCompressedTokens: originalTokens,
        ratio: 1,
        tokensSaved: 0,
        dollarsSaved: 0,
        strategy: 'none',
        tokenizerUsed: typeof tokenizer === 'function' ? 'custom' : 'built-in',
        ...(protectedContent ? { protectedContent: true } : { tooShort: true }),
      },
    };
  }

  // Detect best strategy
  const detected = forceStrategy
    ? { strategy: forceStrategy, domain: domain, confidence: 1 }
    : detectStrategy(originalText);

  const dict = getDictionary(detected.domain);

  let compressed = originalText;
  const replacementCounts = new Map(); // track occurrences per replacement
  const huffmanReplacements = [];

  // Phase 0: Huffman frequency table compression
  if (tier !== 'basic') {
    // Tier A: always apply (universally known, no header)
    for (const [phrase, abbr] of Object.entries(TIER_A_PHRASES)) {
      if (!abbr) continue;
      const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
      if (regex.test(compressed)) {
        compressed = compressed.replace(regex, abbr);
      }
    }

    // Tier B: only apply when token count warrants it
    if (originalTokens >= TIER_B_MIN_TOKENS) {
      // Estimate header cost: ~3 tokens per Tier B entry used
      const tierBEntries = [];
      let projectedSavings = 0;

      for (const [phrase, abbr] of Object.entries(TIER_B_PHRASES)) {
        if (!abbr) continue;
        const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
        const matches = compressed.match(regex);
        if (matches && matches.length > 0) {
          const savings = replacementTokenSavings(phrase, abbr, tokenizer) * matches.length;
          if (savings > 0) {
            tierBEntries.push({ phrase, abbr, regex, count: matches.length, savings });
            projectedSavings += savings;
          }
        }
      }

      // Only apply Tier B if total savings exceed header cost by TIER_B_MARGIN
      const headerCost = tierBEntries.length * 3; // ~3 tokens per entry
      if (projectedSavings > headerCost * TIER_B_MARGIN) {
        for (const { phrase, abbr, regex, count } of tierBEntries) {
          compressed = compressed.replace(regex, abbr);
          huffmanReplacements.push({ original: phrase, replacement: abbr, occurrences: count });
        }
      }
    }
  }

  // Phase 1: Phrase compression (longest first to avoid partial matches)

  const phraseEntries = Object.entries(dict)
    .filter(([key]) => key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  // Pre-compile phrase regexes once, outside the loop
  const compiledPhrases = phraseEntries
    .filter(([phrase, abbr]) => {
      if (ZERO_SAVINGS.has(phrase) || NEGATIVE_SAVINGS.has(phrase)) return false;
      const savings = replacementTokenSavings(phrase, abbr, tokenizer);
      return savings > 0;
    })
    .map(([phrase, abbr]) => ({
      phrase,
      abbr,
      regex: new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi'),
    }));

  for (const { phrase, abbr, regex } of compiledPhrases) {
    let matchCount = 0;
    const next = compressed.replace(regex, (m) => { matchCount++; return abbr; });
    if (matchCount > 0) {
      compressed = next;
      const key = `${phrase}|||${abbr}`;
      replacementCounts.set(key, (replacementCounts.get(key) || 0) + matchCount);
    }
  }

  // Phase 2: Single word abbreviation (case-insensitive)
  const wordEntries = Object.entries(dict)
    .filter(([key]) => !key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  // Pre-compile word regexes once, outside the loop
  const compiledWords = wordEntries
    .filter(([word, abbr]) => {
      if (word === abbr) return false;
      if (ZERO_SAVINGS.has(word) || NEGATIVE_SAVINGS.has(word)) return false;
      const savings = replacementTokenSavings(word, abbr, tokenizer);
      return savings > 0;
    })
    .map(([word, abbr]) => ({
      word,
      abbr,
      regex: new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi'),
    }));

  for (const { word, abbr, regex } of compiledWords) {
    let matchCount = 0;
    const next = compressed.replace(regex, (m) => { matchCount++; return abbr; });
    if (matchCount > 0) {
      compressed = next;
      const key = `${word}|||${abbr}`;
      replacementCounts.set(key, (replacementCounts.get(key) || 0) + matchCount);
    }
  }

  // Build usedReplacements with occurrence counts
  const usedReplacements = [];
  for (const [key, count] of replacementCounts) {
    const [original, replacement] = key.split('|||');
    usedReplacements.push({ original, replacement, occurrences: count });
  }

  // Phase 3: Pattern detection — find repeated phrases and replace with codes
  const patternReplacements = [];
  const repeatedPhrases = findRepeatedPhrases(compressed, 3, 2);

  let patternIdx = 1;
  for (const { phrase, count } of repeatedPhrases.slice(0, 10)) {
    const regex = new RegExp(escapeRegex(phrase), 'gi');
    if (regex.test(compressed)) {
      const code = `P${patternIdx}`;
      compressed = compressed.replace(regex, code);
      patternReplacements.push({ code, phrase, count });
      patternIdx++;
    }
  }

  // Phase 4: Structural compression (remove redundant whitespace)
  compressed = compressed
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .replace(/\t+/g, ' ')
    // Clean up artifacts from phrase removal (double spaces, leading spaces after periods)
    .replace(/ {2,}/g, ' ')
    .replace(/\. +\./g, '.')
    .replace(/ +([.,;:!?])/g, '$1')
    .replace(/([.!?]) +([a-z])/g, (m, p, l) => `${p} ${l}`)
    .trim();

  // Generate Rosetta Stone (smart — only includes net-positive, non-universal entries)
  const rosetta = generateRosetta(
    [...huffmanReplacements, ...usedReplacements],
    patternReplacements,
    tokenizer,
  );
  const rosettaWords = countRosettaWords(rosetta);
  const rosettaTokens = countRosettaTokens(rosetta, tokenizer);
  const compressedWords = countWords(compressed);
  const compressedTokens = countTokens(compressed, tokenizer);
  const totalCompressedWords = compressedWords + rosettaWords;
  const fullCompressed = rosetta ? `${rosetta}\n\n${compressed}` : compressed;
  // Token boundaries and separators make header/body counts non-additive.
  const totalCompressedTokens = countTokens(fullCompressed, tokenizer);

  // Calculate savings (token-based)
  const tokenRatio = totalCompressedTokens > 0 ? originalTokens / totalCompressedTokens : 1;
  const tokensSaved = Math.max(0, originalTokens - totalCompressedTokens);
  const dollarsSaved = tokensToDollars(tokensSaved);

  // Fewer words do not guarantee fewer tokens. Require savings above 5%
  // of the original token count, including the Rosetta overhead.
  if (originalTokens <= 0 || tokensSaved <= originalTokens * MIN_SAVINGS_RATIO) {
    return {
      compressed: originalText,
      rosetta: '',
      original: originalText,
      stats: {
        originalWords,
        compressedWords: originalWords,
        rosettaWords: 0,
        totalCompressedWords: originalWords,
        originalTokens,
        compressedTokens: originalTokens,
        rosettaTokens: 0,
        totalCompressedTokens: originalTokens,
        ratio: 1,
        tokensSaved: 0,
        dollarsSaved: 0,
        strategy: 'none',
        tokenizerUsed: typeof tokenizer === 'function' ? 'custom' : 'built-in',
        belowThreshold: true,
      },
    };
  }

  // Ping analytics — only numbers, no prompt content, opt-out via options.analytics = false
  if (analytics && tokensSaved > 0) {
    pingAnalytics(originalTokens, totalCompressedTokens, source);
  }

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
      originalTokens,
      compressedTokens,
      rosettaTokens,
      totalCompressedTokens,
      ratio: Math.round(tokenRatio * 10) / 10,
      tokensSaved,
      dollarsSaved: Math.round(dollarsSaved * 100) / 100,
      strategy: detected.strategy,
      domain: detected.domain,
      confidence: detected.confidence,
      replacementCount: usedReplacements.length,
      patternCount: patternReplacements.length,
      tokenizerUsed: typeof tokenizer === 'function' ? 'custom' : 'built-in',
    },
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
