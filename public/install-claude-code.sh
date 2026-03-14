#!/bin/bash
# TokenShrink — Claude Code one-command installer
# Usage: curl -fsSL https://tokenshrink.com/install-claude-code.sh | bash

set -e

HOOKS_DIR="$HOME/.claude/hooks"
HOOK_FILE="$HOOKS_DIR/tokenshrink-compress.js"
SETTINGS_FILE="$HOME/.claude/settings.json"
HOOK_URL="https://tokenshrink.com/hooks/tokenshrink-compress.js"

GREEN='\033[0;32m'
DIM='\033[2m'
RESET='\033[0m'

echo ""
echo "  💰 TokenShrink × Claude Code"
echo "  ─────────────────────────────"

# 1. Check node is available
if ! command -v node &>/dev/null; then
  echo "  ✗ Node.js not found. Install it from nodejs.org and re-run."
  exit 1
fi

# 2. Create hooks directory
mkdir -p "$HOOKS_DIR"

# 3. Download hook
echo -n "  Downloading hook... "
curl -fsSL "$HOOK_URL" -o "$HOOK_FILE"
chmod +x "$HOOK_FILE"
echo -e "${GREEN}done${RESET}"

# 4. Patch settings.json — merge UserPromptSubmit hook without clobbering existing config
echo -n "  Patching ~/.claude/settings.json... "

node -e "
const fs = require('fs');
const path = '$SETTINGS_FILE';
let settings = {};
try { settings = JSON.parse(fs.readFileSync(path, 'utf8')); } catch {}

if (!settings.hooks) settings.hooks = {};
if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];

const hookCommand = 'node \$HOME/.claude/hooks/tokenshrink-compress.js';
const alreadyInstalled = settings.hooks.UserPromptSubmit.some(entry =>
  (entry.hooks || []).some(h => h.command && h.command.includes('tokenshrink-compress'))
);

if (!alreadyInstalled) {
  settings.hooks.UserPromptSubmit.unshift({
    hooks: [{ type: 'command', command: hookCommand }]
  });
  fs.writeFileSync(path, JSON.stringify(settings, null, 2));
  process.stdout.write('done\n');
} else {
  process.stdout.write('already installed\n');
}
"

# 5. Done
echo ""
echo -e "  ${GREEN}✓ TokenShrink is active${RESET}"
echo -e "  ${DIM}Every prompt you send to Claude is now automatically compressed."
echo -e "  Token savings appear in your Claude Code status line.${RESET}"
echo ""
echo -e "  ${DIM}Uninstall: remove the hook entry from ~/.claude/settings.json${RESET}"
echo ""
