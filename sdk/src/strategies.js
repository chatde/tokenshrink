// Strategy auto-selector: analyzes input text and picks the best compression approach

const CODE_SIGNALS = [
  'function', 'const ', 'let ', 'var ', 'import ', 'export ', 'class ',
  'return ', 'async ', 'await ', '=>', '===', '!==', 'console.log',
  'interface ', 'type ', 'enum ', 'struct ', 'def ', 'self.',
  'public ', 'private ', 'protected ', 'static ',
];

const MEDICAL_SIGNALS = [
  'patient', 'diagnosis', 'treatment', 'symptoms', 'clinical',
  'medical', 'prescription', 'dosage', 'mg', 'pathology',
  'chronic', 'acute', 'prognosis', 'therapy',
];

const LEGAL_SIGNALS = [
  'hereby', 'whereas', 'notwithstanding', 'pursuant', 'hereinafter',
  'plaintiff', 'defendant', 'jurisdiction', 'statute', 'liability',
  'indemnify', 'arbitration', 'covenant', 'therein', 'thereof',
];

const BUSINESS_SIGNALS = [
  'stakeholder', 'deliverable', 'quarterly', 'revenue', 'ROI',
  'KPI', 'synergy', 'leverage', 'scalable', 'pipeline',
  'roadmap', 'sprint', 'agile', 'milestone',
];

function scoreSignals(text, signals) {
  const lower = text.toLowerCase();
  return signals.reduce((score, signal) => {
    const regex = new RegExp(signal.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    return score + (matches ? matches.length : 0);
  }, 0);
}

export function detectStrategy(text) {
  const scores = {
    code: scoreSignals(text, CODE_SIGNALS),
    medical: scoreSignals(text, MEDICAL_SIGNALS),
    legal: scoreSignals(text, LEGAL_SIGNALS),
    business: scoreSignals(text, BUSINESS_SIGNALS),
  };

  // Check for JSON/XML structure
  const hasStructuredData = /[{[\]}<>]/.test(text);
  const jsonLikeRatio = (text.match(/[{}\[\]":,]/g) || []).length / text.length;
  if (jsonLikeRatio > 0.1) {
    scores.structural = 50;
  }

  // Find dominant strategy
  const entries = Object.entries(scores);
  const [topStrategy, topScore] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

  // If no clear signal, use general abbreviation
  if (topScore < 3) {
    return { strategy: 'abbreviation', domain: 'common', confidence: 0.5 };
  }

  return {
    strategy: topStrategy === 'structural' ? 'structural' : 'domain',
    domain: topStrategy,
    confidence: Math.min(topScore / 10, 1),
  };
}

// Detect repeated phrases for pattern strategy
export function findRepeatedPhrases(text, minLength = 3, minOccurrences = 2) {
  const words = text.split(/\s+/);
  const phrases = {};

  for (let len = minLength; len <= Math.min(8, words.length); len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ').toLowerCase();
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  }

  return Object.entries(phrases)
    .filter(([, count]) => count >= minOccurrences)
    .sort((a, b) => {
      // Score by (phrase length × occurrences) — longer repeated phrases save more
      const scoreA = a[0].split(' ').length * a[1];
      const scoreB = b[0].split(' ').length * b[1];
      return scoreB - scoreA;
    })
    .slice(0, 20)
    .map(([phrase, count]) => ({ phrase, count }));
}
