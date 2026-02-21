#!/usr/bin/env node
/**
 * generate-token-costs.mjs
 *
 * Dev-only script that tokenizes every dictionary entry using gpt-tokenizer (cl100k_base)
 * and outputs sdk/src/token-costs.js with:
 *   - TOKEN_COSTS: Map of word/phrase → token count
 *   - ZERO_SAVINGS: Set of originals where replacement saves 0 tokens
 *   - NEGATIVE_SAVINGS: Set of originals where replacement costs MORE tokens
 *
 * Uses a COMPREHENSIVE word list (not just current dictionaries) so safety nets
 * are maintained even after dictionary cleanup.
 *
 * Usage: node scripts/generate-token-costs.mjs
 * Requires: gpt-tokenizer (devDependency)
 */

import { encode } from 'gpt-tokenizer';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Import current dictionaries
const dictsPath = join(ROOT, 'sdk/src/dictionaries.js');
const { COMMON, PHRASES, CODE_DOMAIN, MEDICAL_DOMAIN, LEGAL_DOMAIN, BUSINESS_DOMAIN } =
  await import(dictsPath);

function countTokens(text) {
  return encode(text).length;
}

// Comprehensive word list — includes ALL entries that were ever in the dictionaries
// This ensures ZERO_SAVINGS and NEGATIVE_SAVINGS safety nets cover historical entries
// even after dictionary cleanup.
const HISTORICAL_ENTRIES = {
  // v1.0 COMMON entries (removed in v2.0 for zero/negative savings)
  'function': 'fn', 'variable': 'var', 'constant': 'const', 'parameter': 'param',
  'argument': 'arg', 'return': 'ret', 'string': 'str', 'number': 'num',
  'boolean': 'bool', 'integer': 'int', 'array': 'arr', 'object': 'obj',
  'undefined': 'undef', 'null': 'nil', 'database': 'db', 'configuration': 'cfg',
  'authentication': 'auth', 'authorization': 'authz', 'application': 'app',
  'environment': 'env', 'development': 'dev', 'production': 'prod',
  'repository': 'repo', 'directory': 'dir', 'message': 'msg', 'request': 'req',
  'response': 'res', 'information': 'info', 'description': 'desc',
  'documentation': 'docs', 'implementation': 'impl', 'initialize': 'init',
  'temperature': 'temp', 'maximum': 'max', 'minimum': 'min',
  'administrator': 'admin', 'management': 'mgmt', 'component': 'comp',
  'performance': 'perf', 'reference': 'ref', 'property': 'prop',
  'properties': 'props', 'attribute': 'attr', 'attributes': 'attrs',
  'element': 'el', 'elements': 'els', 'index': 'idx', 'length': 'len',
  'previous': 'prev', 'current': 'curr', 'temporary': 'tmp',
  'calculate': 'calc', 'generation': 'gen', 'original': 'orig',
  'destination': 'dest', 'source': 'src', 'memory': 'mem', 'address': 'addr',
  'context': 'ctx', 'expression': 'expr', 'condition': 'cond', 'callback': 'cb',
  'middleware': 'mw', 'transaction': 'txn', 'connection': 'conn',
  'exception': 'exc', 'collection': 'coll', 'iteration': 'iter',
  'navigation': 'nav', 'notification': 'notif', 'subscription': 'sub',
  'certificate': 'cert', 'dependency': 'dep', 'dependencies': 'deps',
  'package': 'pkg', 'packages': 'pkgs', 'library': 'lib', 'libraries': 'libs',
  'utility': 'util', 'utilities': 'utils', 'example': 'ex', 'examples': 'exs',
  'synchronize': 'sync', 'asynchronous': 'async', 'execute': 'exec',
  'command': 'cmd', 'commands': 'cmds', 'arguments': 'args', 'optional': 'opt',
  'required': 'reqd', 'permission': 'perm', 'permissions': 'perms',
  'operation': 'op', 'operations': 'ops', 'resource': 'rsc', 'resources': 'rscs',
  'identifier': 'id', 'identifiers': 'ids', 'significant': 'major',
  'appropriate': 'proper', 'approximately': '~',
  // SMS-style
  'you': 'u', 'your': 'ur', 'please': 'pls', 'because': 'bc', 'without': 'w/o',
  'through': 'thru', 'though': 'tho', 'although': 'altho', 'between': 'btwn',
  'should': 'shd', 'would': 'wd', 'about': 'abt',
  // Vowel-dropping
  'help': 'hlp', 'provide': 'prvd', 'provides': 'prvds', 'explain': 'expln',
  'include': 'incl', 'includes': 'incls', 'including': 'inclg',
  'consider': 'cnsdr', 'suggest': 'sgst', 'respond': 'rspnd',
  'different': 'diff', 'available': 'avail', 'following': 'fllwng',
  'handle': 'hndl', 'manage': 'mng', 'analyze': 'anlyz', 'review': 'rvw',
  'validate': 'vldt', 'necessary': 'ncsry', 'potential': 'ptntl',
  'improve': 'imprv', 'identify': 'idntfy', 'specific': 'spcfc',
  'relevant': 'rlvnt', 'recommend': 'rcmnd', 'understand': 'undrstd',
  'determine': 'dtrmn', 'implement': 'impl',
  // Long → short words
  'communicate': 'convey', 'comprehensive': 'full', 'particularly': 'esp',
  'specifically': 'esp', 'functionality': 'features', 'additionally': 'also',
  'consequently': 'so', 'requirements': 'reqs', 'automatically': 'auto',
  'immediately': 'now', 'successfully': 'OK', 'consistently': 'always',
  'optimization': 'optim', 'optimizations': 'optims', 'vulnerability': 'vuln',
  'vulnerabilities': 'vulns', 'unfortunately': 'sadly',
  'fundamentally': 'at core', 'alternatively': 'or', 'respectively': 'each',
  'systematically': 'methodically', 'consideration': 'factor',
  'considerations': 'factors',
  // Phrase entries that are zero/negative
  'for example': 'e.g.', 'that is': 'i.e.', 'in other words': 'i.e.',
  'such as': 'e.g.', 'to the extent that': 'insofar as',
  // v1.0 domain entries (removed in v2.0)
  'endpoint': 'ep', 'controller': 'ctrl', 'interface': 'iface',
  'abstract': 'abs', 'constructor': 'ctor', 'destructor': 'dtor',
  'encapsulation': 'encap', 'serialization': 'serial',
  'deserialization': 'deserial', 'microservice': 'µsvc', 'kubernetes': 'k8s',
  'patient': 'pt', 'hospital': 'hosp', 'medications': 'meds',
  'agreement': 'agmt', 'paragraph': 'para', 'subsection': 'subsec',
  'jurisdiction': 'juris', 'hereinafter': '(below)', 'aforementioned': '(above)',
  'notwithstanding': 'despite', 'hereby': '(now)', 'therein': 'in it',
  'thereof': 'of it', 'deliverable': 'dlv', 'organization': 'org',
  'department': 'dept',
};

// Merge all sources: current dictionaries + historical entries
const allEntries = {
  ...HISTORICAL_ENTRIES,
  ...COMMON, ...PHRASES,
  ...CODE_DOMAIN, ...MEDICAL_DOMAIN, ...LEGAL_DOMAIN, ...BUSINESS_DOMAIN,
};

const tokenCosts = new Map();
const zeroSavings = new Set();
const negativeSavings = new Set();
const positiveSavings = [];

console.log('TokenShrink Token Cost Generator (cl100k_base)\n');
console.log('='.repeat(70));

for (const [original, replacement] of Object.entries(allEntries)) {
  const origTokens = countTokens(original);
  const replTokens = replacement === '' ? 0 : countTokens(replacement);
  const savings = origTokens - replTokens;

  // Store token costs for all words we encounter
  if (!tokenCosts.has(original)) tokenCosts.set(original, origTokens);
  if (replacement && !tokenCosts.has(replacement)) tokenCosts.set(replacement, replTokens);

  if (savings === 0) {
    zeroSavings.add(original);
  } else if (savings < 0) {
    negativeSavings.add(original);
  } else {
    positiveSavings.push({ original, replacement, savings, origTokens, replTokens });
  }
}

console.log(`\nSUMMARY:`);
console.log(`  TOKEN_COSTS entries: ${tokenCosts.size}`);
console.log(`  Positive savings: ${positiveSavings.length} entries`);
console.log(`  Zero savings:     ${zeroSavings.size} entries`);
console.log(`  Negative savings: ${negativeSavings.size} entries`);

// Generate the output file
const tokenCostsObj = {};
for (const [word, cost] of [...tokenCosts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  tokenCostsObj[word] = cost;
}

const output = `// Auto-generated by scripts/generate-token-costs.mjs
// Tokenizer: cl100k_base (GPT-4 / ChatGPT)
// Generated: ${new Date().toISOString()}
//
// DO NOT EDIT — regenerate with: node scripts/generate-token-costs.mjs

/**
 * Token cost for known words/phrases using cl100k_base encoding.
 * Used as a fast lookup to avoid shipping a full tokenizer.
 */
export const TOKEN_COSTS = ${JSON.stringify(tokenCostsObj, null, 2)};

/**
 * Words where original → replacement saves ZERO tokens.
 * These should be skipped during compression.
 */
export const ZERO_SAVINGS = new Set(${JSON.stringify([...zeroSavings].sort(), null, 2)});

/**
 * Words where replacement costs MORE tokens than the original.
 * These must NEVER be applied.
 */
export const NEGATIVE_SAVINGS = new Set(${JSON.stringify([...negativeSavings].sort(), null, 2)});
`;

const outPath = join(ROOT, 'sdk/src/token-costs.js');
writeFileSync(outPath, output, 'utf-8');
console.log(`\nWritten to: ${outPath}`);
