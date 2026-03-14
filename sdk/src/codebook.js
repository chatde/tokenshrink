// TokenShrink Session Codebook
// Generates a reusable session-level vocabulary from source text.
// Unlike per-message compression, the Rosetta cost is paid ONCE at session start
// and amortized across every message in the session — orders of magnitude more efficient
// for recurring domain-specific terms (project names, file paths, service names).

import { countTokens, replacementTokenSavings } from './utils.js';

const MIN_FREQUENCY = 2;          // Term must appear at least this many times
const MAX_ENTRIES = 20;           // Max codebook entries (keeps Rosetta small)
const MIN_TOKEN_SAVINGS = 1;      // Abbreviation must save at least 1 token
const MIN_TERM_LENGTH = 8;        // Term must be at least this many chars (skip short words)

// Terms to never abbreviate
const SKIP_TERMS = new Set([
  // Common English words
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'have',
  'you', 'your', 'not', 'can', 'will', 'but', 'use', 'all', 'when',
  'then', 'than', 'they', 'them', 'been', 'was', 'were', 'has', 'had',
  'never', 'always', 'every', 'only', 'also', 'just', 'more', 'most',
  'each', 'any', 'some', 'other', 'both', 'full', 'new', 'current',
  // Status/action words (frequent in logs but not vocabulary)
  'running', 'fixed', 'done', 'pass', 'fail', 'warn', 'skip', 'error',
  'added', 'updated', 'removed', 'created', 'started', 'stopped',
  'completed', 'pending', 'active', 'enabled', 'disabled',
  'remaining', 'returned', 'working', 'reading', 'writing', 'loading',
  'sessions', 'session', 'handoff', 'startup', 'shutdown',
  // Common doc/markdown words
  'before', 'after', 'should', 'must', 'make', 'file', 'files',
  'code', 'data', 'time', 'note', 'read', 'write', 'check', 'step',
  'steps', 'section', 'content', 'message', 'messages', 'output',
  'input', 'value', 'values', 'field', 'fields', 'type', 'types',
  // Already-short tech terms
  'node', 'npm', 'git', 'api', 'url', 'http', 'json', 'sql', 'css',
  'app', 'src', 'dev', 'prod', 'true', 'false', 'null', 'void',
  'claude', 'phone', 'dashboard', 'discord', 'vercel', 'watson',
  // Hook/system words that appear in CLAUDE.md context
  'compact', 'context', 'system', 'global', 'local', 'config',
  'prompt', 'token', 'tokens', 'pattern', 'patterns', 'prefix',
]);

/**
 * Extract candidate terms from text — multi-token words and repeated phrases
 * that are worth abbreviating at the session level.
 */
function extractCandidates(text) {
  const freq = new Map();

  // Single words (multi-token ones only — e.g. "LankaPros", "authentication", file paths)
  const words = text.match(/\b[A-Za-z][A-Za-z0-9_\-\.\/]{4,}\b/g) || [];
  for (const word of words) {
    if (SKIP_TERMS.has(word.toLowerCase())) continue;
    const tokens = countTokens(word);
    if (tokens < 2) continue; // already a single token, abbreviating saves ≤0
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // File/path segments (e.g. "/Volumes/AI-Models/", "wattson-mind.js")
  const paths = text.match(/\/[A-Za-z][^\s"'`]{3,}\/|[a-z][a-z0-9\-]+\.[jt]s\b/g) || [];
  for (const path of paths) {
    freq.set(path, (freq.get(path) || 0) + 1);
  }

  // IP addresses
  const ips = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [];
  for (const ip of ips) {
    freq.set(ip, (freq.get(ip) || 0) + 1);
  }

  return freq;
}

/**
 * Generate a short uppercase abbreviation for a term.
 * Tries initialism first, then truncation.
 */
function generateAbbreviation(term, usedAbbrs) {
  const clean = term.replace(/[\/\.\-_]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  const candidates = [];

  // Initialism: first letter of each word (e.g. LankaPros → LP, watson-mind → WM)
  if (words.length >= 2) {
    candidates.push(words.map(w => w[0].toUpperCase()).join(''));
  }

  // First word + first letter of second (e.g. watson → WA, LankaPros → LA)
  if (words.length >= 1) {
    candidates.push(words[0].slice(0, 2).toUpperCase());
    candidates.push(words[0].slice(0, 3).toUpperCase());
  }

  // For paths: use last meaningful segment (e.g. /Volumes/AI-Models/ → SSD)
  if (term.startsWith('/')) {
    const parts = term.split('/').filter(Boolean);
    if (parts.length > 0) {
      candidates.push(parts[parts.length - 1].slice(0, 3).toUpperCase());
    }
  }

  for (const abbr of candidates) {
    if (abbr.length >= 2 && abbr.length <= 4 && !usedAbbrs.has(abbr)) {
      return abbr;
    }
  }

  // No clean abbreviation found — skip this term
  return null;
}

/**
 * Generate a session codebook from source text.
 * Returns an array of { term, abbr, tokensSaved, frequency } sorted by impact.
 */
export function generateCodebook(text, options = {}) {
  const {
    maxEntries = MAX_ENTRIES,
    minFrequency = MIN_FREQUENCY,
    minLength = MIN_TERM_LENGTH,
  } = options;

  const freq = extractCandidates(text);
  const usedAbbrs = new Set();
  const entries = [];

  // Score each candidate: tokensSaved × frequency (amortized session value)
  for (const [term, frequency] of freq) {
    if (frequency < minFrequency) continue;
    if (term.length < minLength) continue;

    const abbr = generateAbbreviation(term, usedAbbrs);
    if (!abbr) continue; // no clean abbreviation possible

    const tokensSaved = replacementTokenSavings(term, abbr);
    if (tokensSaved < MIN_TOKEN_SAVINGS) continue;

    usedAbbrs.add(abbr);
    entries.push({
      term,
      abbr,
      tokensSaved,
      frequency,
      score: tokensSaved * frequency,
    });
  }

  // Sort by session-level impact (savings × frequency)
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, maxEntries);
}

/**
 * Apply a codebook to text — substitutes abbreviations for full terms.
 * Returns { compressed, replacements }
 */
export function applyCodebook(text, codebook) {
  let result = text;
  const replacements = [];

  for (const { term, abbr } of codebook) {
    // Escape special regex chars in the term
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\w/])${escaped}(?![\\w/])`, 'g');
    const before = result;
    result = result.replace(regex, abbr);
    if (result !== before) replacements.push({ term, abbr });
  }

  return { compressed: result, replacements };
}

/**
 * Format a codebook as a compact Rosetta Stone block for CLAUDE.md.
 * Optimized for minimal tokens while remaining human-readable.
 */
export function formatRosettaBlock(codebook) {
  if (codebook.length === 0) return '';

  const lines = ['[SESSION VOCAB]'];
  for (const { term, abbr } of codebook) {
    lines.push(`${abbr}=${term}`);
  }
  lines.push('[/SESSION VOCAB]');

  return lines.join('\n');
}
