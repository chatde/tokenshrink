#!/usr/bin/env node
// TokenShrink — Claude Code UserPromptSubmit hook
// Compresses your prompts before they reach Claude, saving tokens automatically.
// Install: curl -fsSL https://tokenshrink.com/install-claude-code.sh | bash

'use strict';

const https = require('https');
const fs = require('fs');
const os = require('os');

const API_URL = 'https://tokenshrink.com/api/compress';
const SAVED_FILE = os.homedir() + '/.claude/.tokenshrink-saved';
const LOG_FILE = os.homedir() + '/.claude/.tokenshrink-log.jsonl';

function post(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text });
    const url = new URL(API_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 4000,
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

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

    let data;
    try { data = await post(prompt); } catch { process.exit(0); }

    if (!data || !data.compressed || !data.stats) process.exit(0);

    const saved = data.stats.tokensSaved ?? 0;
    if (saved <= 0) process.exit(0);

    // Update cumulative counter
    try {
      const prev = parseInt(fs.readFileSync(SAVED_FILE, 'utf8').trim() || '0', 10) || 0;
      fs.writeFileSync(SAVED_FILE, String(prev + saved));
    } catch { /* non-fatal */ }

    // Append per-event log
    try {
      const now = new Date();
      const localISO = new Date(now - now.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
      const entry = JSON.stringify({
        ts: localISO,
        tokensSaved: saved,
        originalTokens: data.stats.originalTokens ?? 0,
        compressedTokens: data.stats.compressedTokens ?? 0,
        ratio: data.stats.ratio ?? 1,
        strategy: data.stats.strategy ?? 'unknown',
        domain: data.stats.domain ?? null,
        confidence: data.stats.confidence ?? 0,
      });
      fs.appendFileSync(LOG_FILE, entry + '\n');
    } catch { /* non-fatal */ }

    process.stdout.write(JSON.stringify({ prompt: data.compressed }));
    process.exit(0);
  } catch {
    process.exit(0);
  }
})();
