# TokenShrink

[![CI](https://github.com/chatde/tokenshrink/actions/workflows/ci.yml/badge.svg)](https://github.com/chatde/tokenshrink/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Free](https://img.shields.io/badge/Price-Free%20Forever-brightgreen)](https://tokenshrink.com)

**Same AI, fewer tokens. Free forever.**

[tokenshrink.com](https://tokenshrink.com) | [Docs](https://tokenshrink.com/docs) | [API](https://tokenshrink.com/docs)

---

TokenShrink compresses your AI prompts so they use fewer tokens — same results, lower cost. Works with every LLM: OpenAI, Anthropic, Google, Mistral, Cohere, and more.

No LLM calls. No latency. Pure text compression that any model can understand.

## Before / After

**Before** (38 words):
> You are an advanced AI assistant specialized in software engineering. Your primary responsibility is to help developers write clean, maintainable, and efficient code. When responding to questions about programming, you should provide detailed explanations along with code examples.

**After** (35 words, 4 tokens saved):
> [DECODE] hlp=help, prvd=provide, expln=explain [/DECODE] U are an advanced AI assistant specialized in software engineering. Ur primary responsibility is to hlp developers write clean, maintainable, & efficient code. When responding to questions abt programming, u shd prvd detailed explanations along w/ code examples.

On longer prompts (200+ words), savings compound — verbose phrases like "in order to", "it is important to", and "please make sure to" are removed entirely.

## Benchmarks

Tested across 100 diverse prompts (software, business, legal, medical, creative writing):

| Metric | Result |
|--------|--------|
| Average word savings | ~10% |
| Average character savings | ~11% |
| Meaning preservation | 100/100 passed |
| Processing time | < 200ms |
| Price | Free |

## How it works

1. **Phase 1 — Phrase removal**: Verbose filler phrases are compressed or removed ("in order to" → "to", "it is important to" → removed)
2. **Phase 2 — Word abbreviation**: Common words become short codes ("function" → "fn", "because" → "bc", "without" → "w/o")
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
  "compressed": "[DECODE] ... [/DECODE] compressed text...",
  "stats": {
    "originalWords": 150,
    "totalCompressedWords": 128,
    "tokensSaved": 29,
    "ratio": 1.17,
    "strategy": "auto"
  }
}
```

### SDK (coming soon)

The npm SDK is in development. For now, use the REST API directly:

```javascript
// Compress a prompt before sending to any LLM
async function shrink(text) {
  const res = await fetch('https://tokenshrink.com/api/compress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const { compressed } = await res.json();
  return compressed;
}

// Use with OpenAI
import OpenAI from 'openai';
const openai = new OpenAI();

const prompt = await shrink(longSystemPrompt);
const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: prompt }],
});
```

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
npm test          # run all 29 tests
npm run test:watch  # watch mode
```

Tests cover the compression engine, Rosetta Stone generator, domain detection, and billing utilities.

## Security & privacy

- **No prompt storage**: Your text is processed in memory and immediately discarded. We never log or store prompt content.
- **No LLM calls**: Compression is pure text processing — your data never leaves the server.
- **No tracking**: No analytics, no cookies, no fingerprinting beyond basic server logs.
- **Open source**: Review the code yourself. If you find a vulnerability, [open an issue](https://github.com/chatde/tokenshrink/issues).

## Roadmap

- [ ] Publish npm SDK (`npm install tokenshrink`)
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
