const vscode = require('vscode');
const { compress } = require('tokenshrink');

/** @type {vscode.StatusBarItem | undefined} */
let statusBarItem;

/** @type {NodeJS.Timeout | undefined} */
let hideTimeout;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const compressSelectionCmd = vscode.commands.registerCommand(
    'tokenshrink.compressSelection',
    () => compressSelection()
  );

  const compressFileCmd = vscode.commands.registerCommand(
    'tokenshrink.compressFile',
    () => compressFile()
  );

  context.subscriptions.push(compressSelectionCmd, compressFileCmd);
}

function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = undefined;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = undefined;
  }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function compressSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('TokenShrink: No active editor.');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('TokenShrink: No text selected.');
    return;
  }

  const text = editor.document.getText(selection);
  if (text.trim().length === 0) {
    vscode.window.showWarningMessage('TokenShrink: Selection is empty or whitespace.');
    return;
  }

  const result = compress(text);

  if (result.stats.tokensSaved === 0) {
    vscode.window.showInformationMessage('TokenShrink: Text is already compact — no savings possible.');
    return;
  }

  await editor.edit((editBuilder) => {
    editBuilder.replace(selection, result.compressed);
  });

  showSavings(result.stats);
}

async function compressFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('TokenShrink: No active editor.');
    return;
  }

  const document = editor.document;
  const text = document.getText();

  if (text.trim().length === 0) {
    vscode.window.showWarningMessage('TokenShrink: File is empty.');
    return;
  }

  const result = compress(text);

  if (result.stats.tokensSaved === 0) {
    vscode.window.showInformationMessage('TokenShrink: File is already compact — no savings possible.');
    return;
  }

  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );

  await editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, result.compressed);
  });

  showSavings(result.stats);
}

// ---------------------------------------------------------------------------
// Status bar + info message
// ---------------------------------------------------------------------------

/**
 * @param {{ originalTokens: number, totalCompressedTokens: number, tokensSaved: number, ratio: number, dollarsSaved: number }} stats
 */
function showSavings(stats) {
  const pct = Math.round((1 - stats.totalCompressedTokens / stats.originalTokens) * 100);

  // Info message with full summary
  vscode.window.showInformationMessage(
    `TokenShrink: ${stats.tokensSaved} tokens saved (${pct}% reduction). ` +
    `${stats.originalTokens} -> ${stats.totalCompressedTokens} tokens. ` +
    `~$${stats.dollarsSaved.toFixed(2)} saved per call.`
  );

  // Status bar item that auto-hides after 10 seconds
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  }

  statusBarItem.text = `$(zap) TokenShrink: ${stats.tokensSaved} tokens saved (${pct}% reduction)`;
  statusBarItem.tooltip = `${stats.originalTokens} -> ${stats.totalCompressedTokens} tokens | ~$${stats.dollarsSaved.toFixed(2)} saved per call`;
  statusBarItem.show();

  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  hideTimeout = setTimeout(() => {
    if (statusBarItem) {
      statusBarItem.hide();
    }
    hideTimeout = undefined;
  }, 10_000);
}

module.exports = { activate, deactivate };
