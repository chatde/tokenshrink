import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Integrations — TokenShrink',
  description:
    'Use TokenShrink with Claude Code hooks, OpenClaw, and any LLM SDK. Automatic prompt compression wherever you work.',
};

function SectionDivider() {
  return <div className="h-px bg-border" />;
}

function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="h-px flex-1 bg-border" />
      <h2 className="text-xl font-semibold text-text-secondary">{children}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function Badge({ label }) {
  return (
    <span className="text-xs font-mono font-bold text-savings bg-savings/10 px-2 py-0.5 rounded align-middle">
      {label}
    </span>
  );
}

function CodeWindow({ filename, children }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <div className="w-2.5 h-2.5 rounded-full bg-cost/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-savings/60" />
        <span className="ml-2 text-xs text-text-muted font-mono">{filename}</span>
      </div>
      <pre className="p-5 text-sm font-mono text-text-secondary overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }) {
  return (
    <code className="text-text bg-bg px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  );
}

export default function IntegrationsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 px-6">
        <div className="max-w-3xl mx-auto py-12">

          {/* Hero */}
          <div className="mb-14">
            <p className="text-xs tracking-[0.25em] uppercase text-savings/60 mb-3 font-mono">
              ◈ Drop-in compression for every workflow
            </p>
            <h1 className="text-3xl font-bold text-text mb-3">Integrations</h1>
            <p className="text-text-secondary">
              TokenShrink plugs into your existing workflow.
              No new tools to learn. No changes to how you work.
            </p>
          </div>

          <SectionDivider />

          {/* Claude Code */}
          <section className="py-14">
            <SectionHeader>Claude Code Hook</SectionHeader>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-text">Claude Code</h3>
                <Badge label="HOOK" />
              </div>
              <p className="text-sm text-text-secondary">
                Automatically compresses every prompt you send
              </p>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
              <h4 className="text-xs font-medium text-savings mb-2 uppercase tracking-wider">
                How it works
              </h4>
              <p className="text-sm text-text-secondary">
                A <InlineCode>UserPromptSubmit</InlineCode> hook intercepts your message before it
                reaches Claude, compresses it with TokenShrink, and passes the compressed version —
                saving tokens on every single turn.
              </p>
            </div>

            <div className="space-y-6 mb-6">
              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-savings/20 font-mono leading-none pt-0.5 w-8 shrink-0">01</div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-2">Install the package globally</p>
                  <CodeWindow filename="terminal">{`npm install -g tokenshrink`}</CodeWindow>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-savings/20 font-mono leading-none pt-0.5 w-8 shrink-0">02</div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-2">
                    Copy the hook to <InlineCode>~/.claude/hooks/</InlineCode>
                  </p>
                  <CodeWindow filename="terminal">{`curl -o ~/.claude/hooks/tokenshrink-compress.js \\
  https://raw.githubusercontent.com/chatde/tokenshrink/main/hooks/tokenshrink-compress.js`}</CodeWindow>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-savings/20 font-mono leading-none pt-0.5 w-8 shrink-0">03</div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-2">
                    Register the hook in <InlineCode>~/.claude/settings.json</InlineCode>
                  </p>
                  <CodeWindow filename="~/.claude/settings.json">{`{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "NODE_PATH=$(npm root -g) node ~/.claude/hooks/tokenshrink-compress.js"
          }
        ]
      }
    ]
  }
}`}</CodeWindow>
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-5 savings-glow">
              <h4 className="text-xs font-medium text-savings mb-2 uppercase tracking-wider">
                What you get
              </h4>
              <p className="text-sm text-text-secondary">
                Every prompt you type in Claude Code is automatically compressed.
                Long verbose messages shrink. Your Claude session costs less.
                Nothing changes about how you work.
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* OpenClaw */}
          <section className="py-14">
            <SectionHeader>OpenClaw</SectionHeader>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-text">OpenClaw</h3>
                <Badge label="SDK" />
              </div>
              <p className="text-sm text-text-secondary">
                Compress conversation history before routing to your agents
              </p>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
              <h4 className="text-xs font-medium text-savings mb-2 uppercase tracking-wider">
                What is OpenClaw
              </h4>
              <p className="text-sm text-text-secondary">
                OpenClaw is a Discord-to-AI gateway that routes messages to local agents.
                TokenShrink&apos;s <InlineCode>compressHistory()</InlineCode> reduces the token
                cost of every conversation before it hits your Ollama models.
              </p>
            </div>

            <div className="mb-6">
              <CodeWindow filename="openclaw-handler.js">{`import { compressHistory } from 'tokenshrink';

// Before sending conversation to your agent
const { messages, stats } = compressHistory(conversationHistory);
console.log(\`Saved \${stats.totalTokensSaved} tokens this turn\`);

// Pass compressed messages to Ollama or any OpenAI-compatible API
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'your-model',
    messages: messages,
  }),
});`}</CodeWindow>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-5">
              <h4 className="text-xs font-medium text-savings mb-2 uppercase tracking-wider">Note</h4>
              <p className="text-sm text-text-secondary">
                Works with any Ollama model. Compression happens locally — no data leaves your machine.
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* SDK */}
          <section className="py-14">
            <SectionHeader>SDK</SectionHeader>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-text">Any Claude App</h3>
                <Badge label="SDK" />
              </div>
              <p className="text-sm text-text-secondary">Two functions. Works with every LLM.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <CodeWindow filename="single-prompt.js">{`// Single prompt
import { compress } from 'tokenshrink';

const { compressed, stats } = compress(myPrompt);
// → stats.tokensSaved
// → stats.ratio`}</CodeWindow>

              <CodeWindow filename="conversation.js">{`// Full conversation history
import { compressHistory } from 'tokenshrink';

const { messages, stats } = compressHistory(history);
// → stats.totalTokensSaved
// → stats.messagesCompressed`}</CodeWindow>
            </div>

            <div className="text-center">
              <code className="text-sm text-text-muted bg-bg-card px-3 py-1.5 rounded-lg border border-border font-mono">
                npm install tokenshrink
              </code>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
