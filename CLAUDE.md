# CLAUDE.md — TokenShrink

## What This Is

Prompt compression SaaS — reduces LLM token usage without losing meaning. Ships as both a Next.js 16 web app (tokenshrink.com) and a standalone zero-dependency npm SDK (`tokenshrink@2.0.0`).

## Tech Stack

- **Framework**: Next.js 16 App Router, React 19, JavaScript (jsconfig.json, no TypeScript)
- **Testing**: Vitest 4, 51 tests across 10 files in `tests/`
- **Styling**: Tailwind 4
- **Database**: Drizzle ORM + Neon PostgreSQL (serverless)
- **Auth**: next-auth v5 beta
- **Payments**: Stripe
- **SDK**: `/sdk/src/` — standalone zero-dependency ES modules npm package
- **Hosting**: Vercel at tokenshrink.com
- **GitHub**: chatde/tokenshrink (SSH protocol)
- **Node**: /opt/homebrew/bin/node

## Key Paths

```
app/                    # Next.js App Router (pages, components, API routes)
app/api/compress/       # Main compression API endpoint
app/api/billing/        # Stripe billing API
sdk/src/                # npm SDK source (index.js, providers.js, rules.js)
tests/                  # 10 Vitest test files (51 tests)
schema/                 # Drizzle ORM database schema
scripts/                # Utility scripts
examples/               # 5 example directories
vitest.config.js        # Test config (includes @ path alias)
drizzle.config.js       # Database config (Neon PostgreSQL)
```

## Development Workflow

```bash
npm run dev              # Next.js dev server
npm run build            # Production build (catches all errors)
npm run lint             # ESLint
npm test                 # Run 51 Vitest tests
npm run test:watch       # Watch mode
npm run db:push          # Push Drizzle schema to Neon
npm run db:studio        # Open Drizzle Studio

# Deploy
git push origin main     # Triggers Vercel auto-deploy
```

## Project-Specific Rules

- **No console.log in production code.**
- **SDK is standalone**: Zero dependencies, ES modules — never add npm deps to `sdk/src/`.
- **Path alias**: `@/*` maps to project root — use it consistently.
- **Neon PostgreSQL**: Serverless driver — needs `NEON_DATABASE_URL` env var.
- **next-auth v5 beta**: API differs from stable docs — check actual imports in the codebase before assuming method names.
- **Stripe keys**: Need `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in .env.
- **CORS headers**: Set in `next.config.js`, not middleware.
- **No TypeScript in this repo**: JavaScript + jsconfig.json. Do not add TypeScript.
- **Git**: SSH protocol (chatde on GitHub). Deploy by pushing to main — Vercel auto-deploys.
