import Navbar from '../components/Navbar';

export const metadata = {
  title: 'API Documentation — TokenShrink',
  description: 'TokenShrink API and SDK documentation. Compress your AI prompts programmatically.',
};

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[88px] px-6">
        <div className="max-w-3xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-text mb-2">API Documentation</h1>
          <p className="text-text-secondary mb-10">
            Compress prompts programmatically via our REST API, npm SDK, or one-line CLI install.
          </p>

          {/* ── Claude Code Integration ─────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Claude Code Integration</h2>
            <div className="space-y-4">
              <div className="bg-bg-card border border-savings/20 rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">One-line install</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Automatically installs TokenShrink hooks into your Claude Code project. Compresses every prompt
                  before it hits the model — zero config.
                </p>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`curl -fsSL https://tokenshrink.com/install-claude-code.sh | bash`}
                </pre>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">What gets installed</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-savings mt-0.5">▸</span>
                    <span><code className="text-xs bg-bg px-1.5 py-0.5 rounded">~/.claude/hooks/tokenshrink-compress.js</code> — Phrase compression on every user prompt (UserPromptSubmit hook)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-savings mt-0.5">▸</span>
                    <span><code className="text-xs bg-bg px-1.5 py-0.5 rounded">~/.claude/hooks/tokenshrink-agent-compress.js</code> — Agent prompt compression (PreToolUse hook)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-savings mt-0.5">▸</span>
                    <span><code className="text-xs bg-bg px-1.5 py-0.5 rounded">~/.claude/hooks/tokenshrink-session-init.js</code> — Session vocabulary generator (SessionStart hook)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-savings mt-0.5">▸</span>
                    <span><code className="text-xs bg-bg px-1.5 py-0.5 rounded">~/.claude/session-vocab.json</code> — Project-specific abbreviation dictionary</span>
                  </li>
                </ul>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">How it works with Claude Code</h3>
                <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
                  <li>On session start, TokenShrink scans your project and builds a session vocabulary</li>
                  <li>Every prompt you send is compressed — filler words removed, project terms abbreviated</li>
                  <li>A tiny Rosetta Stone header teaches Claude the abbreviations</li>
                  <li>Claude uses the same abbreviations in responses — bidirectional savings</li>
                  <li>Savings accumulate across the entire session</li>
                </ol>
              </div>
            </div>
          </section>

          {/* ── Cursor Integration ──────────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Cursor Integration</h2>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-text-secondary mb-3">
                Use TokenShrink as a preprocessor for Cursor&apos;s AI features. Add to your project:
              </p>
              <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`# Install the SDK
npm install tokenshrink

# Use in your Cursor rules or project config
import { compress } from 'tokenshrink';

// Compress before sending to Cursor's AI
const { compressed, stats } = compress(yourPrompt);`}
              </pre>
            </div>
          </section>

          {/* ── Quick start ─────────────────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Quick start</h2>
            <div className="space-y-4">
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">1. Get your API key</h3>
                <p className="text-sm text-text-secondary">
                  Sign up (free), then generate an API key from your{' '}
                  <a href="/dashboard" className="text-savings hover:underline">dashboard</a>.
                </p>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">2. Compress via API</h3>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://tokenshrink.com/api/compress \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ts_live_your_key_here" \\
  -d '{
    "text": "Your long prompt text here...",
    "domain": "auto"
  }'`}
                </pre>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">3. Or use the SDK (v2.0)</h3>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`npm install tokenshrink`}
                </pre>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto mt-3">
{`import { compress } from 'tokenshrink';

// Compress a prompt — runs locally, no API call needed
const result = compress('Your long prompt...');
console.log(result.compressed);
console.log(result.stats.tokensSaved);       // Real token savings
console.log(result.stats.originalTokens);     // Original token count
console.log(result.stats.totalCompressedTokens); // Compressed token count

// Optional: plug in a real tokenizer for exact counts
import { encode } from 'gpt-tokenizer';
const result2 = compress('Your long prompt...', {
  tokenizer: (text) => encode(text).length
});

// Use with any LLM provider
import OpenAI from 'openai';
const openai = new OpenAI();
const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: result.compressed }],
});`}
                </pre>
              </div>
            </div>
          </section>

          {/* ── Compression strategies ──────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Compression strategies</h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Phrase compression',
                  savings: '5-15%',
                  desc: 'Removes filler words and replaces verbose phrases with concise alternatives. Runs automatically on every prompt — no configuration needed.',
                  example: '"I would like you to please make sure to check the file" → "check the file"',
                },
                {
                  name: 'Domain compression',
                  savings: '10-25%',
                  desc: 'Auto-detects your tech stack from package.json and applies domain-specific abbreviations. Supports React, Node.js, Python, Supabase, SQL, TypeScript, Docker, Tailwind.',
                  example: '"useCallback" → "UCB", "getServerSideProps" → "SSP"',
                },
                {
                  name: 'Session vocabulary',
                  savings: '15-35%',
                  desc: 'Advanced feature. At session start, builds a project-specific codebook. Both you and the AI use the same abbreviations. Cost is paid once, amortized across every message.',
                  example: '"/Volumes/AI-Models/" → "SSD/" on every prompt, forever',
                },
              ].map(({ name, savings, desc, example }) => (
                <div key={name} className="bg-bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text">{name}</h3>
                    <span className="text-xs font-mono text-savings bg-savings/10 px-2 py-0.5 rounded">{savings} savings</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{desc}</p>
                  <p className="text-xs text-text-muted font-mono">{example}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── API Reference ───────────────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">API Reference</h2>

            <div className="space-y-6">
              {/* POST /api/compress */}
              <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-savings bg-savings/10 px-2 py-0.5 rounded">POST</span>
                  <span className="text-sm font-mono text-text">/api/compress</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-text-muted mb-2">Headers</h4>
                    <div className="text-xs font-mono text-text-secondary space-y-1">
                      <div><span className="text-text">Content-Type:</span> application/json</div>
                      <div><span className="text-text">x-api-key:</span> ts_live_... <span className="text-text-muted">(optional for anonymous, required for API usage)</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-text-muted mb-2">Request body</h4>
                    <pre className="text-xs font-mono text-text-secondary bg-bg p-3 rounded-lg">
{`{
  "text": "string (required) — the text to compress",
  "domain": "string (optional) — auto|code|medical|legal|business"
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-text-muted mb-2">Response</h4>
                    <pre className="text-xs font-mono text-text-secondary bg-bg p-3 rounded-lg">
{`{
  "compressed": "string — full compressed text with Rosetta header",
  "rosetta": "string — just the decoder header",
  "stats": {
    "originalWords": 150,
    "compressedWords": 42,
    "rosettaWords": 18,
    "totalCompressedWords": 60,
    "originalTokens": 168,
    "compressedTokens": 45,
    "rosettaTokens": 22,
    "totalCompressedTokens": 67,
    "ratio": 2.5,
    "tokensSaved": 101,
    "dollarsSaved": 0.05,
    "strategy": "domain",
    "domain": "code",
    "tokenizerUsed": "built-in"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* GET /api/usage */}
              <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">GET</span>
                  <span className="text-sm font-mono text-text">/api/usage</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-text-secondary">
                    Returns your current usage stats, monthly history, and recent compressions.
                    Requires authentication (session or API key).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Rate limits ─────────────────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Rate limits</h2>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Requests per minute</span>
                  <span className="text-text font-medium">10</span>
                </div>
                <div className="flex justify-between">
                  <span>Words per request</span>
                  <span className="text-text font-medium">100,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly limit</span>
                  <span className="text-text font-medium">500 calls/month on Free, unlimited on Advanced</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-savings font-medium">Free</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Tokenizer ───────────────────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Token counting</h2>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-text-secondary mb-4">
                v2.0 uses real token counts instead of word estimates. By default, TokenShrink uses a
                precomputed lookup table based on <code className="text-text bg-bg px-1.5 py-0.5 rounded text-xs">cl100k_base</code> (GPT-4).
                For exact counts with your specific model, pass a custom tokenizer:
              </p>
              <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`import { compress } from 'tokenshrink';
import { encode } from 'gpt-tokenizer';

const result = compress(text, {
  tokenizer: (text) => encode(text).length
});`}
              </pre>
            </div>
          </section>

          {/* ── Domains ─────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Compression domains</h2>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-text-secondary mb-4">
                Set <code className="text-text bg-bg px-1.5 py-0.5 rounded text-xs">domain</code> to
                optimize compression for specific content types. Default is <code className="text-text bg-bg px-1.5 py-0.5 rounded text-xs">auto</code>.
              </p>
              <div className="space-y-2 text-sm">
                {[
                  { domain: 'auto', desc: 'Automatically detects the best strategy' },
                  { domain: 'code', desc: 'Programming and technical documentation' },
                  { domain: 'medical', desc: 'Medical records, clinical notes' },
                  { domain: 'legal', desc: 'Contracts, legal documents' },
                  { domain: 'business', desc: 'Business communications, reports' },
                ].map(({ domain, desc }) => (
                  <div key={domain} className="flex items-start gap-3">
                    <code className="text-xs font-mono text-savings bg-savings/10 px-2 py-0.5 rounded shrink-0">
                      {domain}
                    </code>
                    <span className="text-text-secondary">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
