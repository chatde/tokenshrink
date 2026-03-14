#!/usr/bin/env node
// TokenShrink PreToolUse hook — compresses Agent tool prompts + injects session vocab decoder
// Fires before each Agent/Task spawn. Injects a [SESSION VOCAB] header so the sub-agent
// can decode abbreviations like LP, SSD/, TS, OC that appear in the compressed prompt body.

'use strict';

(async () => {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) process.exit(0);

    let input;
    try { input = JSON.parse(raw); } catch { process.exit(0); }

    // Only act on Agent tool calls
    const toolName = input.tool_name || '';
    if (toolName !== 'Agent') process.exit(0);

    let prompt = input.tool_input?.prompt;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) process.exit(0);

    const fs = require('fs');
    const home = require('os').homedir();

    // ── Layer 1: Session vocabulary — substitute full terms → abbrs in prompt body ──
    // Also build the vocab header block the sub-agent will use to decode them.
    let vocabSaved = 0;
    let vocabHeader = '';
    const originalPrompt = prompt;

    // Skip vocab injection if the header is already present (idempotency guard)
    const alreadyHasVocab = prompt.includes('[SESSION VOCAB');

    if (!alreadyHasVocab) {
      try {
        const vocabFile = home + '/.claude/session-vocab.json';
        const { vocab } = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));

        // Apply substitutions to prompt body
        for (const { abbr, term } of vocab) {
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const before = prompt;
          prompt = prompt.replace(new RegExp(escaped, 'g'), abbr);
          if (prompt !== before) {
            // Rough token estimate: each char ≈ 0.25 tokens
            vocabSaved += Math.max(1, Math.round((term.length - abbr.length) * 0.25));
          }
        }

        // Build the decoder block
        const lines = ['[SESSION VOCAB — active for this sub-agent session]'];
        for (const { abbr, term } of vocab) lines.push(`${abbr}=${term}`);
        lines.push('[/SESSION VOCAB]');
        vocabHeader = lines.join('\n');
      } catch { /* session vocab is optional — non-fatal */ }
    }

    // ── Layer 2: Phrase compression via SDK ──────────────────────────────────────
    const SDK_PATH = '/Volumes/AI-Models/tokenshrink/sdk/src/index.js';
    let phraseSaved = 0;
    let compressedPrompt = prompt; // starts as vocab-substituted version
    let sdkStats = {};
    try {
      const { pathToFileURL } = require('url');
      const mod = await import(pathToFileURL(SDK_PATH).href);
      const compressFn = mod.compress ?? mod.default?.compress;
      if (typeof compressFn === 'function') {
        const result = compressFn(prompt, { source: 'claude-code-agent', analytics: false });
        phraseSaved = result?.stats?.tokensSaved ?? 0;
        if (phraseSaved > 0) {
          compressedPrompt = result.compressed;
          sdkStats = result.stats;
        }
      }
    } catch { /* phrase compression is optional — vocab savings still count */ }

    const totalSaved = vocabSaved + phraseSaved;

    // ── Fail-safe: if compressed body is longer than original, bail out ───────────
    if (compressedPrompt.length >= originalPrompt.length + 50 && !vocabHeader) {
      process.exit(0);
    }

    // ── Assemble final prompt: vocab header + compressed body ────────────────────
    // Note: the header is NOT compressed — it must be human-readable for the sub-agent.
    const finalPrompt = vocabHeader
      ? `${vocabHeader}\n\n${compressedPrompt}`
      : compressedPrompt;

    // Only write output if we actually changed something
    if (finalPrompt === originalPrompt) process.exit(0);

    // ── Persist savings (only if net positive) ───────────────────────────────────
    if (totalSaved > 0) {
      try {
        const statsFile = home + '/.claude/.tokenshrink-saved';
        const prev = parseInt(fs.readFileSync(statsFile, 'utf8').trim() || '0', 10) || 0;
        fs.writeFileSync(statsFile, String(prev + totalSaved));
      } catch { /* non-fatal */ }
    }

    // ── Append to JSONL log ───────────────────────────────────────────────────────
    try {
      const logFile = home + '/.claude/.tokenshrink-log.jsonl';
      const now = new Date();
      const localISO = new Date(now - now.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
      const entry = JSON.stringify({
        ts: localISO,
        source: 'agent-prompt',
        tokensSaved: totalSaved,
        vocabSaved,
        phraseSaved,
        vocabInjected: !!vocabHeader,
        originalLen: originalPrompt.length,
        compressedLen: finalPrompt.length,
        originalTokens: sdkStats.originalTokens ?? 0,
        compressedTokens: sdkStats.compressedTokens ?? 0,
        ratio: sdkStats.ratio ?? 1,
        strategy: phraseSaved > 0 ? 'vocab+phrase' : (vocabSaved > 0 ? 'vocab' : 'header-only'),
        domain: sdkStats.domain ?? null,
        confidence: sdkStats.confidence ?? 0,
      });
      fs.appendFileSync(logFile, entry + '\n');
    } catch { /* non-fatal */ }

    // ── Return modified tool_input — Claude Code merges this with existing input ──
    process.stdout.write(JSON.stringify({
      tool_input: { prompt: finalPrompt }
    }));

    process.exit(0);
  } catch {
    process.exit(0);
  }
})();
