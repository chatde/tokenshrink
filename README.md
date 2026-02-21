# TokenShrink

[![CI](https://github.com/chatde/tokenshrink/actions/workflows/ci.yml/badge.svg)](https://github.com/chatde/tokenshrink/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Free](https://img.shields.io/badge/Price-Free%20Forever-brightgreen)](https://tokenshrink.com)

**Same AI, fewer tokens. Free forever.**

[tokenshrink.com](https://tokenshrink.com) | [Docs](https://tokenshrink.com/docs) | [API](https://tokenshrink.com/docs)

---

TokenShrink compresses your AI prompts so they use fewer tokens — same results, lower cost. Works with every LLM: OpenAI, Anthropic, Google, Mistral, Cohere, and more.

No LLM calls. No latency. Pure text compression that any model can understand.

## v2.0 — Token-Aware Compression

v2.0 addresses a fundamental flaw in v1: BPE tokenizers don't map 1:1 with words. "database" (1 token) → "db" (1 token) saves **zero** tokens. "should" (1 token) → "shd" (2 tokens) actually makes it **worse**.

v2.0 fixes this:
- Every replacement verified against cl100k_base (GPT-4) tokenizer
- 130+ zero-savings entries removed, 45 negative-savings entries removed
- Real token counting replaces the `words * 1.3` heuristic
- Pluggable tokenizer support for exact counts with any model

## Before / After

**Before** (143 tokens):
> You are a business analyst assistant. Your primary responsibility is to help stakeholders define clear requirements. It is important to understand the business context before proposing solutions. Due to the fact that requirements change frequently, you should maintain version control...

**After** (121 tokens, 22 saved — 15.4%):
> You are a business analyst assistant. help stakeholders define clear requirements. understand the business context before proposing solutions. because requirements change frequently, maintain version control...

On verbose prompts (200+ words), savings reach 12-15% — all verified with real tokenizer counts.

## Benchmarks (verified with gpt-tokenizer)

| Prompt | Original | Compressed | Saved | % |
|--------|----------|------------|-------|---|
| Dev assistant (verbose) | 408 | 349 | 59 | 14.5% |
| Code review prompt | 210 | 183 | 27 | 12.9% |
| Medical notes | 151 | 134 | 17 | 11.3% |
| Business requirements | 143 | 121 | 22 | 15.4% |
| Minimal filler (hard to compress) | 77 | 77 | 0 | 0.0% |
| **Total** | **989** | **864** | **125** | **12.6%** |

All counts verified with `gpt-tokenizer` (cl100k_base). No prompt had its token count increase. Zero false savings.

## How it works

1. **Phase 1 — Phrase removal**: Verbose filler phrases are compressed or removed ("in order to" → "to", "it is important to" → removed)
2. **Phase 2 — Word abbreviation**: Only multi-token words that genuinely save tokens ("consequently" → "so" saves 2 tokens)
3. **Phase 3 — Pattern detection**: Repeated structures are collapsed into shorthand codes
4. **Phase 4 — Rosetta Stone**: A tiny decoder header is prepended so the LLM understands all abbreviations

## Quick start

### Web

Go to [tokenshrink.com](https://tokenshrink.com) and paste your prompt. No sign-up needed.

### API

```bash
curl -X POST https://tokenshrink.com/api/compress \
  -H "Content-Type: application/json" \
  -d '{"text": "Your long prompt here..."}'
```

Response:
```json
{
  "compressed": "compressed text...",
  "stats": {
    "originalTokens": 150,
    "totalCompressedTokens": 128,
    "tokensSaved": 22,
    "ratio": 1.2,
    "strategy": "auto",
    "tokenizerUsed": "built-in"
  }
}
```

### SDK

```bash
npm install tokenshrink
```

```javascript
import { compress } from 'tokenshrink';

const { compressed, stats } = compress(longSystemPrompt);
console.log(`Saved ${stats.tokensSaved} tokens (${stats.originalTokens} → ${stats.totalCompressedTokens})`);

// Optional: plug in a real tokenizer for exact counts
import { encode } from 'gpt-tokenizer';
const result = compress(text, { tokenizer: (t) => encode(t).length });
```

See the [SDK README](sdk/README.md) for full API docs and examples.

## Compression domains

| Domain | Use case |
|--------|----------|
| `auto` | Automatically detects the best strategy (default) |
| `code` | Programming and technical documentation |
| `medical` | Medical records, clinical notes |
| `legal` | Contracts, legal documents |
| `business` | Business communications, reports |

## Running locally

```bash
git clone https://github.com/chatde/tokenshrink.git
cd tokenshrink
cp .env.example .env.local   # fill in your values
npm install
npm run db:push              # set up database schema
npm run dev                  # http://localhost:3000
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development details.

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: NextAuth.js (GitHub + Google OAuth)
- **Deployment**: Vercel
- **Compression**: Client-side engine — no LLM calls, no external APIs

## Testing

```bash
npm test          # run all 51 tests
npm run test:watch  # watch mode
```

Tests cover the compression engine, Rosetta Stone generator, domain detection, billing utilities, and token cost verification.

## Security & privacy

- **No prompt storage**: Your text is processed in memory and immediately discarded. We never log or store prompt content.
- **No LLM calls**: Compression is pure text processing — your data never leaves the server.
- **No tracking**: No analytics, no cookies, no fingerprinting beyond basic server logs.
- **Open source**: Review the code yourself. If you find a vulnerability, [open an issue](https://github.com/chatde/tokenshrink/issues).

## Roadmap

- [x] Publish npm SDK (`npm install tokenshrink`)
- [x] Token-aware compression (v2.0)
- [x] Pluggable tokenizer support
- [ ] Add more compression domains (scientific, academic)
- [ ] Multilingual prompt support
- [ ] Browser extension for ChatGPT/Claude web UI
- [ ] VS Code extension
- [ ] Self-hosted Docker image
- [ ] Compression analytics dashboard

## Pricing

Free. No limits, no credit card, no catch.

## Built by

Made by [Wattson](https://github.com/chatde). Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
