#!/usr/bin/env node
// TokenShrink Session Initializer
// Fires on SessionStart — analyzes the current project's vocabulary,
// generates a project-specific Rosetta Stone, and reports estimated savings.
// Injects [SESSION VOCAB] into context so Claude and user share the same language.

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const VOCAB_FILE = os.homedir() + '/.claude/session-vocab.json';
const SDK_PATH = '/Volumes/AI-Models/tokenshrink/sdk/src/codebook.js';

// Ecosystem-wide base vocab (always present regardless of project)
const BASE_VOCAB = [
  { abbr: 'SSD/', term: '/Volumes/AI-Models/' },
  { abbr: 'VAULT/', term: '/Volumes/AI-Models/claude/' },
  { abbr: 'TBIN/', term: '/data/data/com.termux/files/usr/bin/' },
  { abbr: 'TS', term: 'TokenShrink' },
  { abbr: 'LA', term: 'LaunchAgent' },
  { abbr: 'OL', term: 'Ollama' },
  { abbr: 'OC', term: 'OpenClaw' },
];

// Known project shortcuts (populated from Project Index)
const PROJECT_VOCAB = {
  lankapros:    { abbr: 'LP', term: 'LankaPros' },
  ifridge:      { abbr: 'IF', term: 'iFridge' },
  neuralcube:   { abbr: 'NC', term: 'NeuralCube' },
  tokenshrink:  { abbr: 'TS', term: 'TokenShrink' },
  apiguardrails:{ abbr: 'AG', term: 'API Guardrails' },
  'poh-coin':   { abbr: 'POH', term: 'Proof of Humanity' },
  wattson:      { abbr: 'WA', term: 'Wattson' },
  'jarvis-bot': { abbr: 'JV', term: 'JARVIS' },
  codexlib:     { abbr: 'CL', term: 'CodexLib' },
  '1ynlo':      { abbr: '1Y', term: '1YNLO' },
};

(async () => {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8').trim();

    let input = {};
    try { input = JSON.parse(raw); } catch {}

    // Detect current project from session working directory or cwd
    const cwd = input.cwd || process.cwd();
    const projectName = path.basename(cwd).toLowerCase();
    const projectVocab = PROJECT_VOCAB[projectName] || null;

    // Read project files for dynamic term extraction
    const sourceTexts = [];
    const candidates = [
      path.join(cwd, 'package.json'),
      path.join(cwd, 'CLAUDE.md'),
      path.join(cwd, 'README.md'),
    ];
    for (const f of candidates) {
      try { sourceTexts.push(fs.readFileSync(f, 'utf8')); } catch {}
    }

    // Also read the ecosystem CLAUDE.md for global context
    try { sourceTexts.push(fs.readFileSync(os.homedir() + '/.claude/CLAUDE.md', 'utf8')); } catch {}

    // Load existing vocab — curated entries are PRESERVED, dynamic ones may be refreshed
    let existingVocab = [];
    let isCurated = false;
    try {
      const existing = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
      existingVocab = existing.vocab || [];
      isCurated = !!existing._curated;
    } catch { /* file may not exist yet */ }

    // Start with curated entries (or base vocab if no file exists)
    const vocab = isCurated ? [...existingVocab] : [...BASE_VOCAB];

    // Add project-specific entry if not already present
    if (projectVocab && !vocab.find(v => v.abbr === projectVocab.abbr || v.term === projectVocab.term)) {
      vocab.push(projectVocab);
    }

    // Try dynamic codebook generation from project files (ONLY add new terms, never replace curated)
    if (sourceTexts.length > 0) {
      try {
        const { pathToFileURL } = require('url');
        const mod = await import(pathToFileURL(SDK_PATH).href);
        const generateCodebook = mod.generateCodebook;
        if (typeof generateCodebook === 'function') {
          const combined = sourceTexts.join('\n');
          // Higher minFrequency + minLength to avoid garbage like NE=NEVER or RE=remaining
          const dynamic = generateCodebook(combined, { maxEntries: 8, minFrequency: 5, minLength: 8 });
          for (const entry of dynamic) {
            if (!vocab.find(v => v.abbr === entry.abbr || v.term === entry.term)) {
              vocab.push({ abbr: entry.abbr, term: entry.term });
            }
          }
        }
      } catch { /* dynamic generation is optional */ }
    }

    // Estimate session savings (rough: assume each term appears 8× per session avg)
    const AVG_FREQUENCY = 8;
    let estimatedSavings = 0;
    for (const { abbr, term } of vocab) {
      const saved = Math.max(0, Math.round((term.length - abbr.length) * 0.25));
      estimatedSavings += saved * AVG_FREQUENCY;
    }

    // Write updated session vocab — preserve _curated flag so next session respects it
    fs.writeFileSync(VOCAB_FILE, JSON.stringify({
      _comment: 'TokenShrink session vocabulary — curated entries preserved; dynamic project terms added.',
      _generated: new Date().toISOString().slice(0, 10),
      _project: projectName,
      _curated: isCurated,
      vocab,
    }, null, 2));

    // ── Collision detection ───────────────────────────────────────────────────
    const abbrMap = new Map();
    const termMap = new Map();
    const collisions = [];
    for (const entry of vocab) {
      if (abbrMap.has(entry.abbr)) {
        collisions.push(`ABBR COLLISION: "${entry.abbr}" maps to both "${abbrMap.get(entry.abbr)}" and "${entry.term}"`);
      } else {
        abbrMap.set(entry.abbr, entry.term);
      }
      if (termMap.has(entry.term)) {
        collisions.push(`TERM COLLISION: "${entry.term}" has two abbreviations: "${termMap.get(entry.term)}" and "${entry.abbr}"`);
      } else {
        termMap.set(entry.term, entry.abbr);
      }
    }
    // Deduplicate collisions from vocab array (shouldn't happen but guard anyway)
    const dedupedVocab = vocab.filter((entry, idx) =>
      vocab.findIndex(e => e.abbr === entry.abbr) === idx
    );

    // ── Build Rosetta Stone block for context injection ───────────────────────
    const rosettaLines = ['[SESSION VOCAB]'];
    rosettaLines.push('// Use these abbreviations in both directions (compress your responses too)');
    for (const { abbr, term } of dedupedVocab) {
      rosettaLines.push(`${abbr}=${term}`);
    }
    rosettaLines.push('[/SESSION VOCAB]');
    rosettaLines.push(`Estimated session savings: ~${estimatedSavings} tokens`);
    if (collisions.length > 0) {
      rosettaLines.push(`[VOCAB WARNING] ${collisions.join('; ')}`);
    }

    // Output to Claude's context as a system message
    process.stdout.write(JSON.stringify({
      type: 'system',
      content: rosettaLines.join('\n'),
    }));

    process.exit(0);
  } catch {
    process.exit(0);
  }
})();
