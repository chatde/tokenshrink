# TokenShrink v3 — Context Compression Engine

**Date:** 2026-03-15
**Status:** Approved
**Author:** Claude + Gemini (Pantheon dual review)

## Overview

TokenShrink v3 pivots from word-level phrase compression to semantic context compression. The free tier (phrase compression SDK) stays. The paid tier ($9/mo Advanced) becomes a B2B context compression engine targeting Claude Code power users and developer teams building AI agents.

**Product in one sentence:** TokenShrink v3 saves 30-50% of LLM tokens by stripping code blocks, truncating verbose responses, replacing repeated concepts with codebook symbols, and compressing system prompts.

## Strategy

- **Entry point:** Claude Code users (fast-growing market, hooks already exist)
- **Revenue play:** Developer teams with real API bills (`npm install tokenshrink` + middleware wrapper)
- **Architecture:** Smart engine lives in `sdk/src/`. Claude Code hooks are a thin wrapper. Developer teams use the same engine via `createMiddleware()`.

## Tier Structure

| Feature | Free | Advanced ($9/mo) |
|---------|------|-------------------|
| Phrase compression (v2) | Unlimited | Unlimited |
| History compression | Last 5 turns | Full, configurable depth + token budget |
| Codebook symbols | 1 book / 10 symbols | Unlimited / auto-learn |
| System prompt compression | No | Yes |
| SDK middleware wrapper | No | Yes |
| Savings dashboard | Counter only | Per-layer breakdown |
| Cross-session codebook learning | No | Yes |

## Architecture

### Three New Engines

All engines live in `sdk/src/` as zero-dependency ES modules. "Zero-dependency" means no entries in `sdk/package.json` dependencies. Node built-ins (`fs`, `path`, `os`) are permitted for file I/O — the SDK targets Node.js environments (Claude Code, server-side agents), not browsers.

#### 1. Conversation History Compressor (`sdk/src/history-compressor.js`)

**Purpose:** Reduce token cost of conversation history that gets re-sent every turn.

**How it works:**
- Input: Array of `{role, content}` messages (standard LLM chat format)
- Keeps last N turns verbatim (configurable, default 3)
- Older turns get structurally compressed (not semantically summarized) via local heuristics:
  - **Strip code blocks:** Remove content between triple backticks (biggest savings — code blocks are often 50-200 tokens each)
  - **Strip tool-call output:** Remove verbose tool results, keep only the tool name + summary line
  - **Truncate verbose assistant responses:** Keep first 2 sentences + last sentence, drop the middle
  - **Remove boilerplate:** Strip "Sure, I can help with that", "Let me think about this", etc.
  - **Keep user messages nearly verbatim:** User messages carry intent and are typically short
  - **Apply v2 phrase compression:** Run the existing engine on the remaining text

**Edge cases:**
- 0 to N messages (at or below verbatim threshold): no-op, return messages unchanged
- Messages with no code blocks or boilerplate: lower savings (~10-15%), still applies phrase compression
- Very long single messages (>500 tokens): truncate to first/last N sentences

**Output format:**
```
[PRIOR CONTEXT — 8 turns compressed]
User requested auth module. Built login/signup with JWT. User approved.
Rate limiting added. Debugging 429 responses on /api/login.
Decisions: bcrypt passwords, 15min token expiry, Redis rate limits.

[Recent conversation follows verbatim]
```

**Configuration:**
- `verbatimTurns` (default 3): Number of recent turns to keep unchanged
- `maxTokenBudget` (optional): Compress history to fit within N tokens total (Advanced only)

**Tier gating:**
- Free: Summarizes when history exceeds 5 turns, basic stripping only
- Advanced: Full history, configurable depth, token budget mode, all heuristics

**Performance targets:**
- 30%+ reduction on conversations with code blocks and verbose responses (common in Claude Code)
- 10-15% reduction on short/dense conversations without code
- 0% reduction (no-op) on conversations below the verbatim threshold

#### 2. Semantic Codebook Engine (`sdk/src/codebook-engine.js`)

**Purpose:** Replace repeated multi-token concepts with single symbols.

**How it works:**
- Manages project-specific symbol dictionaries stored as JSON
- Symbols map short codes to full semantic meaning:
  ```json
  {
    "version": 1,
    "symbols": {
      "$AUTH_CHECK": "Check authentication status, verify JWT token, return user object with role",
      "$DB_QUERY": "Connect to PostgreSQL via Drizzle ORM, run parameterized query, return results",
      "$DEPLOY_FLOW": "Run tests, build, push to main, Vercel auto-deploys"
    }
  }
  ```
- Auto-generates entries by analyzing repeated n-gram patterns in conversation history (same approach as existing `extractCandidates()` in `codebook.js` but for multi-word concept phrases instead of single words)
- Produces a `[CODEBOOK]` header prepended to compressed messages:
  ```
  [CODEBOOK: $AUTH_CHECK=verify JWT+return user; $DB_QUERY=postgres via drizzle; $DEPLOY_FLOW=test+build+push+vercel]
  ```

**Symbol naming rules:**
- All symbol keys MUST be prefixed with `$` to avoid natural-text conflicts
- Manual symbols added via `addSymbol()` reject duplicate keys with an error
- Auto-learned symbols are namespaced: `$AUTO_<key>` to distinguish from manual entries
- Overlapping meanings: longest match wins (if `$AUTH` and `$AUTH_CHECK` both match, use `$AUTH_CHECK`)

**Codebook management:**
- `createCodebook(name)` — new empty codebook with version field
- `addSymbol(codebook, key, meaning)` — manual symbol (rejects duplicates, enforces `$` prefix)
- `removeSymbol(codebook, key)` — remove a symbol
- `autoLearn(messages)` — n-gram frequency analysis on history, suggest symbols for phrases appearing 3+ times
- `getHeader(codebook)` — generate compact [CODEBOOK] header
- `applyCodebook(text, codebook)` — replace concept occurrences with symbols

**Tier gating:**
- Free: 1 codebook, 10 symbols max, no auto-learn
- Advanced: Unlimited codebooks, unlimited symbols, auto-learn, cross-session persistence

#### 3. System Prompt Compressor (`sdk/src/prompt-compressor.js`)

**Purpose:** Compress verbose system prompts that get sent with every API call.

**How it works:**
- Applies aggressive phrase compression (v2 engine tuned for instruction text)
- Structural deduplication: finds repeated instruction patterns and collapses them
- Removes verbose wrapper phrases ("It is important that you...", "Please make sure to always...") → keeps just the instruction
- Preserves all semantic meaning and constraints

**Advanced only.** This is the clearest value-add for developer teams — system prompts are often 500-2000 tokens of verbose instructions.

### Claude Code Integration

#### Hooks

**`UserPromptSubmit` hook:**
1. Run phrase compression on user prompt (free, existing v2)
2. Inject `[CODEBOOK]` header if symbols active
3. Show savings counter: `+Ntk saved`

**`PreCompact` hook:**
1. Fires when Claude Code is about to compact conversation
2. Run history compressor on full conversation
3. Replace older turns with structurally compressed versions
4. Feed pre-compressed conversation to Claude's built-in compactor
5. This is where the biggest savings happen

**`SessionStart` hook:**
1. Load project codebook from `.claude/tokenshrink/codebooks/<project>.json`
2. Check Advanced tier status (local license, cached validation)
3. Show status: `TokenShrink active | Codebook: N symbols | Tier: Free/Advanced`

#### User File Layout

```
.claude/
  tokenshrink/
    codebooks/
      default.json        # Auto-generated from conversation patterns
      custom.json          # User-defined symbols
    config.json            # Tier, preferences, history depth
    stats.json             # Cumulative savings tracker
```

### SDK Middleware (Developer Teams)

Developer-facing wrapper for any OpenAI-compatible messages array:

```js
import { createMiddleware } from 'tokenshrink';

const ts = createMiddleware({
  licenseKey: 'ts_live_...',
  codebook: './codebooks/support-bot.json',
  historyDepth: 20,
  compressSystemPrompt: true
});

const compressed = ts.compress(messages);
// compressed.messages = optimized messages array
// compressed.stats = { originalTokens, compressedTokens, saved, percent }

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: compressed.messages
});
```

**Key properties:**
- Zero lock-in: works with OpenAI, Anthropic, Google, any standard messages format
- Local compression: all prompt/conversation content stays on the user's machine. The only outbound call is a license key validation (sends only the key string, receives a boolean + tier)
- Pluggable tokenizer: uses built-in cl100k_base by default, accepts custom tokenizer function

### Tier Gating & Revenue

**License validation:**
- License key stored in `.claude/tokenshrink/config.json`
- Validated against `api.tokenshrink.com/verify` (one call per session start, response cached)
- Offline fallback: honor cached license for 7 days if API unreachable
- Payment: Stripe checkout (existing web app infrastructure)

**API endpoint:** `POST api.tokenshrink.com/verify`
- Input: `{ licenseKey: "ts_live_..." }`
- Output: `{ valid: true, tier: "advanced", expiresAt: "2026-04-15" }`

**Enforcement model:** Tier enforcement is client-side and intended as a convenience gate, not a security boundary. The SDK is open-source — determined users can bypass it. Revenue comes from teams who value the product and want updates/support, not from DRM enforcement. This is the same model as ESLint, Prettier, and most developer tools.

### Relationship to Existing Files

**Files that DO NOT change (backward compatibility):**
- `sdk/src/engine.js` — v2 phrase compressor, free tier backbone. Untouched.
- `sdk/src/dictionaries.js` — word/phrase mappings. Untouched.
- `sdk/src/codebook.js` — existing session vocab generator. **Keep as-is.** The new `codebook-engine.js` is a separate, more powerful module. Existing imports and tests continue working.
- `sdk/src/history.js` — existing `compressHistory()` for per-message phrase compression. **Keep as-is.** The new `history-compressor.js` does structural compression (strip code blocks, truncate). These are complementary operations, not replacements.
- `sdk/src/rosetta.js` — existing `[DECODE]` header generator. **Keep as-is.** The `[CODEBOOK]` header is generated by `codebook-engine.js`. Both formats coexist: `[DECODE]` for v2 phrase compression, `[CODEBOOK]` for v3 concept symbols.

**New files to create:**
| File | Purpose |
|------|---------|
| `sdk/src/history-compressor.js` | Conversation history structural compression |
| `sdk/src/codebook-engine.js` | Semantic codebook manager with `$` prefixed symbols |
| `sdk/src/prompt-compressor.js` | System prompt optimizer (Advanced only) |
| `sdk/src/middleware.js` | Developer `createMiddleware()` wrapper |
| `sdk/src/tier.js` | License validation + feature gating |

**Files to update:**
| File | Change |
|------|--------|
| `sdk/src/index.js` | Add exports for new modules |
| `app/pricing/page.js` | Reflect v3 tiers |
| `app/dashboard/page.js` | Show per-layer savings metrics |
| `app/api/verify/route.js` (new) | License verification endpoint |
| `hooks/` | PreCompact + SessionStart hooks use new SDK |

## Testing Strategy

- All new SDK modules get unit tests (target 80%+ coverage)
- Integration tests for the middleware wrapper with mock messages arrays
- Token count verification: tests use `gpt-tokenizer` (already a dev dependency in root `package.json`) for cl100k_base accuracy. The SDK runtime uses the built-in heuristic unless a custom tokenizer is provided.
- Regression tests: all existing tests must continue passing (no changes to existing files)
- Free vs Advanced tier gating tests
- Edge case tests: empty conversations, single message, codebook symbol collisions

## Success Criteria

1. History compressor achieves 30%+ token reduction on conversations with code blocks (10+ turns)
2. History compressor achieves 10%+ on short/dense conversations
3. Codebook symbols reduce repeated concept tokens by 50%+
4. System prompt compressor achieves 15%+ reduction on verbose prompts
5. All existing tests pass (backward compatibility — no existing files changed)
6. New modules have 80%+ test coverage
7. Claude Code hooks work end-to-end in a real session
8. `npm install tokenshrink` + `createMiddleware()` works for developer teams

## Out of Scope (Future)

- Hosted proxy service (`api.tokenshrink.com` as API gateway) — Phase 4
- Auto-codebook sharing across team members — Phase 4
- Visual codebook editor in web dashboard — Phase 4
- Browser-compatible SDK build — not planned (Node.js target only)
- Mobile SDK — not planned
