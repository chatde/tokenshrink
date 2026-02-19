export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    wordsPerMonth: 5000,
    maxWordsPerShrink: 1000,
    features: ['Web compressor', '5,000 words/month', 'See your savings'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    wordsPerMonth: 250000,
    maxWordsPerShrink: 10000,
    features: [
      'Everything in Free',
      '250,000 words/month',
      'API access + SDK',
      'Usage dashboard',
      'Priority support',
    ],
  },
  team: {
    name: 'Team',
    price: 79,
    wordsPerMonth: 1000000,
    maxWordsPerShrink: 50000,
    features: [
      'Everything in Pro',
      '1,000,000 words/month',
      '5 team seats',
      'Proxy mode',
      'Custom dictionaries',
    ],
  },
};

export const ANONYMOUS_WORD_LIMIT = 500;
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
