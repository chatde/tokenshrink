# Contributing to TokenShrink

Thanks for your interest in contributing!

## Getting started

1. Fork the repo
2. Clone your fork
3. Copy `.env.example` to `.env.local` and fill in the values
4. Install dependencies: `npm install`
5. Push the database schema: `npm run db:push`
6. Start the dev server: `npm run dev`

## What to work on

- Check [open issues](https://github.com/chatde/tokenshrink/issues) for things to work on
- Compression improvements: better abbreviation dictionaries, new domain support
- Bug fixes and test coverage

## Compression dictionaries

The compression engine lives in both `sdk/src/` (npm package) and `app/lib/compression/` (website). Keep them in sync.

Key files:
- `dictionaries.js` — word and phrase abbreviation mappings
- `engine.js` — the 4-phase compression pipeline (token-aware in v2.0)
- `rosetta.js` — generates the decoder header for LLMs
- `strategies.js` — auto-detects content domain
- `token-costs.js` — precomputed token costs (auto-generated, DO NOT EDIT)
- `utils.js` / `billing.js` — `countTokens()`, `replacementTokenSavings()`

When adding new abbreviations, make sure:
- The replacement **actually saves tokens** — run `node scripts/generate-token-costs.mjs` to verify
- The abbreviation is unambiguous in context
- If it's universally understood by LLMs, add it to `UNIVERSAL_ABBREVIATIONS`
- If not universal, the Rosetta Stone header will include a decoder entry automatically
- After changing dictionaries, regenerate token-costs.js: `node scripts/generate-token-costs.mjs`

## Testing

```bash
npm test          # run all 51 tests
npm run test:watch  # watch mode
```

Tests cover: compression engine, Rosetta Stone, domain detection, billing/token counting, and token cost verification.

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Test your changes locally before submitting
- Describe what changed and why in the PR description

## Code style

- Plain JavaScript (no TypeScript)
- Next.js App Router conventions
- Tailwind 4 for styling
