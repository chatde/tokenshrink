# TokenShrink

[![npm](https://img.shields.io/npm/v/tokenshrink)](https://www.npmjs.com/package/tokenshrink)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)

**Token-aware AI prompt compression — same results, fewer tokens.** Works with every LLM.

Zero runtime dependencies. Pure JavaScript. Real token savings verified with cl100k_base.

## What's new in v2.0

v2.0 is **token-aware** — every replacement is verified to save actual BPE tokens, not just characters.

- Removed 130+ entries that saved zero tokens (e.g. "function"→"fn" = 1 token → 1 token)
- Removed 45 entries that actually *increased* tokens (e.g. "should"→"shd" = 1 token → 2 tokens)
- New `countTokens()` function with built-in cl100k_base lookup
- Pluggable tokenizer support: `compress(text, { tokenizer })`
- New stats: `originalTokens`, `compressedTokens`, `rosettaTokens`, `totalCompressedTokens`

## Install

```bash
npm install tokenshrink
```

## Quick Start

```javascript
import { compress } from 'tokenshrink';

const result = compress('In order to build a good application, it is important to consider the requirements and make sure that you understand the specifications before you start the implementation process.');

console.log(result.compressed);              // Compressed text
console.log(result.stats.tokensSaved);       // Real token savings
console.log(result.stats.originalTokens);    // Original token count
console.log(result.stats.totalCompressedTokens); // Compressed token count
```

### With a custom tokenizer (optional, for exact counts)

```javascript
import { compress } from 'tokenshrink';
import { encode } from 'gpt-tokenizer';

const result = compress(longPrompt, {
  tokenizer: (text) => encode(text).length
});

console.log(result.stats.tokenizerUsed); // "custom"
```

## API

### `compress(text, options?)`

Compresses text for LLM consumption.

**Parameters:**
- `text` (string) — The prompt text to compress
- `options` (object, optional):
  - `domain` (`'auto'` | `'code'` | `'medical'` | `'legal'` | `'business'`) — Compression domain. Default: `'auto'`
  - `forceStrategy` (string) — Override auto-detected strategy
  - `tokenizer` (function) — Custom tokenizer: `(text: string) => number`. Default: built-in cl100k_base lookup

**Returns:**
```javascript
{
  compressed: string,        // Full compressed text ([DECODE] header + body)
  rosetta: string,           // Just the [DECODE] header
  compressedBody: string,    // Compressed text without header
  original: string,          // Original input
  stats: {
    originalWords: number,
    compressedWords: number,
    rosettaWords: number,
    totalCompressedWords: number,
    originalTokens: number,         // NEW in v2.0
    compressedTokens: number,       // NEW in v2.0
    rosettaTokens: number,          // NEW in v2.0
    totalCompressedTokens: number,  // NEW in v2.0
    ratio: number,           // Token-based compression ratio
    tokensSaved: number,     // Real token savings
    dollarsSaved: number,    // Estimated at $0.005/1K tokens
    strategy: string,
    domain: string,
    confidence: number,
    replacementCount: number,
    patternCount: number,
    tokenizerUsed: string,   // "built-in" or "custom"
  }
}
```

### `countTokens(text, tokenizer?)`

Count tokens using the built-in lookup or a custom tokenizer.

```javascript
import { countTokens } from 'tokenshrink';

countTokens('Hello world');           // Built-in estimate
countTokens('Hello world', encode);   // Exact count with gpt-tokenizer
```

### `replacementTokenSavings(original, replacement, tokenizer?)`

Check if a replacement saves tokens.

```javascript
import { replacementTokenSavings } from 'tokenshrink';

replacementTokenSavings('consequently', 'so');   // 2 (saves 2 tokens)
replacementTokenSavings('function', 'fn');        // 0 (no savings)
replacementTokenSavings('should', 'shd');         // -1 (costs more!)
```

### `detectStrategy(text)` / `getDictionary(domain)`

```javascript
import { detectStrategy, getDictionary } from 'tokenshrink';

detectStrategy('The patient presented with acute symptoms...');
// { strategy: 'domain', domain: 'medical', confidence: 0.7 }

const dict = getDictionary('code');
// { 'infrastructure': 'infra', 'polymorphism': 'poly', ... }
```

### `TOKEN_COSTS` / `ZERO_SAVINGS` / `NEGATIVE_SAVINGS`

Access the precomputed token data directly.

```javascript
import { TOKEN_COSTS, ZERO_SAVINGS, NEGATIVE_SAVINGS } from 'tokenshrink';

TOKEN_COSTS['function'];     // 1 (single token in cl100k_base)
TOKEN_COSTS['consequently']; // 3 (multiple tokens)
ZERO_SAVINGS.has('database');  // true — don't bother abbreviating
NEGATIVE_SAVINGS.has('should'); // true — "shd" costs MORE
```

## Benchmarks (verified with gpt-tokenizer)

| Prompt | Original | Compressed | Saved | % |
|--------|----------|------------|-------|---|
| Dev assistant (verbose) | 408 | 349 | 59 | 14.5% |
| Code review prompt | 210 | 183 | 27 | 12.9% |
| Medical notes | 151 | 134 | 17 | 11.3% |
| Business requirements | 143 | 121 | 22 | 15.4% |
| Minimal filler (hard to compress) | 77 | 77 | 0 | 0.0% |
| **Total** | **989** | **864** | **125** | **12.6%** |

All counts verified with `gpt-tokenizer` (cl100k_base). No prompt had its token count increase.

## Usage with LLM Providers

### OpenAI

```javascript
import { compress } from 'tokenshrink';
import OpenAI from 'openai';

const openai = new OpenAI();
const { compressed } = compress(longSystemPrompt);

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: compressed }],
});
```

### Anthropic

```javascript
import { compress } from 'tokenshrink';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();
const { compressed } = compress(longSystemPrompt);

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  system: compressed,
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Local Models (Ollama, llama.cpp, LM Studio)

```javascript
import { compress } from 'tokenshrink';

const { compressed } = compress(longPrompt);

// Works with any local model — the [DECODE] header teaches it the abbreviations
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({ model: 'llama3', prompt: compressed }),
});
```

## v2.0 Migration

If upgrading from v1.x:

- `tokensSaved` is now based on real token counts (was `words * 1.3`)
- `ratio` is now token-based (was word-based)
- New stats fields: `originalTokens`, `compressedTokens`, `rosettaTokens`, `totalCompressedTokens`, `tokenizerUsed`
- `wordsToTokens()` still works but is deprecated — use `countTokens()` instead
- Many dictionary entries removed (they didn't save tokens) — this is intentional
- `compress()` accepts optional `tokenizer` in options

## Links

- **Web UI**: [tokenshrink.com](https://tokenshrink.com)
- **GitHub**: [github.com/chatde/tokenshrink](https://github.com/chatde/tokenshrink)
- **Docs**: [tokenshrink.com/docs](https://tokenshrink.com/docs)

## License

[MIT](LICENSE)
