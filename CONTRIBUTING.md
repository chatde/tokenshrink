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

The compression engine lives in `app/lib/compression/`. The main files:

- `dictionaries.js` — word and phrase abbreviation mappings
- `engine.js` — the 4-phase compression pipeline
- `rosetta.js` — generates the decoder header for LLMs
- `strategies.js` — auto-detects content domain

When adding new abbreviations, make sure:
- The abbreviation is unambiguous in context
- If it's universally understood by LLMs, add it to `UNIVERSAL_ABBREVIATIONS`
- If not universal, the Rosetta Stone header will include a decoder entry automatically

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Test your changes locally before submitting
- Describe what changed and why in the PR description

## Code style

- Plain JavaScript (no TypeScript)
- Next.js App Router conventions
- Tailwind 4 for styling
