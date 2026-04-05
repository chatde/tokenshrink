// v3.0 Huffman frequency tables — Tier A/B split
// All entries verified to be NEW (not already in dictionaries.js PHRASES/COMMON)
// and confirmed to save ≥1 token with no meaning change.
//
// Tier A: universally known, always applied, no Rosetta header cost
// Tier B: requires Rosetta header — only activates when originalTokens >= 400
//         AND projected savings exceed header cost by 20% margin

export const TIER_A_PHRASES = {
  // Single-word synonyms universally understood by all major LLMs
  // Safe: no infinitive-stripping, no ambiguity, not in existing PHRASES/COMMON
  utilize: 'use',       // 2t → 1t
  utilizes: 'uses',     // 2t → 1t
  utilizing: 'using',   // 2t → 1t
};

export const TIER_B_PHRASES = {
  // Phrases not already in PHRASES dict — new savings only
  // All verified: meaning preserved, token-positive, not in existing dictionaries.js

  // From pilot analysis
  'takes into consideration': 'considers',     // 4t → 2t
  'before proceeding with': 'before',          // 3t → 1t ("before proceeding with X" → "before X")
  'backward compatibility': 'compat',          // 3t → 1t
  'it is worth noting that': 'note:',          // 5t → 1t
  'it is worth noting': 'note:',               // 4t → 1t
  'with respect to': 'regarding',              // 3t → 1t
  'in accordance with': 'per',                 // 3t → 1t
  'on a regular basis': 'regularly',           // 4t → 1t
  'in a timely manner': 'promptly',            // 4t → 1t
  'in the near future': 'soon',                // 4t → 1t

  // From MiniMax generation (filtered: duplicates + risky meaning-changers removed)
  'with the help of': 'using',                 // 4t → 1t
  'to the extent possible': 'if possible',     // 4t → 2t
  'as soon as possible': 'ASAP',               // 4t → 1t
  'in spite of the fact that': 'despite',      // 6t → 1t
  'as a matter of fact': 'actually',           // 4t → 1t
  'for the time being': 'for now',             // 3t → 2t
  'if and when': 'if',                         // 3t → 1t
  'in the absence of': 'without',              // 3t → 1t
  'in the presence of': 'with',               // 3t → 1t
  'under the assumption that': 'assuming',     // 4t → 1t
  'at the moment': 'now',                      // 3t → 1t
  'in the near term': 'soon',                  // 3t → 1t
  'in the course of': 'during',               // 3t → 1t
};

export const TIER_B_MIN_TOKENS = 400;
export const TIER_B_MARGIN = 1.2; // savings must exceed header cost by 20%
