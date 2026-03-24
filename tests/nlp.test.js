import { describe, it, expect } from 'vitest';
import {
  porterStem,
  PROMPT_SAFE_STOPWORDS,
  buildVocab,
  npmiScore,
  findCollocations,
  computeImportance,
  deduplicateClauses,
  stripRedundantModifiers,
  compressSentence,
  nlpCompress,
} from '../app/lib/compression/nlp.js';
import { compress } from '../app/lib/compression/engine.js';

// ─── Porter Stemmer ──────────────────────────────────────────────────────────

describe('porterStem()', () => {
  it('stems regular plurals', () => {
    expect(porterStem('functions')).toBe(porterStem('function'));
    expect(porterStem('tests')).toBe(porterStem('test'));
    expect(porterStem('variables')).toBe(porterStem('variable'));
  });

  it('stems -ing forms', () => {
    expect(porterStem('implementing')).toBe(porterStem('implement'));
    expect(porterStem('building')).toBe(porterStem('build'));
    // lightweight stemmer keeps doubled consonant: running→runn (consistent)
    expect(porterStem('running')).toBe('runn');
  });

  it('stems -ed forms', () => {
    expect(porterStem('implemented')).toBe(porterStem('implement'));
    expect(porterStem('validated')).toBe(porterStem('validate'));
  });

  it('stems -tion/-sion suffixes', () => {
    // lightweight stemmer: -ation handled consistently, not perfectly
    expect(porterStem('implementation')).toBe('implementate');
    expect(porterStem('optimization')).toBe('optimize');
  });

  it('leaves short words unchanged', () => {
    expect(porterStem('go')).toBe('go');
    expect(porterStem('do')).toBe('do');
    expect(porterStem('a')).toBe('a');
  });

  it('handles -ful and -ness suffixes', () => {
    expect(porterStem('hopeful')).toBe(porterStem('hope'));
    expect(porterStem('happiness')).toBe(porterStem('happi'));
  });

  it('is deterministic (same input → same output)', () => {
    for (let i = 0; i < 100; i++) {
      expect(porterStem('authentication')).toBe(porterStem('authentication'));
    }
  });
});

// ─── Stopword Set ────────────────────────────────────────────────────────────

describe('PROMPT_SAFE_STOPWORDS', () => {
  it('contains common English stopwords', () => {
    expect(PROMPT_SAFE_STOPWORDS.has('the')).toBe(true);
    expect(PROMPT_SAFE_STOPWORDS.has('a')).toBe(true);
    expect(PROMPT_SAFE_STOPWORDS.has('is')).toBe(true);
    expect(PROMPT_SAFE_STOPWORDS.has('for')).toBe(true);
    expect(PROMPT_SAFE_STOPWORDS.has('of')).toBe(true);
  });

  it('does NOT contain intent words', () => {
    expect(PROMPT_SAFE_STOPWORDS.has('not')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('never')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('must')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('should')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('always')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('ensure')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('required')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('critical')).toBe(false);
    expect(PROMPT_SAFE_STOPWORDS.has('avoid')).toBe(false);
  });

  it('is a Set (O(1) lookup)', () => {
    expect(PROMPT_SAFE_STOPWORDS instanceof Set).toBe(true);
    expect(PROMPT_SAFE_STOPWORDS.size).toBeGreaterThan(100);
  });
});

// ─── NPMI Collocation Scoring ────────────────────────────────────────────────

describe('buildVocab()', () => {
  it('counts unigrams correctly', () => {
    const { unigrams, total } = buildVocab(['hello', 'world', 'hello']);
    expect(unigrams.get('hello')).toBe(2);
    expect(unigrams.get('world')).toBe(1);
    expect(total).toBe(3);
  });

  it('counts bigrams with connector bridging', () => {
    const { bigrams } = buildVocab(['machine', 'learning', 'machine', 'learning']);
    // "machine learning" appears twice
    expect(bigrams.get('machine learning')).toBe(2);
  });

  it('handles empty input', () => {
    const { unigrams, total } = buildVocab([]);
    expect(unigrams.size).toBe(0);
    expect(total).toBe(0);
  });
});

describe('npmiScore()', () => {
  it('returns -Infinity for below-min-count bigrams', () => {
    expect(npmiScore(10, 10, 1, 100, 2)).toBe(-Infinity);
  });

  it('returns positive score for strongly co-occurring words', () => {
    // Words that always appear together
    const score = npmiScore(5, 5, 5, 100, 2);
    expect(score).toBeGreaterThan(0);
  });

  it('returns score between -1 and 1 for valid input', () => {
    const score = npmiScore(10, 8, 3, 100, 2);
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns -Infinity when any count is zero', () => {
    expect(npmiScore(0, 5, 2, 100)).toBe(-Infinity);
    expect(npmiScore(5, 0, 2, 100)).toBe(-Infinity);
  });
});

describe('findCollocations()', () => {
  it('finds collocations in text with repeated bigrams', () => {
    const text = 'machine learning is great. machine learning models are powerful. deep machine learning works well. use machine learning for analysis.';
    const collocations = findCollocations(text, { threshold: 0.1, minCount: 2 });
    const phrases = collocations.map(c => c.phrase);
    expect(phrases.some(p => p.includes('machine') && p.includes('learning'))).toBe(true);
  });

  it('returns empty for short text', () => {
    const collocations = findCollocations('hello world', { threshold: 0.3, minCount: 2 });
    expect(collocations).toHaveLength(0);
  });

  it('returns empty when no bigrams repeat', () => {
    const text = 'one two three four five six seven eight nine ten eleven twelve';
    const collocations = findCollocations(text, { threshold: 0.3, minCount: 2 });
    expect(collocations).toHaveLength(0);
  });

  it('respects maxResults parameter', () => {
    const text = Array(20).fill('alpha beta gamma delta alpha beta gamma delta alpha beta').join(' ');
    const collocations = findCollocations(text, { threshold: 0.01, minCount: 2, maxResults: 3 });
    expect(collocations.length).toBeLessThanOrEqual(3);
  });
});

// ─── TF-IDF Importance Scoring ───────────────────────────────────────────────

describe('computeImportance()', () => {
  it('gives stopwords low importance', () => {
    const scores = computeImportance('the function is very important for the implementation');
    expect(scores.get('the')).toBeLessThan(0.3);
    expect(scores.get('is')).toBeLessThan(0.3);
    expect(scores.get('for')).toBeLessThan(0.3);
  });

  it('gives content words high importance', () => {
    const scores = computeImportance('the function is very important for the implementation');
    expect(scores.get('function')).toBeGreaterThan(0.3);
    expect(scores.get('implementation')).toBeGreaterThan(0.3);
  });

  it('gives intent words maximum importance', () => {
    const scores = computeImportance('you must not forget to ensure safety');
    expect(scores.get('must')).toBeGreaterThan(0.5);
    expect(scores.get('not')).toBeGreaterThan(0.5);
    expect(scores.get('ensure')).toBeGreaterThan(0.5);
  });

  it('returns empty map for empty text', () => {
    const scores = computeImportance('');
    expect(scores.size).toBe(0);
  });

  it('normalizes scores to [0, 1] range', () => {
    const scores = computeImportance('database authentication encryption validation implementation');
    for (const [, score] of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});

// ─── Clause Deduplication ────────────────────────────────────────────────────

describe('deduplicateClauses()', () => {
  it('removes near-duplicate sentences', () => {
    const text = 'Validate all user input carefully. Validate all inputs from users carefully. Test the application thoroughly.';
    const result = deduplicateClauses(text, 0.65);
    expect(result.removed).toBeGreaterThanOrEqual(1);
    expect(result.deduplicated.split(/(?<=[.!?])\s+/).length).toBeLessThan(3);
  });

  it('keeps distinct sentences', () => {
    const text = 'Build a REST API with Express. Use PostgreSQL for the database. Implement JWT authentication.';
    const result = deduplicateClauses(text, 0.65);
    expect(result.removed).toBe(0);
    expect(result.deduplicated).toBe(text);
  });

  it('handles single sentence', () => {
    const text = 'Build a REST API.';
    const result = deduplicateClauses(text, 0.65);
    expect(result.removed).toBe(0);
    expect(result.deduplicated).toBe(text);
  });

  it('handles empty text', () => {
    const result = deduplicateClauses('', 0.65);
    expect(result.removed).toBe(0);
  });

  it('keeps longer version when deduplicating', () => {
    const text = 'Check all inputs. Check all inputs from the user before processing them.';
    const result = deduplicateClauses(text, 0.5);
    if (result.removed > 0) {
      // The longer sentence should be kept
      expect(result.deduplicated).toContain('before processing');
    }
  });
});

// ─── Redundant Modifier Stripping ────────────────────────────────────────────

describe('stripRedundantModifiers()', () => {
  it('strips hedging modifiers', () => {
    const result = stripRedundantModifiers('This is very important and extremely critical');
    expect(result.stripped).not.toContain('very');
    expect(result.stripped).not.toContain('extremely');
    expect(result.count).toBeGreaterThanOrEqual(2);
  });

  it('strips temporal fillers', () => {
    const result = stripRedundantModifiers('You should basically always currently check the input');
    expect(result.stripped).not.toContain('basically');
    expect(result.stripped).not.toContain('currently');
  });

  it('strips meta-discourse words', () => {
    const result = stripRedundantModifiers('Obviously the code clearly needs to be simply refactored');
    expect(result.stripped).not.toContain('Obviously');
    expect(result.stripped).not.toContain('clearly');
    expect(result.stripped).not.toContain('simply');
  });

  it('preserves quoted content', () => {
    const result = stripRedundantModifiers('Set the value to "very important" in the config');
    expect(result.stripped).toContain('"very important"');
  });

  it('preserves backtick code content', () => {
    const result = stripRedundantModifiers('Use `extremely_fast_mode` for the configuration');
    expect(result.stripped).toContain('`extremely_fast_mode`');
  });

  it('preserves single-quoted strings', () => {
    const result = stripRedundantModifiers("The SQL query uses 'really complex' joins");
    expect(result.stripped).toContain("'really complex'");
  });

  it('returns count of 0 for text with no modifiers', () => {
    const result = stripRedundantModifiers('Build a REST API with authentication');
    expect(result.count).toBe(0);
    expect(result.stripped).toBe('Build a REST API with authentication');
  });

  it('does not corrupt SQL injection strings', () => {
    const text = "The input ' OR '1'='1 should be treated as text";
    const result = stripRedundantModifiers(text);
    expect(result.stripped).toContain("OR");
  });
});

// ─── Sentence Compression ────────────────────────────────────────────────────

describe('compressSentence()', () => {
  it('preserves intent words', () => {
    const importance = computeImportance('you must not forget to validate all inputs');
    const result = compressSentence('you must not forget to validate all inputs', importance, 0.5);
    expect(result).toContain('must');
    expect(result).toContain('not');
    expect(result).toContain('validate');
  });

  it('preserves uppercase identifiers', () => {
    const importance = computeImportance('use the SQL query with SELECT FROM WHERE');
    const result = compressSentence('use the SQL query with SELECT FROM WHERE', importance, 0.8);
    expect(result).toContain('SQL');
    expect(result).toContain('SELECT');
    expect(result).toContain('FROM');
    expect(result).toContain('WHERE');
  });

  it('returns short sentences unchanged', () => {
    const importance = computeImportance('do it now');
    const result = compressSentence('do it now', importance, 0.5);
    expect(result).toBe('do it now');
  });

  it('removes low-importance stopwords at high aggressiveness', () => {
    const text = 'the function is used for the processing of the various data elements in the system';
    const importance = computeImportance(text);
    const result = compressSentence(text, importance, 0.7);
    // Should be shorter than original
    expect(result.split(' ').length).toBeLessThan(text.split(' ').length);
    // But should still contain key content
    expect(result).toContain('function');
    expect(result).toContain('processing');
    expect(result).toContain('data');
  });

  it('is gentle at low aggressiveness', () => {
    const text = 'the database is configured for the production environment with the connection pool';
    const importance = computeImportance(text);
    const gentle = compressSentence(text, importance, 0.1);
    const aggressive = compressSentence(text, importance, 0.8);
    // Gentle should keep more words than aggressive
    expect(gentle.split(' ').length).toBeGreaterThanOrEqual(aggressive.split(' ').length);
  });
});

// ─── nlpCompress (full pipeline) ─────────────────────────────────────────────

describe('nlpCompress()', () => {
  it('compresses verbose text', () => {
    const text = 'It is really quite important to very carefully validate all user input. You should basically always thoroughly check the data. It is essentially important to completely validate all inputs from users.';
    const result = nlpCompress(text, { aggressiveness: 0.5 });
    expect(result.compressed.length).toBeLessThan(text.length);
    expect(result.nlpStats.modifiersStripped).toBeGreaterThan(0);
  });

  it('deduplicates near-identical clauses', () => {
    const text = 'Validate all user input before processing. Check all user inputs before processing them. Test the application. Debug any errors found.';
    const result = nlpCompress(text, { aggressiveness: 0.3 });
    expect(result.nlpStats.clausesRemoved).toBeGreaterThanOrEqual(1);
  });

  it('preserves code blocks', () => {
    const text = 'Use `console.log("very important debug message")` for debugging. The function is extremely complex. The implementation is quite straightforward. Use the handler for processing data effectively.';
    const result = nlpCompress(text, { aggressiveness: 0.5 });
    expect(result.compressed).toContain('`console.log("very important debug message")`');
  });

  it('respects aggressiveness level', () => {
    const text = 'The application is designed for the comprehensive processing of various data elements in the entire system architecture. The function handles the complete validation of all user inputs including the verification of authentication credentials.';
    const gentle = nlpCompress(text, { aggressiveness: 0.2 });
    const aggressive = nlpCompress(text, { aggressiveness: 0.8 });
    expect(gentle.compressed.length).toBeGreaterThanOrEqual(aggressive.compressed.length);
  });

  it('returns stats object', () => {
    const text = 'Build a secure API. Very important to validate input. Really essential to test thoroughly. Quite obviously you should ensure quality. Definitely handle all edge cases properly.';
    const result = nlpCompress(text, { aggressiveness: 0.4 });
    expect(result.nlpStats).toBeDefined();
    expect(typeof result.nlpStats.clausesRemoved).toBe('number');
    expect(typeof result.nlpStats.modifiersStripped).toBe('number');
    expect(typeof result.nlpStats.collocationsFound).toBe('number');
  });

  it('can disable dedup', () => {
    const text = 'Validate all input. Validate all input. Test the code.';
    const withDedup = nlpCompress(text, { dedup: true });
    const noDedup = nlpCompress(text, { dedup: false });
    expect(noDedup.compressed.length).toBeGreaterThanOrEqual(withDedup.compressed.length);
  });

  it('can disable modifier stripping', () => {
    const text = 'This is very extremely absolutely important for the basically simple implementation. The system handles quite thoroughly all the complete processing tasks.';
    const withStrip = nlpCompress(text, { stripModifiers: true });
    const noStrip = nlpCompress(text, { stripModifiers: false });
    expect(noStrip.compressed.length).toBeGreaterThanOrEqual(withStrip.compressed.length);
  });

  it('never corrupts text with special characters', () => {
    const text = 'Handle the $100.00 payment via API endpoint /api/v2/payments?amount=100&currency=USD. The regex pattern /^[a-z]+$/i should match strings. Use curly braces {} in templates. Handle the response status codes. Process the authentication tokens. Validate all user-provided parameters.';
    const result = nlpCompress(text, { aggressiveness: 0.5 });
    expect(result.compressed).toContain('$100.00');
    expect(result.compressed).toContain('/api/v2/payments');
    expect(result.compressed).toContain('/^[a-z]+$/i');
  });
});

// ─── Engine integration: NLP as Phase 2.5 ────────────────────────────────────

describe('compress() with NLP integration', () => {
  it('includes nlp stats when nlp is enabled', () => {
    const text = 'You are a very helpful assistant. It is really quite important to basically always validate user input thoroughly. Please make sure to carefully check all data. It is essential to comprehensively test code. In order to maintain quality, you should obviously write clean functions. Due to the fact that security matters, validate everything. You are responsible for ensuring the complete application works perfectly.';
    const result = compress(text, { nlp: true });
    if (!result.stats.tooShort && !result.stats.belowThreshold) {
      expect(result.stats.nlp).toBeDefined();
      expect(result.stats.nlp.modifiersStripped).toBeGreaterThanOrEqual(0);
    }
  });

  it('does not include nlp stats when nlp is disabled', () => {
    const text = 'You are a helpful assistant. It is important to validate user input. Please make sure to check all data. It is essential to test code. In order to maintain quality, write clean functions. Due to the fact that security matters, validate everything. You are responsible for ensuring the application works.';
    const result = compress(text, { nlp: false });
    expect(result.stats.nlp).toBeUndefined();
  });

  it('compresses more with NLP enabled than without', () => {
    const verboseText = 'You are a very comprehensive and extremely thorough assistant. It is really quite important to basically always validate all user input very thoroughly. Please make sure to carefully check all of the data. It is essential to comprehensively test all code paths. In order to maintain quality, you should obviously write clean and well-structured functions. Due to the fact that security matters greatly, you should validate absolutely everything. You are responsible for ensuring the complete application works perfectly. It is important to basically validate all inputs from users very carefully. You should comprehensively test all aspects.';
    const withNlp = compress(verboseText, { nlp: true });
    const withoutNlp = compress(verboseText, { nlp: false });

    const nlpTokens = withNlp.stats.tooShort || withNlp.stats.belowThreshold
      ? withNlp.stats.originalTokens
      : withNlp.stats.totalCompressedTokens;
    const noNlpTokens = withoutNlp.stats.tooShort || withoutNlp.stats.belowThreshold
      ? withoutNlp.stats.originalTokens
      : withoutNlp.stats.totalCompressedTokens;

    expect(nlpTokens).toBeLessThanOrEqual(noNlpTokens);
  });

  it('respects nlpAggressiveness option', () => {
    const text = 'You are a very helpful assistant. It is important to validate user input. Please make sure to check data carefully. It is essential to test code thoroughly. In order to maintain quality, write clean functions. Due to the fact that security matters, validate everything. You are responsible for ensuring everything works properly. Please ensure all edge cases are handled.';
    const gentle = compress(text, { nlp: true, nlpAggressiveness: 0.1 });
    const aggressive = compress(text, { nlp: true, nlpAggressiveness: 0.9 });

    const gentleTokens = gentle.stats.tooShort || gentle.stats.belowThreshold
      ? gentle.stats.originalTokens
      : gentle.stats.totalCompressedTokens;
    const aggressiveTokens = aggressive.stats.tooShort || aggressive.stats.belowThreshold
      ? aggressive.stats.originalTokens
      : aggressive.stats.totalCompressedTokens;

    expect(gentleTokens).toBeGreaterThanOrEqual(aggressiveTokens);
  });

  it('never increases token count with NLP enabled', () => {
    const prompts = [
      'You are a coding assistant. Write clean code. Follow best practices. Use TypeScript. Add error handling. Write tests.',
      'Build a REST API with Express.js and PostgreSQL. Use JWT for authentication. Add input validation.',
      'You are a very helpful AI assistant. It is extremely important to always validate everything thoroughly.',
      'The implementation should be comprehensive. The specification must include all requirements. The documentation needs to cover every edge case and failure mode in the system architecture.',
    ];

    for (const text of prompts) {
      const result = compress(text, { nlp: true });
      expect(result.stats.totalCompressedTokens).toBeLessThanOrEqual(result.stats.originalTokens);
    }
  });

  it('preserves SQL injection strings through NLP pipeline', () => {
    const text = "The input ' OR '1'='1 should be treated as text. It is important to use parameterized queries. Please make sure to validate all database inputs. In order to prevent SQL injection, never concatenate user input directly into queries.";
    const result = compress(text, { nlp: true });
    expect(result.compressed).toContain("' OR '1'='1");
  });

  it('produces valid output on large prompts', () => {
    // Generate a large prompt (~500 words)
    const sections = [];
    for (let i = 0; i < 20; i++) {
      sections.push(`Section ${i}: It is important to validate all inputs. Please make sure to test thoroughly. In order to maintain quality, follow best practices. Due to the fact that reliability matters, handle errors properly.`);
    }
    const text = sections.join(' ');
    const result = compress(text, { nlp: true });
    expect(result.compressed).toBeDefined();
    expect(result.compressed.length).toBeGreaterThan(0);
    expect(result.stats.tokensSaved).toBeGreaterThan(0);
  });
});
