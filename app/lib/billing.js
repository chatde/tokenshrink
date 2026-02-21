import { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS } from './compression/token-costs';

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    wordsPerMonth: 999999999,
    maxWordsPerShrink: 100000,
    features: ['Web compressor', 'Unlimited words', 'API access + SDK', 'Usage dashboard'],
  },
};

export const ANONYMOUS_WORD_LIMIT = 100000;
export const RATE_LIMIT_PER_MINUTE = 10;

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
 */
export function countTokens(text, tokenizer) {
  if (!text || !text.trim()) return 0;

  if (typeof tokenizer === 'function') {
    return tokenizer(text);
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  let total = 0;

  for (const word of words) {
    const lower = word.toLowerCase();
    const clean = lower.replace(/[.,;:!?'")\]]+$/, '').replace(/^['"(\[]+/, '');

    if (TOKEN_COSTS[clean] !== undefined) {
      total += TOKEN_COSTS[clean];
    } else {
      total += Math.ceil(word.length / 4);
    }
  }

  return total;
}

/**
 * Calculate token savings for a single replacement.
 */
export function replacementTokenSavings(original, replacement, tokenizer) {
  if (!replacement && replacement !== '') return 0;

  const origTokens = countTokens(original, tokenizer);
  const replTokens = replacement === '' ? 0 : countTokens(replacement, tokenizer);

  return origTokens - replTokens;
}

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS };
