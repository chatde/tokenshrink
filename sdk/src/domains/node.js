// TokenShrink Domain Rotor — Node.js / Express
// Pre-built vocabulary pack for Node.js and Express codebases.
// All entries satisfy: term.length - abbr.length >= 3
// No overlap with base dictionaries (COMMON, PHRASES, CODE_DOMAIN).

/**
 * Node.js and Express specific vocabulary.
 * @type {Array<{abbr: string, term: string}>}
 */
export const NODE_VOCAB = [
  // ── Express.js ───────────────────────────────────────────────────────────
  { abbr: 'CTL', term: 'controller' },             // 10 - 3 = 7 saved
  { abbr: 'MWR', term: 'middleware' },             // 10 - 3 = 7 saved
  { abbr: 'RTR', term: 'router' },                 // 6 - 3 = 3 saved
  { abbr: 'SVC', term: 'service' },                // 7 - 3 = 4 saved
  { abbr: 'RSP', term: 'response' },               // 8 - 3 = 5 saved
  { abbr: 'EXP', term: 'express()' },              // 9 - 3 = 6 saved
  { abbr: 'EPT', term: 'endpoint' },               // 8 - 3 = 5 saved

  // ── Node.js Core ─────────────────────────────────────────────────────────
  { abbr: 'EVT', term: 'EventEmitter' },           // 12 - 3 = 9 saved ★
  { abbr: 'STR', term: 'ReadableStream' },         // 14 - 3 = 11 saved ★
  { abbr: 'WRS', term: 'WritableStream' },         // 14 - 3 = 11 saved ★
  { abbr: 'FSP', term: 'fs.promises' },            // 11 - 3 = 8 saved ★
  { abbr: 'PRC', term: 'process.env' },            // 11 - 3 = 8 saved ★
  { abbr: 'PRX', term: 'process.exit' },           // 12 - 3 = 9 saved ★
  { abbr: 'PTH', term: 'path.join' },              // 9 - 3 = 6 saved
  { abbr: 'CPT', term: 'child_process' },          // 13 - 3 = 10 saved ★

  // ── Async Patterns ────────────────────────────────────────────────────────
  { abbr: 'PRO', term: 'Promise.all' },            // 11 - 3 = 8 saved ★
  { abbr: 'PRS', term: 'Promise.allSettled' },     // 18 - 3 = 15 saved ★
  { abbr: 'TRY', term: 'try/catch' },              // 9 - 3 = 6 saved

  // ── Package / Project ─────────────────────────────────────────────────────
  { abbr: 'PKG', term: 'package.json' },           // 12 - 3 = 9 saved ★
  { abbr: 'LCK', term: 'package-lock.json' },      // 17 - 3 = 14 saved ★
  { abbr: 'NVM', term: 'node_modules' },           // 12 - 3 = 9 saved ★
];
