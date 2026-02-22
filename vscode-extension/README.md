# TokenShrink for VS Code

Compress AI prompts directly in your editor. Same results, fewer tokens, lower costs.

## What it does

TokenShrink applies token-aware compression to your text -- abbreviating common phrases, deduplicating repeated patterns, and stripping structural bloat. The compressed output includes a Rosetta Stone header so the AI model can decode everything without loss of meaning.

## Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:

| Command | Description |
|---|---|
| **TokenShrink: Compress Selection** | Compresses the currently selected text and replaces it in place. |
| **TokenShrink: Compress File** | Compresses the entire file content and replaces it in place. |

After compression, a status bar item shows the token savings for 10 seconds, and an info notification displays the full summary (original tokens, compressed tokens, percentage reduction, estimated dollar savings).

## Install

1. Clone this repo into your VS Code extensions folder, or package it with `vsce package`.
2. Run `npm install` to pull the `tokenshrink` SDK dependency.
3. Reload VS Code.

## Requirements

- VS Code 1.80.0 or later
- The `tokenshrink` npm package (installed automatically via `dependencies`)
