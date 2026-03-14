// TokenShrink Domain Rotor — Supabase
// Pre-built vocabulary pack for Supabase projects.
// All entries satisfy: term.length - abbr.length >= 3
// No overlap with base dictionaries (COMMON, PHRASES, CODE_DOMAIN).

/**
 * Supabase specific vocabulary.
 * @type {Array<{abbr: string, term: string}>}
 */
export const SUPABASE_VOCAB = [
  // ── Client / SDK ─────────────────────────────────────────────────────────
  { abbr: 'SB',   term: 'supabase' },              // 8 - 2 = 6 saved
  { abbr: 'SBC',  term: 'createClient' },          // 12 - 3 = 9 saved ★
  { abbr: 'SBCC', term: 'createServerClient' },    // 18 - 4 = 14 saved ★
  { abbr: 'SBCB', term: 'createBrowserClient' },   // 19 - 4 = 15 saved ★

  // ── Auth ──────────────────────────────────────────────────────────────────
  { abbr: 'AUT',  term: 'authentication' },        // 14 - 3 = 11 saved ★
  { abbr: 'AUZ',  term: 'authorization' },         // 13 - 3 = 10 saved ★
  { abbr: 'JWT',  term: 'supabase.auth' },         // 12 - 3 = 9 saved ★
  { abbr: 'OTP',  term: 'signInWithOtp' },         // 13 - 3 = 10 saved ★
  { abbr: 'OAU',  term: 'signInWithOAuth' },       // 15 - 3 = 12 saved ★
  { abbr: 'SSN',  term: 'getSession' },            // 10 - 3 = 7 saved
  { abbr: 'USR',  term: 'getUser' },               // 7 - 3 = 4 saved

  // ── Database ──────────────────────────────────────────────────────────────
  { abbr: 'RLS',  term: 'Row Level Security' },    // 18 - 3 = 15 saved ★
  { abbr: 'PG',   term: 'PostgreSQL' },            // 10 - 2 = 8 saved ★
  { abbr: 'MGR',  term: 'migration' },             // 9 - 3 = 6 saved
  // ── Storage / Realtime / Edge ─────────────────────────────────────────────
  { abbr: 'STG',  term: 'storage' },               // 7 - 3 = 4 saved
  { abbr: 'RLT',  term: 'realtime' },              // 8 - 3 = 5 saved
  { abbr: 'EFN',  term: 'Edge Function' },         // 13 - 3 = 10 saved ★
  { abbr: 'BKT',  term: 'createBucket' },          // 12 - 3 = 9 saved ★

  // ── Policy / Config ───────────────────────────────────────────────────────
  { abbr: 'PLY',  term: 'policy' },                // 6 - 3 = 3 saved
  { abbr: 'ENV',  term: 'NEXT_PUBLIC_SUPABASE_URL' }, // 24 - 3 = 21 saved ★
  { abbr: 'ANK',  term: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' }, // 30 - 3 = 27 saved ★
];
