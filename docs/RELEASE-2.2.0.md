# TokenShrink 2.2.0 readiness release

The SDK now rejects candidates without more than 5% token savings, counts the
entire returned payload, and leaves detected code and quoted literals unchanged.
History compression honors custom tokenizers and telemetry opt-out. Browser
bundles use an entry point without filesystem helpers.

The website replaces invented savings with labelled npm downloads, corrects
paid-plan claims, adds private operations reporting and public feedback, and
improves billing synchronization and telemetry validation. Advanced remains $5
monthly or $36 yearly; no new prices or hosting purchases are made.

Apply `schema/migrations/20260904_readiness.sql` before deploying. Configure
`ADMIN_EMAILS` for the owner and `STRIPE_ADVANCED_ANNUAL_PRICE_ID` for yearly
billing. Legacy annual variable naming is accepted as a fallback.

Validation: 404 unit/regression tests, a production build, installed-package
smoke tests, and local authenticated board/feedback checks. The six-fixture,
two-tokenizer benchmark is diagnostic, not a guarantee of unchanged model
answers. No live card payment was made.

The operations board is `/dashboard/operations`; public feedback is `/feedback`.
`scripts/triage-feedback.mjs` uses a signed-in Claude CLI to draft summaries;
run without `--apply` to review output first. It never marks feedback resolved.
Self-reported telemetry is not unique users or verified provider bill savings.
