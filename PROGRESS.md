# TokenShrink Build Progress

## Status: v2.0.0 LIVE
**Last updated:** 2026-02-21

## Core Product: ~90% Complete

### v1.0 Build: COMPLETE
- [x] Next.js 16 + Tailwind CSS 4 project (38 files, 14 routes, clean build)
- [x] Compression engine (4 strategies, 5 domain dictionaries, Rosetta Stone)
- [x] Landing page with live CompressorWidget demo
- [x] Pricing, Login, Dashboard, Docs pages
- [x] API routes: compress, decompress, keys, usage, billing (checkout/portal/webhook)
- [x] Drizzle ORM schema pushed to Neon (5 tables live)
- [x] GitHub repo: github.com/chatde/tokenshrink (public, main branch)
- [x] CI pipeline: GitHub Actions (runs tests on push/PR)

### v2.0 Token-Aware Compression: COMPLETE (2026-02-21)
- [x] Precomputed TOKEN_COSTS lookup (588 entries, cl100k_base / GPT-4)
- [x] ZERO_SAVINGS set (134 entries) — skip replacements that save 0 tokens
- [x] NEGATIVE_SAVINGS set (45 entries) — block replacements that cost MORE tokens
- [x] Removed 130+ zero-savings and 45 negative-savings entries from dictionaries
- [x] `countTokens(text, tokenizer?)` — 3-tier: custom → lookup → ceil(charLen/4)
- [x] `replacementTokenSavings(original, replacement, tokenizer?)` — token delta check
- [x] Pluggable tokenizer: `compress(text, { tokenizer: t => encode(t).length })`
- [x] New stats: originalTokens, compressedTokens, rosettaTokens, totalCompressedTokens, tokenizerUsed
- [x] Token-aware Rosetta Stone net-positive filter
- [x] All 51 tests passing (5 test files, vitest)
- [x] Benchmarked: 12.6% real savings on verbose prompts, zero false positives
- [x] npm SDK published: `tokenshrink@2.0.0`
- [x] Website updated with token counts in UI
- [x] Docs page updated with tokenizer option + new API fields
- [x] README + SDK README updated with real benchmarks
- [x] Committed + pushed to main → Vercel auto-deployed

### Deployment: COMPLETE
- [x] Vercel connected (auto-deploys from main)
- [x] tokenshrink.com live (200 OK)
- [x] npm published as `tokenshrink@2.0.0` (account: wattsonme)

### Promotion: STARTED (2026-02-21)
- [x] Posted to r/node — got engagement (questions about output quality, token minimizer tradeoffs)
- [x] Posted to Hacker News
- [x] Posted to OpenClaw community (combined with API Guardrails)
- [ ] Reply to original r/LocalLLaMA critics with real benchmark data
- [ ] Post to r/LocalLLaMA with v2.0 announcement

## Env Vars (.env.local)
- [x] DATABASE_URL — Neon PostgreSQL (schema pushed, tables live)
- [x] NEXTAUTH_SECRET — generated
- [x] GITHUB_CLIENT_ID + SECRET — OAuth app created
- [x] GOOGLE_CLIENT_ID + SECRET — OAuth app created
- [x] STRIPE_SECRET_KEY — test key set
- [x] STRIPE_PRO_PRICE_ID — price_1T2hL0CuvMbO5QrvUJPEMHqC ($19/mo)
- [x] STRIPE_TEAM_PRICE_ID — price_1T2hNGCuvMbO5QrvNHe0Pf29 ($79/mo)
- [ ] STRIPE_PUBLISHABLE_KEY — need pk_test_ from Stripe dashboard
- [ ] STRIPE_WEBHOOK_SECRET — set after Vercel deploy

## Roadmap (Not Yet Started)
- [ ] Browser extension for ChatGPT/Claude web UI
- [ ] VS Code extension
- [ ] Self-hosted Docker image
- [ ] Multilingual prompt support
- [ ] Scientific/academic compression domains
- [ ] Compression analytics dashboard
- [ ] SDK/app code deduplication (currently duplicated in sdk/src/ and app/lib/)
- [ ] Automated npm publish in CI
- [ ] Python SDK

## Key Paths
- Project: /Volumes/AI-Models/tokenshrink (symlink ~/tokenshrink)
- Env: /Volumes/AI-Models/tokenshrink/.env.local (gitignored)
- Schema: /Volumes/AI-Models/tokenshrink/schema/schema.js
- SDK Engine: /Volumes/AI-Models/tokenshrink/sdk/src/engine.js
- App Engine: /Volumes/AI-Models/tokenshrink/app/lib/compression/engine.js
- Token Costs: /Volumes/AI-Models/tokenshrink/sdk/src/token-costs.js (auto-generated)
- Generator: /Volumes/AI-Models/tokenshrink/scripts/generate-token-costs.mjs
- Benchmarks: /Volumes/AI-Models/tokenshrink/scripts/benchmark.mjs
- Tests: /Volumes/AI-Models/tokenshrink/tests/ (51 tests, 5 files)

## Known Issues / Notes
- SDK and app have DUPLICATED compression code (sdk/src/ vs app/lib/compression/)
- generate-token-costs.mjs has HISTORICAL_ENTRIES to preserve safety nets after dictionary cleanup
- npm 2FA requires web auth (no OTP codes) — must publish manually via browser
- gpt-tokenizer is devDependency only (not shipped in SDK)
