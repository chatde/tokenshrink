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
