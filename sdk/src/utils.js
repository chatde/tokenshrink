import { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS } from './token-costs.js';

// Average cost per 1K tokens across major providers (input)
export const AVG_COST_PER_1K_TOKENS = 0.005;

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// @deprecated — use countTokens() for accurate token counting
export function wordsToTokens(words) {
  return Math.round(words * 1.3);
}

export function tokensToDollars(tokens) {
  return (tokens / 1000) * AVG_COST_PER_1K_TOKENS;
}

/**
 * Count tokens in text using:
 *   1. User-provided tokenizer function (most accurate)
 *   2. Built-in TOKEN_COSTS lookup for known words (cl100k_base precomputed)
 *   3. ceil(charLength / 4) heuristic for unknown words
 *
 * @param {string} text - The text to count tokens for
 * @param {Function} [tokenizer] - Optional function: (text) => tokenCount
 * @returns {number} Estimated token count
 */
export function countTokens(text, tokenizer) {
  if (!text || !text.trim()) return 0;

  // Tier 2: pluggable tokenizer — most accurate
  if (typeof tokenizer === 'function') {
    return tokenizer(text);
  }

  // Tier 1: built-in lookup + heuristic fallback
  const words = text.trim().split(/\s+/).filter(Boolean);
  let total = 0;

  for (const word of words) {
    const lower = word.toLowerCase();
    // Strip trailing punctuation for lookup
    const clean = lower.replace(/[.,;:!?'")\]]+$/, '').replace(/^['"(\[]+/, '');

    if (TOKEN_COSTS[clean] !== undefined) {
      total += TOKEN_COSTS[clean];
    } else {
      // Heuristic: ~4 chars per token for unknown words
      total += Math.ceil(word.length / 4);
    }
  }

  return total;
}

/**
 * Calculate token savings for a single replacement.
 *
 * @param {string} original - The original word/phrase
 * @param {string} replacement - The abbreviated form
 * @param {Function} [tokenizer] - Optional tokenizer function
 * @returns {number} Positive = saves tokens, 0 = no change, negative = costs more
 */
export function replacementTokenSavings(original, replacement, tokenizer) {
  if (!replacement && replacement !== '') return 0;

  const origTokens = countTokens(original, tokenizer);
  const replTokens = replacement === '' ? 0 : countTokens(replacement, tokenizer);

  return origTokens - replTokens;
}

// Re-export token data for SDK consumers
export { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS };
