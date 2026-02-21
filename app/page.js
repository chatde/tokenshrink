import Navbar from './components/Navbar';
import CompressorWidget from './components/CompressorWidget';
import Shrinkray from './components/Shrinkray';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-14">
        {/* Hero — the demo IS the product */}
        <section className="px-6 pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="flex justify-center mb-6">
              <Shrinkray size={100} className="animate-bounce-slow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text leading-tight">
              Same AI, fewer tokens.
              <span className="text-savings"> Ship smarter.</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              Your prompts are verbose. Your models don&apos;t need them to be.
              <br />
              TokenShrink compresses prompts — same results, fewer tokens. Free forever.
            </p>
          </div>

          <CompressorWidget />
        </section>

        {/* How it works */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-text text-center mb-12">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Paste your prompt',
                  desc: 'System messages, user prompts, documents — anything you send to an LLM.',
                },
                {
                  step: '2',
                  title: 'We compress it',
                  desc: 'Our engine replaces verbose phrases with short codes and prepends a tiny decoder header.',
                },
                {
                  step: '3',
                  title: 'Use fewer tokens',
                  desc: 'Use the compressed version in your API calls. Same AI quality, fewer tokens.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-savings/10 border border-savings/20 text-savings font-bold text-lg flex items-center justify-center mx-auto mb-4">
                    {step}
                  </div>
                  <h3 className="text-base font-semibold text-text mb-2">{title}</h3>
                  <p className="text-sm text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof / stats */}
        <section className="px-6 py-16 border-t border-border bg-bg-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '100%', label: 'Free forever' },
                { value: '< 200ms', label: 'Processing time' },
                { value: 'All LLMs', label: 'Compatible' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl font-bold text-savings">{value}</div>
                  <div className="text-sm text-text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SDK / Developer section */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-text text-center mb-4">
              Drop-in SDK for developers
            </h2>
            <p className="text-sm text-text-secondary text-center mb-8">
              Two lines of code. Automatic compression on every API call.
            </p>

            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                <div className="w-2.5 h-2.5 rounded-full bg-cost/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-savings/60" />
                <span className="ml-2 text-xs text-text-muted">app.js</span>
              </div>
              <pre className="p-5 text-sm font-mono text-text-secondary overflow-x-auto">
                <code>{`import { compress } from 'tokenshrink';
import OpenAI from 'openai';

// Compress your system prompt
const { compressed, stats } = compress(longPrompt);
console.log(\`Saved \${stats.tokensSaved} tokens\`);

// Use with any LLM — OpenAI, Anthropic, local models
const openai = new OpenAI();
const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: compressed }],
});`}</code>
              </pre>
            </div>

            <div className="text-center mt-6">
              <code className="text-sm text-text-muted bg-bg-card px-3 py-1.5 rounded-lg border border-border">
                npm install tokenshrink
              </code>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-border bg-bg-secondary text-center">
          <h2 className="text-3xl font-bold text-text mb-4">
            Compress your prompts for free
          </h2>
          <p className="text-text-secondary mb-8">
            No credit card. No limits. No catch. Free forever.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
          >
            Get started
          </Link>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-text-muted">
              Token<span className="text-savings">Shrink</span> &mdash; Same AI, fewer tokens. Free forever.
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
              <Link href="/providers" className="hover:text-text transition-colors">Providers</Link>
              <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
              <a href="https://apiguardrails.com" className="hover:text-text transition-colors">API Guardrails</a>
              <a href="https://github.com/chatde/tokenshrink" className="hover:text-text transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
