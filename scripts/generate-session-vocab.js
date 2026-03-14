#!/usr/bin/env node
// TokenShrink Session Vocabulary Generator
// Analyzes your CLAUDE.md + vault to generate a session-level codebook.
// Run once: node scripts/generate-session-vocab.js
// Output: prints the [SESSION VOCAB] block to add to CLAUDE.md

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { generateCodebook, formatRosettaBlock } from '../sdk/src/codebook.js';

const HOME = process.env.HOME;

// Source files to analyze — highest-frequency terms live here
const SOURCES = [
  `${HOME}/.claude/CLAUDE.md`,
  `/Volumes/AI-Models/claude/Status Board.md`,
  `/Volumes/AI-Models/claude/Session Handoff.md`,
  `/Volumes/AI-Models/claude/The Ecosystem.md`,
].filter(existsSync);

const allText = SOURCES.map(f => readFileSync(f, 'utf8')).join('\n');

const codebook = generateCodebook(allText, { maxEntries: 20, minFrequency: 3 });

if (codebook.length === 0) {
  console.log('No high-value terms found. Try lowering minFrequency.');
  process.exit(0);
}

console.log('# Suggested SESSION VOCAB for CLAUDE.md\n');
console.log('# Impact = tokens_saved × session_frequency (higher = more valuable)\n');
console.log('# Term                        Abbr   Impact');
console.log('# ' + '-'.repeat(50));
for (const { term, abbr, tokensSaved, frequency, score } of codebook) {
  const pad = ' '.repeat(Math.max(1, 30 - term.length));
  console.log(`# ${term}${pad}${abbr}     ${String(score).padStart(3)} (${tokensSaved}t × ${frequency})`);
}

console.log('\n' + formatRosettaBlock(codebook));
