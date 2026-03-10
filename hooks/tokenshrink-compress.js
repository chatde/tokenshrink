#!/usr/bin/env node
// TokenShrink Claude Code Hook
// Compresses outgoing prompts to save tokens
// Install: copy to ~/.claude/hooks/tokenshrink-compress.js
// Requires: npm install -g tokenshrink

'use strict';

(async () => {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) process.exit(0);

    let input;
    try { input = JSON.parse(raw); } catch { process.exit(0); }

    const prompt = input.prompt;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) process.exit(0);

    // Detect missing package without throwing into the outer catch
    try { require.resolve('tokenshrink'); } catch { process.exit(0); }

    // tokenshrink is ESM-only ("type": "module") — must use dynamic import
    let compressFn;
    try {
      const mod = await import('tokenshrink');
      compressFn = mod.compress ?? mod.default?.compress;
    } catch { process.exit(0); }

    if (typeof compressFn !== 'function') process.exit(0);

    let result;
    try { result = compressFn(prompt); } catch { process.exit(0); }

    const saved = result?.stats?.tokensSaved ?? 0;
    if (saved <= 0) process.exit(0);

    // Output { prompt } to replace the original with the compressed version
    process.stdout.write(JSON.stringify({ prompt: result.compressed }));

    process.exit(0);
  } catch {
    process.exit(0);
  }
})();
