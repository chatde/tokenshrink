import { countWords } from './billing';

export function validateCompressionInput(text, maxWords) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required' };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }

  if (trimmed.length > 500000) {
    return { valid: false, error: 'Text exceeds maximum length (500KB)' };
  }

  const words = countWords(trimmed);
  if (words < 10) {
    return { valid: false, error: 'Text must be at least 10 words' };
  }

  if (words > maxWords) {
    return {
      valid: false,
      error: `Text exceeds your plan limit of ${maxWords.toLocaleString()} words per submission (got ${words.toLocaleString()})`,
    };
  }

  return { valid: true, words, text: trimmed };
}
