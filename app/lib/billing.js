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

// Rough: 1 word ≈ 1.3 tokens
export function wordsToTokens(words) {
  return Math.round(words * 1.3);
}

export function tokensToDollars(tokens) {
  return (tokens / 1000) * AVG_COST_PER_1K_TOKENS;
}

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
