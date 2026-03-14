#!/usr/bin/env node
// TokenShrink PreToolUse hook — compresses Agent tool prompts
// Fires before each Agent/Task spawn, compressing the prompt Claude writes to sub-agents.
// These prompts are typically 200-500 words — biggest token savings in the ecosystem.

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

    const prompt = input.tool_input?.prompt;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) process.exit(0);

    // Load TokenShrink SDK
    const SDK_PATH = '/Volumes/AI-Models/tokenshrink/sdk/src/index.js';
    let compressFn;
    try {
      const { pathToFileURL } = require('url');
      const mod = await import(pathToFileURL(SDK_PATH).href);
      compressFn = mod.compress ?? mod.default?.compress;
    } catch { process.exit(0); }

    if (typeof compressFn !== 'function') process.exit(0);

    let result;
    try { result = compressFn(prompt, { source: 'claude-code-agent', analytics: false }); } catch { process.exit(0); }

    const saved = result?.stats?.tokensSaved ?? 0;
    if (saved <= 0) process.exit(0);

    const fs = require('fs');
    const home = require('os').homedir();

    // Update cumulative counter
    try {
      const statsFile = home + '/.claude/.tokenshrink-saved';
      const prev = parseInt(fs.readFileSync(statsFile, 'utf8').trim() || '0', 10) || 0;
      fs.writeFileSync(statsFile, String(prev + saved));
    } catch { /* non-fatal */ }

    // Append to JSONL log
    try {
      const logFile = home + '/.claude/.tokenshrink-log.jsonl';
      const now = new Date();
      const localISO = new Date(now - now.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
      const entry = JSON.stringify({
        ts: localISO,
        source: 'agent-prompt',
        tokensSaved: saved,
        originalTokens: result.stats.originalTokens ?? 0,
        compressedTokens: result.stats.compressedTokens ?? 0,
        ratio: result.stats.ratio ?? 1,
        strategy: result.stats.strategy ?? 'unknown',
        domain: result.stats.domain ?? null,
        confidence: result.stats.confidence ?? 0,
      });
      fs.appendFileSync(logFile, entry + '\n');
    } catch { /* non-fatal */ }

    // Return modified tool_input — Claude Code merges this with the existing input
    process.stdout.write(JSON.stringify({
      tool_input: { prompt: result.compressed }
    }));

    process.exit(0);
  } catch {
    process.exit(0);
  }
})();
