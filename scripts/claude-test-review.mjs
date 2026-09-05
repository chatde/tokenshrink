import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Existing Claude subscription auth; no fallback credentials or unrestricted tools.
const child = spawn('claude', [
  '-p', '--disable-slash-commands', '--tools', 'Bash', '--allowedTools', 'Bash(npm test)',
  '--permission-mode', 'dontAsk', '--no-session-persistence', '--output-format', 'json',
  '--max-budget-usd', '0.50', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
  '--setting-sources', '', '--system-prompt',
  'You are a bounded test runner. Run exactly npm test once in the current directory. Do not run other commands, read files, or edit anything. Report the exit code and test counts; do not claim unrun checks. Keep the final answer below 100 words.',
  'Run the TokenShrink test suite now and report the result.',
], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
let size = 0;
const timeout = setTimeout(() => { child.kill('SIGTERM'); }, 120000);
child.stdout.on('data', chunk => { size += chunk.length; if (size > 100000) child.kill('SIGTERM'); else output += chunk; });
// Do not forward provider diagnostics that might contain local configuration.
child.stderr.resume();
child.on('error', () => { clearTimeout(timeout); process.stderr.write('Claude CLI could not start.\n'); process.exitCode = 1; });
child.on('close', code => {
  clearTimeout(timeout);
  try {
    const result = JSON.parse(output);
    process.stdout.write(JSON.stringify({ cliExitCode: code, error: result.is_error, result: result.result,
      usage: result.usage, reportedCostUsd: result.total_cost_usd, permissionDenials: result.permission_denials?.length || 0 }, null, 2) + '\n');
  } catch { process.stderr.write('Claude did not return a completed structured result.\n'); }
  process.exitCode = code === 0 ? 0 : 1;
});
