#!/usr/bin/env node
// TokenShrink Claude Code Hook
// Compresses outgoing prompts to save tokens + logs per-event data for mirror

'use strict';

(async () => {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) process.exit(0);

    let input;
    try { input = JSON.parse(raw); } catch { process.exit(0); }

    let prompt = input.prompt;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) process.exit(0);

    const fs = require('fs');
    const home = require('os').homedir();

    // ── Layer 1: Session vocabulary (fires even if SDK unavailable) ──────────
    let vocabSaved = 0;
    const originalPrompt = prompt;
    try {
      const vocabFile = home + '/.claude/session-vocab.json';
      const { vocab } = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
      for (const { abbr, term } of vocab) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const before = prompt;
        prompt = prompt.replace(new RegExp(escaped, 'g'), abbr);
        if (prompt !== before) {
          // Rough token estimate: each char ≈ 0.25 tokens
          vocabSaved += Math.max(1, Math.round((term.length - abbr.length) * 0.25));
        }
      }
    } catch { /* session vocab is optional */ }

    // ── Layer 2: Phrase compression via SDK ──────────────────────────────────
    const SDK_PATH = '/Volumes/AI-Models/tokenshrink/sdk/src/index.js';
    let phraseSaved = 0;
    let compressedPrompt = prompt; // starts as vocab-substituted version
    try {
      const { pathToFileURL } = require('url');
      const mod = await import(pathToFileURL(SDK_PATH).href);
      const compressFn = mod.compress ?? mod.default?.compress;
      if (typeof compressFn === 'function') {
        const result = compressFn(prompt, { source: 'claude-code' });
        phraseSaved = result?.stats?.tokensSaved ?? 0;
        if (phraseSaved > 0) compressedPrompt = result.compressed;
      }
    } catch { /* phrase compression is optional — vocab savings still count */ }

    const totalSaved = vocabSaved + phraseSaved;
    if (totalSaved <= 0) process.exit(0);

    // ── Fail-safe: if compressed is longer than original, bail out ───────────
    // (should never happen, but guards against runaway substitution loops)
    if (compressedPrompt.length >= originalPrompt.length + 50) {
      process.exit(0); // pass through original unchanged
    }

    // ── Persist savings ──────────────────────────────────────────────────────
    // Update cumulative savings counter (for status line)
    try {
      const statsFile = home + '/.claude/.tokenshrink-saved';
      const prev = parseInt(fs.readFileSync(statsFile, 'utf8').trim() || '0', 10) || 0;
      fs.writeFileSync(statsFile, String(prev + totalSaved));
    } catch { /* non-fatal */ }

    // Append per-event log entry (for daily mirror report)
    try {
      const logFile = home + '/.claude/.tokenshrink-log.jsonl';
      const now = new Date();
      const localISO = new Date(now - now.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
      const entry = JSON.stringify({
        ts: localISO,
        tokensSaved: totalSaved,
        vocabSaved,
        phraseSaved,
        originalLen: originalPrompt.length,
        compressedLen: compressedPrompt.length,
        strategy: phraseSaved > 0 ? 'vocab+phrase' : 'vocab',
      });
      fs.appendFileSync(logFile, entry + '\n');
    } catch { /* non-fatal */ }

    // Output the fully compressed prompt (vocab + phrase applied)
    process.stdout.write(JSON.stringify({ prompt: compressedPrompt }));

    process.exit(0);
  } catch {
    process.exit(0);
  }
})();
