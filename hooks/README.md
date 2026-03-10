# TokenShrink Claude Code Hook

Automatically compresses every prompt you submit in Claude Code before Claude processes it, saving tokens on every request.

## What it does

This is a `UserPromptSubmit` hook. When you send a message, Claude Code passes the prompt text to this script. The script runs TokenShrink compression and, if tokens are saved, replaces your original prompt with the compressed version. If compression yields no savings, or if TokenShrink is not installed, the original prompt passes through unchanged.

## Requirements

```sh
npm install -g tokenshrink
```

## Install

1. Copy the hook script to your Claude Code hooks directory:

```sh
cp tokenshrink-compress.js ~/.claude/hooks/tokenshrink-compress.js
chmod +x ~/.claude/hooks/tokenshrink-compress.js
```

2. Add the hook to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/tokenshrink-compress.js"
          }
        ]
      }
    ]
  }
}
```

## Behavior

- **Saves tokens:** original prompt is suppressed, compressed version injected. Claude Code shows `TokenShrink: compressed prompt (N tokens saved)` in hook output.
- **No savings:** script exits with no output — original prompt used unchanged.
- **Not installed:** script exits silently with code 0 — prompts are never blocked.

## Troubleshooting

**Hook runs but prompts are not compressed**
```sh
node -e "require.resolve('tokenshrink')"
```
If that throws, run `npm install -g tokenshrink`.

**Node version:** Requires Node 16+ for ESM dynamic `import()` support. Check with `node --version`.

**JSON errors in verbose mode (`Ctrl+O`):** Your shell profile (`.zshrc`, `.bashrc`) may print text on startup, polluting stdout before the hook's JSON output. Guard non-interactive output with `[[ -z $PS1 ]] && return` at the top of your profile.
