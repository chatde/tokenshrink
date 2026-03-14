// TokenShrink NLP Module — Advanced compression via linguistic analysis
// Zero dependencies. Implements core NLP algorithms inline (Porter stemmer,
// NPMI collocation scoring, TF-IDF weighting, stopword analysis, clause dedup).
//
// Derived from study of NLTK, spaCy, and Gensim source code.
// Every technique is adapted for the LLM-prompt compression use case.

// ─── STOPWORDS ───────────────────────────────────────────────────────────────
// Linguistically-informed set derived from spaCy's 326 English stopwords.
// We keep only the subset safe to remove from LLM prompts without losing
// instructional meaning. Words like "not", "must", "should" are EXCLUDED
// because they carry critical intent in prompts.
export const PROMPT_SAFE_STOPWORDS = new Set([
  'a', 'an', 'the',
  'about', 'above', 'across', 'after', 'afterwards', 'against', 'along',
  'already', 'also', 'although', 'among', 'amongst',
  'around', 'at', 'back', 'became', 'become', 'becomes', 'becoming',
  'been', 'before', 'beforehand', 'behind', 'being', 'below', 'beside',
  'besides', 'between', 'beyond', 'both', 'bottom',
  'by', 'did', 'do', 'does', 'doing', 'done', 'down',
  'during', 'each', 'either', 'else', 'elsewhere',
  'even', 'ever', 'every', 'everyone', 'everything', 'everywhere',
  'few', 'for', 'former', 'formerly', 'from', 'front', 'further',
  'get', 'give', 'go', 'had', 'has', 'have', 'he', 'hence', 'her',
  'here', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'however',
  'i', 'in', 'indeed', 'into', 'is', 'it', 'its', 'itself',
  'just', 'keep', 'last', 'latter', 'latterly', 'least', 'less',
  'made', 'make', 'many', 'may', 'me', 'meanwhile', 'might',
  'mine', 'more', 'moreover', 'most', 'mostly', 'move', 'much',
  'my', 'myself', 'namely', 'neither',
  'next', 'nine', 'nobody', 'nor', 'nothing',
  'now', 'nowhere', 'of', 'off', 'often', 'on', 'once', 'one',
  'only', 'onto', 'or', 'other', 'others', 'otherwise', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'part', 'per',
  'perhaps', 'put', 'quite', 'rather',
  'really', 'regarding', 'same', 'say', 'see', 'seem', 'seemed',
  'seeming', 'seems', 'several', 'she',
  'show', 'side', 'since', 'six', 'sixty', 'so', 'some', 'somehow',
  'someone', 'something', 'sometime', 'sometimes', 'somewhere',
  'still', 'such', 'take', 'ten', 'than', 'that',
  'their', 'them', 'themselves', 'then', 'thence', 'there',
  'thereafter', 'thereby', 'therefore', 'therein', 'thereupon',
  'these', 'they', 'this', 'those', 'though', 'three',
  'through', 'throughout', 'thru', 'thus', 'to', 'together',
  'too', 'top', 'toward', 'towards', 'twelve', 'twenty', 'two',
  'under', 'until', 'up', 'upon', 'us', 'used', 'using',
  'various', 'very', 'via', 'was', 'we', 'well', 'were',
  'what', 'whatever', 'when', 'whence', 'whenever', 'where',
  'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon',
  'wherever', 'whether', 'which', 'while', 'whither', 'who',
  'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with',
  'within', 'without', 'would', 'yet', 'you', 'your', 'yours',
  'yourself', 'yourselves',
]);

// Words that MUST be preserved in prompts — they carry intent
const PROMPT_INTENT_WORDS = new Set([
  'not', 'never', 'no', 'none', 'must', 'should', 'always', 'ensure',
  'require', 'required', 'important', 'critical', 'essential', 'necessary',
  'avoid', 'prevent', 'prohibit', 'forbidden', 'allow', 'permit',
  'if', 'unless', 'except', 'only', 'but', 'however', 'instead',
  'cannot', 'can', 'may', 'might', 'shall', 'could', 'would',
]);

// ─── PORTER STEMMER (lightweight) ─────────────────────────────────────────────
// Adapted from NLTK's porter.py — the classic Snowball/Porter suffix-stripping
// algorithm. We use it NOT for search indexing, but to detect morphological
// variants and normalize them (e.g., "implementing", "implementation",
// "implemented" → all map to the same stem, allowing dedup).

function isConsonant(word, i) {
  const c = word[i];
  if ('aeiou'.includes(c)) return false;
  if (c === 'y') return i === 0 || !isConsonant(word, i - 1);
  return true;
}

function measure(stem) {
  // Count VC sequences (consonant-vowel transitions)
  let cv = '';
  for (let i = 0; i < stem.length; i++) {
    cv += isConsonant(stem, i) ? 'c' : 'v';
  }
  return (cv.match(/vc/gi) || []).length;
}

function hasVowel(stem) {
  for (let i = 0; i < stem.length; i++) {
    if (!isConsonant(stem, i)) return true;
  }
  return false;
}

function endsWith(word, suffix) {
  return word.endsWith(suffix);
}

/**
 * Lightweight Porter stemmer — strip common English suffixes.
 * Not a full implementation; handles the most impactful cases
 * for prompt text normalization.
 */
export function porterStem(word) {
  if (!word || word.length < 3) return word || '';
  let w = word.toLowerCase();

  // Step 1a: plurals and -ed/-ing
  if (endsWith(w, 'sses')) w = w.slice(0, -2);
  else if (endsWith(w, 'ies')) w = w.slice(0, -2);
  else if (endsWith(w, 'ss')) { /* keep */ }
  else if (endsWith(w, 's') && w.length > 3) w = w.slice(0, -1);

  if (endsWith(w, 'eed')) {
    if (measure(w.slice(0, -3)) > 0) w = w.slice(0, -1);
  } else if (endsWith(w, 'ed') && hasVowel(w.slice(0, -2))) {
    w = w.slice(0, -2);
    if (endsWith(w, 'at') || endsWith(w, 'bl') || endsWith(w, 'iz')) w += 'e';
  } else if (endsWith(w, 'ing') && hasVowel(w.slice(0, -3))) {
    w = w.slice(0, -3);
    if (endsWith(w, 'at') || endsWith(w, 'bl') || endsWith(w, 'iz')) w += 'e';
  }

  // Step 1b: -y → -i
  if (endsWith(w, 'y') && hasVowel(w.slice(0, -1)) && w.length > 2) {
    w = w.slice(0, -1) + 'i';
  }

  // Step 2: common suffixes
  const step2 = {
    'ational': 'ate', 'tional': 'tion', 'enci': 'ence', 'anci': 'ance',
    'izer': 'ize', 'isation': 'ize', 'ization': 'ize',
    'ation': 'ate', 'ator': 'ate', 'alism': 'al', 'iveness': 'ive',
    'fulness': 'ful', 'ousness': 'ous', 'aliti': 'al', 'iviti': 'ive',
    'biliti': 'ble', 'alli': 'al', 'entli': 'ent', 'eli': 'e',
    'ousli': 'ous',
  };
  for (const [suffix, repl] of Object.entries(step2)) {
    if (endsWith(w, suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 0) w = stem + repl;
      break;
    }
  }

  // Step 3
  const step3 = {
    'icate': 'ic', 'ative': '', 'alize': 'al', 'iciti': 'ic',
    'ical': 'ic', 'ful': '', 'ness': '',
  };
  for (const [suffix, repl] of Object.entries(step3)) {
    if (endsWith(w, suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 0) w = stem + repl;
      break;
    }
  }

  return w;
}

// ─── NPMI COLLOCATION SCORER ──────────────────────────────────────────────────
// Adapted from Gensim's phrases.py — Normalized Pointwise Mutual Information.
// Scores how strongly two words co-occur relative to their individual frequencies.
// Range: -1 (never co-occur) to +1 (always co-occur).
// High NPMI collocations are multi-word expressions that should be treated as units.

const CONNECTOR_WORDS = new Set([
  'a', 'an', 'the', 'for', 'of', 'with', 'without', 'at', 'from',
  'to', 'in', 'on', 'by', 'and', 'or',
]);

/**
 * Build a frequency vocabulary from tokenized text.
 * Counts unigrams and bigrams (with connector words bridging).
 *
 * @param {string[]} words - Array of lowercase tokens
 * @returns {{ unigrams: Map<string,number>, bigrams: Map<string,number>, total: number }}
 */
export function buildVocab(words) {
  const unigrams = new Map();
  const bigrams = new Map();
  let total = 0;

  for (const w of words) {
    unigrams.set(w, (unigrams.get(w) || 0) + 1);
    total++;
  }

  // Bigrams with connector bridging (Gensim approach)
  let startToken = null;
  const inBetween = [];

  for (const word of words) {
    if (!CONNECTOR_WORDS.has(word)) {
      if (startToken) {
        const phrase = [startToken, ...inBetween, word].join(' ');
        bigrams.set(phrase, (bigrams.get(phrase) || 0) + 1);
      }
      startToken = word;
      inBetween.length = 0;
    } else if (startToken) {
      inBetween.push(word);
    }
  }

  return { unigrams, bigrams, total };
}

/**
 * Score a bigram using NPMI (Normalized Pointwise Mutual Information).
 * Directly ported from Gensim's npmi_scorer.
 *
 * @param {number} wordaCount - Frequency of first word
 * @param {number} wordbCount - Frequency of second word
 * @param {number} bigramCount - Frequency of the bigram
 * @param {number} corpusWordCount - Total words in corpus
 * @param {number} minCount - Minimum frequency threshold
 * @returns {number} NPMI score in [-1, 1] or -Infinity
 */
export function npmiScore(wordaCount, wordbCount, bigramCount, corpusWordCount, minCount = 2) {
  if (bigramCount < minCount) return -Infinity;
  const pa = wordaCount / corpusWordCount;
  const pb = wordbCount / corpusWordCount;
  const pab = bigramCount / corpusWordCount;
  if (pab <= 0 || pa <= 0 || pb <= 0) return -Infinity;
  const pmi = Math.log(pab / (pa * pb));
  const npmi = pmi / -Math.log(pab);
  return npmi;
}

/**
 * Find high-value collocations in text using NPMI scoring.
 * These are multi-word expressions that should be compressed as units.
 *
 * @param {string} text - Input text
 * @param {object} options
 * @param {number} options.threshold - NPMI threshold (default: 0.3)
 * @param {number} options.minCount - Minimum co-occurrence count (default: 2)
 * @param {number} options.maxResults - Maximum collocations to return (default: 20)
 * @returns {Array<{phrase: string, score: number, count: number}>}
 */
export function findCollocations(text, options = {}) {
  if (!text) return [];
  const { threshold = 0.3, minCount = 2, maxResults = 20 } = options;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 10) return [];

  const { unigrams, bigrams, total } = buildVocab(words);
  const results = [];

  for (const [phrase, count] of bigrams) {
    if (count < minCount) continue;
    // Extract the start and end words (ignoring connector words)
    const parts = phrase.split(/\s+/);
    const wordA = parts[0];
    const wordB = parts[parts.length - 1];
    const countA = unigrams.get(wordA) || 0;
    const countB = unigrams.get(wordB) || 0;

    const score = npmiScore(countA, countB, count, total, minCount);
    if (score >= threshold) {
      results.push({ phrase, score, count });
    }
  }

  return results
    .sort((a, b) => (b.score * b.count) - (a.score * a.count))
    .slice(0, maxResults);
}

// ─── TF-IDF IMPORTANCE SCORING ────────────────────────────────────────────────
// Adapted from Gensim's tfidfmodel.py — adapted for single-document use.
// In prompt compression, "document frequency" is approximated by how common
// a word is in general English (using our stopword list as proxy).
// High TF-IDF = content word (preserve); Low TF-IDF = boilerplate (compress).

/**
 * Compute term importance scores for words in a text.
 * Uses TF (term frequency) weighted by inverse "commonality"
 * (stopwords get low scores, rare domain terms get high scores).
 *
 * @param {string} text - Input text
 * @returns {Map<string, number>} Word → importance score (0 to 1, normalized)
 */
export function computeImportance(text) {
  if (!text) return new Map();
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Map();

  const freq = new Map();
  for (const w of words) {
    const clean = w.replace(/[^a-z0-9]/g, '');
    if (!clean) continue;
    freq.set(clean, (freq.get(clean) || 0) + 1);
  }

  const scores = new Map();
  const maxFreq = Math.max(...freq.values());

  for (const [word, count] of freq) {
    // TF: normalized by max frequency
    const tf = count / maxFreq;

    // IDF proxy: stopwords → low weight, content words → high weight
    let idfWeight;
    if (PROMPT_SAFE_STOPWORDS.has(word)) {
      idfWeight = 0.1; // Very common structural word
    } else if (PROMPT_INTENT_WORDS.has(word)) {
      idfWeight = 1.0; // Critical intent word — preserve
    } else if (word.length <= 2) {
      idfWeight = 0.2;
    } else if (word.length <= 4) {
      idfWeight = 0.5;
    } else {
      idfWeight = 0.8 + (word.length > 8 ? 0.2 : 0); // Longer = more specific
    }

    scores.set(word, tf * idfWeight);
  }

  return scores;
}

// ─── CLAUSE DEDUPLICATION ─────────────────────────────────────────────────────
// Detects near-duplicate sentences/clauses using stemmed n-gram overlap
// (Jaccard similarity on stemmed tokens). Informed by NLTK's edit_distance
// concept but using a faster set-based approach.

/**
 * Compute Jaccard similarity between two sets.
 */
function jaccard(setA, setB) {
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Convert a sentence into a set of stemmed content tokens (for comparison).
 */
function sentenceFingerprint(sentence) {
  const words = sentence.toLowerCase().split(/\s+/).filter(Boolean);
  const stems = new Set();
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, '');
    if (!clean || clean.length < 3) continue;
    if (PROMPT_SAFE_STOPWORDS.has(clean)) continue;
    stems.add(porterStem(clean));
  }
  return stems;
}

/**
 * Find near-duplicate clauses in text using stemmed Jaccard similarity.
 * Returns the text with redundant clauses removed.
 *
 * @param {string} text - Input text
 * @param {number} threshold - Similarity threshold (default: 0.65)
 * @returns {{ deduplicated: string, removed: number }}
 */
export function deduplicateClauses(text, threshold = 0.65) {
  if (!text) return { deduplicated: '', removed: 0 };
  // Split on sentence boundaries
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) return { deduplicated: text, removed: 0 };

  const fingerprints = sentences.map(s => sentenceFingerprint(s));
  const keep = new Array(sentences.length).fill(true);
  let removed = 0;

  for (let i = 1; i < sentences.length; i++) {
    if (!keep[i]) continue;
    if (fingerprints[i].size < 2) continue; // Too short to meaningfully compare

    for (let j = 0; j < i; j++) {
      if (!keep[j]) continue;
      if (fingerprints[j].size < 2) continue;

      const sim = jaccard(fingerprints[i], fingerprints[j]);
      if (sim >= threshold) {
        // Keep the longer (more informative) sentence, remove the shorter
        if (sentences[i].length <= sentences[j].length) {
          keep[i] = false;
        } else {
          keep[j] = false;
        }
        removed++;
        break;
      }
    }
  }

  const deduplicated = sentences.filter((_, i) => keep[i]).join(' ');
  return { deduplicated, removed };
}

// ─── REDUNDANT MODIFIER STRIPPING ─────────────────────────────────────────────
// Identifies and removes hedging language, redundant qualifiers, and
// filler modifiers that don't add information to LLM instructions.
// Informed by POS-based filtering concepts from NLTK/spaCy taggers.

const REDUNDANT_MODIFIERS = [
  // Hedging / qualification (adds no value in LLM prompts)
  'very', 'really', 'quite', 'rather', 'somewhat', 'fairly', 'pretty',
  'especially', 'particularly', 'extremely', 'incredibly', 'absolutely',
  'totally', 'completely', 'entirely', 'thoroughly', 'utterly',
  // Temporal filler
  'currently', 'presently', 'actually', 'basically', 'essentially',
  'generally', 'typically', 'usually', 'normally', 'often', 'frequently',
  // Meta-discourse (doesn't change the instruction)
  'obviously', 'clearly', 'evidently', 'certainly', 'definitely',
  'undoubtedly', 'surely', 'indeed', 'truly', 'simply',
];

// Compile as regex for efficient matching
const MODIFIER_REGEX = new RegExp(
  `\\b(${REDUNDANT_MODIFIERS.join('|')})\\b\\s*`, 'gi'
);

/**
 * Strip redundant modifiers from text.
 * These are adverbs/qualifiers that add no information to LLM prompts.
 * Protects content inside quotes, backticks, and code blocks.
 *
 * @param {string} text - Input text
 * @returns {{ stripped: string, count: number }}
 */
export function stripRedundantModifiers(text) {
  if (!text) return { stripped: '', count: 0 };
  let count = 0;

  // Protect quoted/code content by temporarily replacing with placeholders
  const protectedSegments = [];
  let protectedText = text.replace(/("[^"]*"|'[^']*'|`[^`]*`|```[\s\S]*?```)/g, (match) => {
    const idx = protectedSegments.length;
    protectedSegments.push(match);
    return `__PROTECTED_${idx}__`;
  });

  protectedText = protectedText.replace(MODIFIER_REGEX, () => {
    count++;
    return '';
  });

  // Restore protected segments
  for (let i = 0; i < protectedSegments.length; i++) {
    protectedText = protectedText.replace(`__PROTECTED_${i}__`, protectedSegments[i]);
  }

  return { stripped: protectedText.replace(/ {2,}/g, ' ').trim(), count };
}

// ─── SEMANTIC SENTENCE COMPRESSION ────────────────────────────────────────────
// Compresses individual sentences by removing low-importance content words
// while preserving grammatical skeleton and intent words.

/**
 * Compress a sentence by removing low-importance non-structural words.
 * Preserves sentence meaning by keeping:
 * - Intent words (not, must, should, etc.)
 * - High-importance content words (nouns, verbs by heuristic)
 * - Structural connectors needed for grammar
 *
 * @param {string} sentence - Single sentence to compress
 * @param {Map<string, number>} importanceScores - Word importance map
 * @param {number} aggressiveness - 0 to 1, how aggressive to compress (default: 0.3)
 * @returns {string}
 */
export function compressSentence(sentence, importanceScores, aggressiveness = 0.3) {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length < 5) return sentence;

  const result = [];
  for (let idx = 0; idx < words.length; idx++) {
    const word = words[idx];
    const lower = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!lower) { result.push(word); continue; }

    // Always keep intent words
    if (PROMPT_INTENT_WORDS.has(lower)) { result.push(word); continue; }

    // Keep uppercase words (likely acronyms, SQL keywords, identifiers)
    if (word === word.toUpperCase() && word.length >= 2) { result.push(word); continue; }

    // Always keep words not in stopword set (likely content words)
    if (!PROMPT_SAFE_STOPWORDS.has(lower)) { result.push(word); continue; }

    // For stopwords, keep if importance score is above threshold
    const importance = importanceScores.get(lower) || 0;
    if (importance > aggressiveness) { result.push(word); continue; }

    // Check adjacency: keep structural words next to content words
    if (idx < words.length - 1) {
      const nextWord = words[idx + 1]?.toLowerCase().replace(/[^a-z]/g, '');
      if (nextWord && !PROMPT_SAFE_STOPWORDS.has(nextWord)) {
        if (['a', 'an', 'the'].includes(lower)) {
          if (aggressiveness < 0.5) { result.push(word); continue; }
        }
      }
    }

    // Remove this low-importance stopword
  }

  return result.join(' ');
}

// ─── MAIN NLP COMPRESSION FUNCTION ────────────────────────────────────────────

/**
 * Apply NLP-powered compression to text.
 * This is the unified entry point that chains all NLP techniques.
 *
 * @param {string} text - Input text (already through basic dict compression)
 * @param {object} options
 * @param {number} options.aggressiveness - 0 (gentle) to 1 (maximum) compression (default: 0.4)
 * @param {boolean} options.dedup - Enable clause deduplication (default: true)
 * @param {boolean} options.stripModifiers - Strip redundant modifiers (default: true)
 * @param {boolean} options.collocations - Find & compress collocations (default: true)
 * @returns {{ compressed: string, nlpStats: object }}
 */
export function nlpCompress(text, options = {}) {
  if (!text || !text.trim()) return { compressed: text || '', nlpStats: { clausesRemoved: 0, modifiersStripped: 0, collocationsFound: 0 }, collocations: [] };
  const {
    aggressiveness = 0.4,
    dedup = true,
    stripModifiers = true,
  } = options;

  let result = text;
  const stats = {
    clausesRemoved: 0,
    modifiersStripped: 0,
    collocationsFound: 0,
  };

  // Phase A: Clause deduplication (remove semantically redundant sentences)
  if (dedup) {
    const dedupResult = deduplicateClauses(result, 0.65);
    result = dedupResult.deduplicated;
    stats.clausesRemoved = dedupResult.removed;
  }

  // Phase B: Strip redundant modifiers
  if (stripModifiers) {
    const modResult = stripRedundantModifiers(result);
    result = modResult.stripped;
    stats.modifiersStripped = modResult.count;
  }

  // Phase C: Find collocations for pattern compression
  const collocations = findCollocations(result, {
    threshold: 0.3,
    minCount: 2,
    maxResults: 15,
  });
  stats.collocationsFound = collocations.length;

  // Phase D: Importance-weighted sentence compression
  if (aggressiveness > 0.2) {
    const importance = computeImportance(result);
    const sentences = result.split(/(?<=[.!?])\s+/);
    const compressed = sentences.map(s => compressSentence(s, importance, aggressiveness));
    result = compressed.join(' ');
  }

  // Clean up whitespace
  result = result.replace(/ {2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  return {
    compressed: result,
    nlpStats: stats,
    collocations,
  };
}
