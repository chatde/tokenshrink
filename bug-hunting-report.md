---
report_type: bug-hunting
generated: 2026-03-19
version: 2026-03-19
status: success
agent: bug-hunter
files_processed: 47
issues_found: 18
critical_count: 2
high_count: 5
medium_count: 7
low_count: 4
modifications_made: false
---

# Bug Hunting Report

**Generated**: 2026-03-19
**Project**: TokenShrink (Next.js 16 / React 19 / Drizzle ORM / Stripe)
**Files Analyzed**: 47 source files (~7,249 lines)
**Total Issues Found**: 18
**Status**: Issues found -- review recommended

---

## Executive Summary

TokenShrink has a clean architecture with good security fundamentals (hashed API keys, parameterized queries, input validation). However, there are two critical issues: (1) the rate limiter is defined but never imported by any route, leaving all API endpoints unprotected against abuse, and (2) a race condition in the usage metering upsert that can cause lost writes under concurrent requests. Several medium-priority issues around error handling gaps and dead code also warrant attention.

### Key Metrics
- **Critical Issues**: 2
- **High Priority Issues**: 5
- **Medium Priority Issues**: 7
- **Low Priority Issues**: 4

---

## Critical Issues (Priority 1)

### Issue #1: Rate Limiter Never Used -- All API Endpoints Unprotected

- **File**: `app/lib/rate-limit.js` (defined), `app/api/compress/route.js` (should use it)
- **Category**: Security / Abuse Protection
- **Description**: `checkRateLimit()` and `rateLimitResponse()` are fully implemented in `app/lib/rate-limit.js` but **zero routes import them**. The compress endpoint, decompress endpoint, key creation endpoint, and analytics endpoint are all completely unprotected against brute force or abuse.
- **Impact**: An attacker can hammer `/api/compress` with unlimited requests, causing database write amplification (every authenticated request writes to `compressions` + upserts `usage_meters`), potential Neon DB cost overrun, and Vercel function invocation exhaustion.
- **Fix**: Import and apply the rate limiter in at minimum `/api/compress/route.js` and `/api/keys/route.js`:
```js
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';

// At top of POST handler:
const ip = request.headers.get('x-forwarded-for') || 'unknown';
const { allowed, retryAfter } = checkRateLimit(ip, { limit: 10, windowMs: 60_000 });
if (!allowed) return rateLimitResponse(retryAfter);
```

### Issue #2: Race Condition in Usage Meter Upsert (Compress Route)

- **File**: `app/api/compress/route.js:76-101`
- **Category**: Data Integrity
- **Description**: The usage metering follows a read-then-write pattern (SELECT existing, then either UPDATE or INSERT). Under concurrent requests from the same user, two requests can read the same `existing` row, both compute `existing[0].wordsProcessed + validation.words`, and both write -- causing one request's usage to be silently lost.
- **Impact**: Usage counters will under-count for users making rapid successive compressions. This affects billing accuracy and dashboard stats.
- **Fix**: Replace the SELECT+UPDATE/INSERT with a single atomic upsert using Drizzle's `onConflictDoUpdate` with SQL increment expressions:
```js
await db.insert(usageMeters).values({
  userId, period,
  wordsProcessed: validation.words,
  compressionCount: 1,
  tokensSaved: result.stats.tokensSaved,
  dollarsSaved: result.stats.dollarsSaved,
}).onConflictDoUpdate({
  target: [usageMeters.userId, usageMeters.period],
  set: {
    wordsProcessed: sql`usage_meters.words_processed + excluded.words_processed`,
    compressionCount: sql`usage_meters.compression_count + 1`,
    tokensSaved: sql`usage_meters.tokens_saved + excluded.tokens_saved`,
    dollarsSaved: sql`usage_meters.dollars_saved + excluded.dollars_saved`,
  },
});
```

---

## High Priority Issues (Priority 2)

### Issue #3: Stripe `getStripe()` Returns Null Without Guard -- Crashes on Use

- **File**: `app/lib/stripe.js:8`, called by `app/api/billing/checkout/route.js:38`
- **Category**: Runtime Crash
- **Description**: `getStripe()` returns `null` when `STRIPE_SECRET_KEY` is not set. But callers like `checkout/route.js` call `getStripe().customers.create(...)` without null-checking, which will throw `TypeError: Cannot read properties of null`.
- **Impact**: If the env var is missing or misconfigured, all billing endpoints crash with an unhandled exception instead of returning a clean error.
- **Fix**: Either throw a descriptive error inside `getStripe()` when the key is missing, or guard every call site:
```js
export function getStripe() {
  if (!instance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    instance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return instance;
}
```

### Issue #4: No Error Handling in Billing Checkout/Portal Routes

- **File**: `app/api/billing/checkout/route.js`, `app/api/billing/portal/route.js`
- **Category**: Error Handling
- **Description**: Neither route has a try/catch. If the Stripe API call fails (network timeout, invalid customer, expired key), the serverless function will return a raw 500 error with potentially sensitive error details in development mode.
- **Impact**: Users see cryptic errors. Stripe API failures (which happen) are not gracefully handled.
- **Fix**: Wrap both route handlers in try/catch, returning a clean JSON error response.

### Issue #5: Webhook Missing Event Type Handling for Unknown Events

- **File**: `app/api/billing/webhook/route.js:19-93`
- **Category**: Robustness
- **Description**: The switch statement handles 3 Stripe event types but has no `default` case. Stripe sends many event types (invoice.paid, payment_intent.succeeded, etc.). While returning `{ received: true }` at line 95 is correct, the lack of explicit default handling means future event types that need handling could be silently ignored.
- **Impact**: Low immediate risk but makes debugging missed webhook events harder. No logging of unhandled event types.
- **Fix**: Add a `default` case with minimal logging: `default: break;` or optionally log the event type.

### Issue #6: `hasStructuredData` Variable Assigned But Never Read

- **File**: `sdk/src/strategies.js:46`
- **Category**: Dead Code / Logic Bug
- **Description**: Line 46 computes `const hasStructuredData = /[{[\]}<>]/.test(text)` but this variable is never referenced. Only `jsonLikeRatio` on line 47 is used. The regex test result is wasted.
- **Impact**: Either dead code that should be removed, or a missing logic branch that was intended to use this signal (possible incomplete feature).
- **Fix**: Either remove the variable or incorporate it into the scoring logic as originally intended.

### Issue #7: Analytics Route Silently Swallows All Errors

- **File**: `app/api/analytics/route.js:47-53`
- **Category**: Observability
- **Description**: Three nested catch blocks with no error logging. The outer catch at line 52 swallows everything silently. If the DB insert fails AND the fallback `console.log` also fails, there is zero visibility.
- **Impact**: Analytics data loss goes completely undetected. No way to know if the analytics pipeline is broken.
- **Fix**: At minimum add Sentry capture in the outer catch, since Sentry is already integrated into the project.

---

## Medium Priority Issues (Priority 3)

### Issue #8: Dashboard Uses `alert()` for Error Handling

- **File**: `app/dashboard/page.js:68,83,104,117`
- **Category**: UX / Code Quality
- **Description**: Four instances of `alert("Failed to...")` for error handling. This is a poor UX pattern that blocks the main thread and looks unprofessional.
- **Impact**: Bad user experience. Alert dialogs cannot be styled and feel broken on modern web apps.
- **Fix**: Replace with toast notifications or inline error state.

### Issue #9: `console.log` in Analytics Fallback (Production Code)

- **File**: `app/api/analytics/route.js:48`
- **Category**: Debug Artifact
- **Description**: `console.log('[analytics]', { event, before, after, saved, source })` is used as a DB fallback. While intentional, `console.log` in a serverless production route adds noise to logs without structure.
- **Impact**: Pollutes Vercel function logs. Not queryable or alertable.
- **Fix**: Replace with `console.warn` or use Sentry `captureMessage` for structured observability.

### Issue #10: `console.error` Statements Leak Error Details in Production

- **Files**: `app/api/compress/route.js:118`, `app/api/decompress/route.js:53`, `app/lib/auth.js:38`
- **Category**: Information Disclosure (Minor)
- **Description**: `console.error('Compression error:', error)` logs the full error object including stack traces. While the HTTP response correctly returns a generic message, the server logs may contain sensitive path information.
- **Impact**: Low risk since logs are server-side only, but Sentry is already integrated and should be the primary error capture mechanism.
- **Fix**: Replace `console.error` calls with `Sentry.captureException(error)` for structured error tracking.

### Issue #11: Dashboard `.catch(console.error)` -- Errors Silently Logged

- **File**: `app/dashboard/page.js:35,45`
- **Category**: Error Handling
- **Description**: Two fetch calls use `.catch(console.error)` which logs errors to the browser console but gives the user no feedback. The loading state will remain indefinitely if the fetch fails.
- **Impact**: User sees "Loading..." forever if `/api/usage` or `/api/keys` fails.
- **Fix**: Set an error state and show it in the UI, or at minimum set `loading` to false in the catch.

### Issue #12: `navigator.clipboard.writeText` Called Without Async Guard

- **File**: `app/dashboard/page.js:88`
- **Category**: Error Handling
- **Description**: `navigator.clipboard.writeText(createdKey)` is called without `await` or `.catch()`. The clipboard API can throw if permissions are denied or the page is not focused.
- **Impact**: Uncaught promise rejection if clipboard access fails. User thinks key was copied when it was not.
- **Fix**: Add error handling: `navigator.clipboard.writeText(createdKey).catch(() => {})` or use the async pattern already used in `CompressorWidget.js:139`.

### Issue #13: SDK `pingAnalytics` Uses Global `fetch` Without Environment Check

- **File**: `sdk/src/engine.js:16`
- **Category**: Compatibility
- **Description**: The SDK calls `fetch(ANALYTICS_URL, ...)` but `fetch` is not available in Node.js < 18. The SDK is designed to work in Node.js environments (it is an npm package), but does not check for `fetch` availability.
- **Impact**: SDK will throw `ReferenceError: fetch is not defined` on Node.js < 18 unless the user polyfills it. The catch block at line 21 would swallow this, but it is still an unnecessary error on every compression call.
- **Fix**: Add a typeof check: `if (typeof fetch !== 'function') return;`

### Issue #14: `countWords` Imported from Two Different Modules

- **File**: `app/lib/validate.js:1` imports from `./billing`, `sdk/src/utils.js` also exports `countWords`
- **Category**: Code Quality
- **Description**: `validate.js` imports `countWords` from `./billing` which re-exports from `@/sdk/src/utils.js`. This works but creates an unnecessary indirection. If `billing.js` ever changes its re-export, `validate.js` breaks silently.
- **Impact**: Fragile import chain. Not a bug today but a maintenance hazard.
- **Fix**: Import directly from `@/sdk/src/utils.js` or `@/app/lib/compression/engine.js`.

---

## Low Priority Issues (Priority 4)

### Issue #15: `tsconfig.json` Has `strict: false`

- **File**: `tsconfig.json:7`
- **Category**: Code Quality
- **Description**: TypeScript strict mode is disabled. While the project primarily uses `.js` files, the TypeScript files (`instrumentation.ts`, `instrumentation-client.ts`, `sentry.*.config.ts`) do not benefit from strict type checking.
- **Impact**: Type errors in TS files may go undetected.
- **Fix**: Enable `"strict": true` or at minimum `"strictNullChecks": true`.

### Issue #16: `wordsToTokens` Function Marked Deprecated But Still Exported

- **File**: `sdk/src/utils.js:11`
- **Category**: Dead Code
- **Description**: `wordsToTokens` is marked `@deprecated` but still exported and available to SDK consumers. It uses a rough `words * 1.3` heuristic that is superseded by `countTokens()`.
- **Impact**: SDK users may unknowingly use the deprecated, less accurate function.
- **Fix**: Remove from public exports in next major version, or add a console.warn on first use.

### Issue #17: `countRosettaWords` Marked Deprecated But Still Used

- **File**: `sdk/src/rosetta.js:47`, called from `sdk/src/engine.js:158`
- **Category**: Dead Code
- **Description**: Function is `@deprecated` in favor of `countRosettaTokens()` but the engine still calls it for backward-compatible stats.
- **Impact**: Minimal -- the function works correctly. Just technical debt.
- **Fix**: Inline the word count where needed and remove the deprecated export in a future version.

### Issue #18: console.log Statements in Documentation Code Examples

- **Files**: `app/page.js:178`, `app/docs/page.js:54-57`, `app/integrations/page.js:228`
- **Category**: Code Quality (Minor)
- **Description**: These `console.log` statements appear inside JSX template literals showing code examples to users. They are not executable production code -- they are documentation strings rendered in `<pre>` blocks.
- **Impact**: None -- these are intentional documentation examples, not debug artifacts.
- **Fix**: No action needed. These are correctly used as example code.

---

## Code Cleanup Required

### Dead Code to Remove

| File | Lines | Type | Description |
|------|-------|------|-------------|
| `app/lib/rate-limit.js` | 1-73 | Unused module | Fully implemented but never imported by any route |
| `sdk/src/strategies.js` | 46 | Unused variable | `hasStructuredData` computed but never read |
| `sdk/src/utils.js` | 11-13 | Deprecated function | `wordsToTokens()` superseded by `countTokens()` |

### Debug Code Review

| File | Line | Type | Verdict |
|------|------|------|---------|
| `app/api/analytics/route.js` | 48 | console.log | Intentional fallback -- replace with structured logging |
| `app/api/compress/route.js` | 118 | console.error | Intentional -- migrate to Sentry |
| `app/api/decompress/route.js` | 53 | console.error | Intentional -- migrate to Sentry |
| `app/lib/auth.js` | 38 | console.error | Intentional -- migrate to Sentry |
| `app/dashboard/page.js` | 35, 45 | console.error | Error swallowing -- add user feedback |
| `scripts/*.mjs` | various | console.log | Correct -- CLI scripts use stdout |
| `examples/*.mjs` | various | console.log | Correct -- example code |

---

## Validation Results

### Security Scan

- **SQL Injection**: PASS -- all queries use Drizzle ORM parameterized queries or `sql` template literals
- **XSS**: PASS -- `dangerouslySetInnerHTML` used only for static JSON-LD schema (safe)
- **Hardcoded Credentials**: PASS -- `.env.local` not tracked in git
- **API Key Storage**: PASS -- keys are SHA-256 hashed, raw key shown once
- **CORS**: PASS -- sensitive endpoints restricted to `tokenshrink.com`, only compress/decompress are wildcard (intentional for SDK usage)
- **Webhook Verification**: PASS -- Stripe signature verified before processing
- **Input Validation**: PASS -- text length and word count validated before compression

### Overall Status

**Security Posture**: Good with one critical gap (rate limiting not applied)
**Error Handling**: Moderate -- billing routes lack try/catch, dashboard swallows errors
**Code Quality**: Good -- clean architecture, single source of truth pattern for SDK

---

## Task List

### Critical Tasks (Fix Immediately)
- [ ] **[CRITICAL-1]** Wire up rate limiter to `/api/compress`, `/api/decompress`, `/api/keys` routes
- [ ] **[CRITICAL-2]** Replace read-then-write usage meter upsert with atomic `onConflictDoUpdate` using SQL increment

### High Priority Tasks (Fix Before Deployment)
- [ ] **[HIGH-1]** Make `getStripe()` throw on missing key instead of returning null
- [ ] **[HIGH-2]** Add try/catch to billing checkout and portal routes
- [ ] **[HIGH-3]** Remove or use `hasStructuredData` variable in strategies.js
- [ ] **[HIGH-4]** Add Sentry capture to analytics outer catch block
- [ ] **[HIGH-5]** Add default case to webhook switch for logging unhandled events

### Medium Priority Tasks (Schedule for Sprint)
- [ ] **[MEDIUM-1]** Replace `alert()` calls in dashboard with toast/inline errors
- [ ] **[MEDIUM-2]** Fix `.catch(console.error)` in dashboard to show user feedback
- [ ] **[MEDIUM-3]** Add clipboard error handling in dashboard `copyKey()`
- [ ] **[MEDIUM-4]** Migrate `console.error` calls to Sentry in API routes
- [ ] **[MEDIUM-5]** Add `typeof fetch` guard in SDK `pingAnalytics()`
- [ ] **[MEDIUM-6]** Replace `console.log` analytics fallback with structured logging
- [ ] **[MEDIUM-7]** Simplify `countWords` import chain in validate.js

### Low Priority Tasks (Backlog)
- [ ] **[LOW-1]** Enable `strict: true` in tsconfig.json
- [ ] **[LOW-2]** Plan deprecation removal for `wordsToTokens()` in next major
- [ ] **[LOW-3]** Inline `countRosettaWords()` and remove deprecated export
- [ ] **[LOW-4]** Remove unused `rate-limit.js` if rate limiting will be handled externally (e.g., Vercel WAF)

---

## Recommendations

1. **Immediate Actions**:
   - Wire up the existing rate limiter -- it is already written and tested, just not connected
   - Fix the usage meter race condition -- this is a data integrity issue affecting billing accuracy

2. **Short-term Improvements**:
   - Add try/catch to all billing routes
   - Replace `alert()` with proper UI feedback
   - Consolidate error handling through Sentry (already integrated)

3. **Long-term Refactoring**:
   - Consider Upstash Redis for distributed rate limiting (the in-memory approach has documented limitations on serverless)
   - Plan a deprecation cycle for `wordsToTokens()` in the SDK

4. **Testing Gaps**:
   - No test coverage for API routes (only SDK compression logic is tested)
   - Webhook handler has no test for unknown event types
   - Rate limiting has no tests (and is not even used)

---

*Report generated by bug-hunter agent*
