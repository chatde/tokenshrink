# TokenShrink Build Progress

## Status: Phase 1 MVP — ENV SETUP IN PROGRESS
**Last updated:** 2026-02-20

## Build: COMPLETE
- [x] Next.js 15 + Tailwind CSS project (38 files, 14 routes, clean build)
- [x] Compression engine (4 strategies, 5 domain dictionaries, Rosetta Stone)
- [x] Landing page with live CompressorWidget demo
- [x] Pricing, Login, Dashboard, Docs pages
- [x] API routes: compress, decompress, keys, usage, billing (checkout/portal/webhook)
- [x] Drizzle ORM schema pushed to Neon (5 tables live)
- [x] GitHub repo: github.com/chatde/tokenshrink (public, main branch)
- [x] npm SDK published: tokenshrink@1.0.0 (zero deps, 28.7 KB, pure JS)

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

## Next Steps (to resume in new session)
1. Get Stripe publishable key (pk_test_) → add to .env.local
2. Connect repo to Vercel (vercel.com → Import → chatde/tokenshrink)
3. Set ALL env vars in Vercel dashboard
4. Deploy → get live URL
5. Set up Stripe webhook pointing to https://tokenshrink.com/api/billing/webhook
6. Copy webhook secret → add to Vercel env vars → redeploy
7. Test end-to-end: visit site → compress → sign in → subscribe

## Key Paths
- Project: /Volumes/AI-Models/tokenshrink (symlink ~/tokenshrink)
- Env: /Volumes/AI-Models/tokenshrink/.env.local (gitignored)
- Schema: /Volumes/AI-Models/tokenshrink/schema/schema.js
- Engine: /Volumes/AI-Models/tokenshrink/app/lib/compression/engine.js
