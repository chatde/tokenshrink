# TokenShrink

[![npm](https://img.shields.io/npm/v/tokenshrink)](https://www.npmjs.com/package/tokenshrink)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)

**Compress AI prompts — same results, fewer tokens.** Works with every LLM.

Zero dependencies. Pure JavaScript. ~10% token savings on average.

## Install

```bash
npm install tokenshrink
```

## Quick Start

```javascript
import { compress } from 'tokenshrink';

const result = compress('In order to build a good application, it is important to consider the requirements and make sure that you understand the specifications before you start the implementation process.');

console.log(result.compressed);   // Compressed text with [DECODE] header
console.log(result.stats.tokensSaved);  // Tokens saved
console.log(result.stats.ratio);        // Compression ratio
```

## API

### `compress(text, options?)`

Compresses text for LLM consumption.

**Parameters:**
- `text` (string) — The prompt text to compress
- `options` (object, optional):
  - `domain` (`'auto'` | `'code'` | `'medical'` | `'legal'` | `'business'`) — Compression domain. Default: `'auto'`
  - `forceStrategy` (string) — Override auto-detected strategy

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
    ratio: number,           // e.g. 1.2 = 20% smaller
    tokensSaved: number,
    dollarsSaved: number,    // Estimated at $0.005/1K tokens
    strategy: string,
    domain: string,
    confidence: number,
    replacementCount: number,
    patternCount: number,
  }
}
```

### `detectStrategy(text)`

Auto-detects the best compression domain for a given text.

```javascript
import { detectStrategy } from 'tokenshrink';

detectStrategy('The patient presented with acute symptoms...');
// { strategy: 'domain', domain: 'medical', confidence: 0.7 }
```

### `getDictionary(domain)`

Returns the abbreviation dictionary for a domain.

```javascript
import { getDictionary } from 'tokenshrink';

const dict = getDictionary('code');
// { 'function': 'fn', 'variable': 'var', ... }
```

### `countWords(text)` / `wordsToTokens(words)` / `tokensToDollars(tokens)`

Utility functions for token math.

```javascript
import { countWords, wordsToTokens, tokensToDollars } from 'tokenshrink';

const words = countWords('Hello world');         // 2
const tokens = wordsToTokens(words);             // 3 (1 word ≈ 1.3 tokens)
const cost = tokensToDollars(tokens);            // 0.000015
```

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

## Compression Domains

| Domain | Best for | Example signals |
|--------|----------|-----------------|
| `auto` | General use (default) | Auto-detects from content |
| `code` | Programming prompts | function, const, import, async |
| `medical` | Clinical notes | patient, diagnosis, treatment |
| `legal` | Legal documents | hereby, whereas, plaintiff |
| `business` | Business comms | stakeholder, deliverable, KPI |

## How It Works

1. **Phrase removal** — Verbose filler is compressed or removed ("in order to" → "to")
2. **Word abbreviation** — Common words become short codes ("function" → "fn")
3. **Pattern detection** — Repeated phrases are collapsed into shorthand (P1, P2...)
4. **Rosetta Stone** — A tiny decoder header teaches the LLM all abbreviations

No LLM calls. No external APIs. Everything runs locally in ~1ms.

## Links

- **Web UI**: [tokenshrink.com](https://tokenshrink.com)
- **GitHub**: [github.com/chatde/tokenshrink](https://github.com/chatde/tokenshrink)
- **Docs**: [tokenshrink.com/docs](https://tokenshrink.com/docs)

## License

[MIT](LICENSE)
