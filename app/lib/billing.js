// Utility functions re-exported from SDK — single source of truth
export {
  countWords,
  wordsToTokens,
  tokensToDollars,
  countTokens,
  replacementTokenSavings,
  TOKEN_COSTS,
  ZERO_SAVINGS,
  NEGATIVE_SAVINGS,
} from '@/sdk/src/utils.js';

// Average cost per 1K tokens across major providers (input)
export { AVG_COST_PER_1K_TOKENS } from '@/sdk/src/utils.js';

// App-specific plan configuration
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

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
