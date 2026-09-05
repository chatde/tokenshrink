# Security and release review — 2026-09-05

This is a focused application review, not a security certification or a claim that the service has no vulnerabilities.

Implemented protections:

- Streaming JSON byte limits reject oversized input before accumulating the full body. Invalid JSON and non-object bodies return client errors.
- Legacy decoder uses single-pass literal replacements, dictionary limits and output limits. It no longer recursively expands attacker-controlled replacements or interprets replacement-dollar syntax.
- Account key creation/revocation, checkout and billing portal require same-origin browser requests. Owner feedback mutations retain the same restriction. Public API-key compression remains available cross-origin.
- Account linking requires verified Google email or a matching verified GitHub email. GitHub verification failures deny new sign-in. Existing signed sessions still use the configured account lookup.
- Owner data requires an authenticated session and the owner email allowlist. Prompt/key responses have private no-store caching. Only statistics are stored in the compression table; these changes do not add raw prompt storage.
- Usage increments now use atomic database upserts to avoid lost counts during simultaneous requests. Compression logs and monthly meter updates are still separate operations; a database failure between them can leave a discrepancy.
- Patched production dependencies: npm production audit returned zero known findings after updating Next.js, Auth.js, Sentry, PostCSS and related dependencies. An audit is time-specific and cannot find all implementation flaws.

Limits and follow-up:

- Historical compression counters cover stored signed-in/API-key requests. Positive estimated tokens_saved means compression occurred by the compressor's estimate, not proven semantic equivalence or a provider bill reduction. Anonymous telemetry is self-reported, not verified usage.
- Distributed rate limiting falls back to process memory if backing services fail; this weakens global limits during an outage. Hosting-level abuse controls and operational alerts remain useful follow-up work.
- The full audit retains four moderate development-tool findings in the Drizzle Kit → esbuild dependency chain (one underlying development-server advisory). They are outside the production audit. Do not expose a development database console/server publicly; upgrading this tool chain needs separate compatibility validation.
- New sign-in verification has unit coverage; automated signed-session smoke tests do not replace an interactive Google/GitHub OAuth test or a real paid checkout.
- Heuristic compression is not guaranteed lossless. The private Aster-1 experiment has deterministic decoder tests, but no broad cross-model quality guarantee. Keep it separate from the hosted default.
- No subscription upgrade, payment charge or provider fallback is part of this release. Provider access does not establish which consumer subscription covers API usage.

Validation evidence is recorded in the project handoff, including test counts, deployment identity, live routes, and limitations. Re-run dependency audits and targeted checks when changing dependencies or authentication behavior.
