import Navbar from './components/Navbar';
import CompressorWidget from './components/CompressorWidget';
import PricingTable from './components/PricingTable';
import SavingsCalculator from './components/SavingsCalculator';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-14">
        {/* Hero — the demo IS the product */}
        <section className="px-6 pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text leading-tight">
              Stop overpaying for
              <span className="text-savings"> AI tokens</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              Paste your prompt. We compress it. You save 60-80% on every API call.
              <br />
              Works with OpenAI, Anthropic, Google, and every LLM provider.
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
                  title: 'Save money',
                  desc: 'Use the compressed version in your API calls. Same AI quality, 60-80% fewer tokens.',
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
                { value: '6-10x', label: 'Compression ratio' },
                { value: '< 200ms', label: 'Processing time' },
                { value: '$0', label: 'To get started' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl font-bold text-savings">{value}</div>
                  <div className="text-sm text-text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Savings calculator */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold text-text">
              What if you saved this on <span className="text-savings">every</span> API call?
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              See your potential monthly savings based on current AI spend
            </p>
          </div>
          <SavingsCalculator />
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-20 border-t border-border bg-bg-secondary">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text">Simple pricing</h2>
            <p className="text-sm text-text-secondary mt-2">
              Pay for words processed. Start free, upgrade when you need more.
            </p>
          </div>
          <PricingTable />
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
                <code>{`import OpenAI from 'openai';
import { TokenShrink } from 'tokenshrink';

const ts = new TokenShrink({ apiKey: 'ts_live_...' });
const openai = ts.wrapOpenAI(new OpenAI());

// Prompts are automatically compressed
const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: longPrompt }],
});
// Console: [TokenShrink] Saved 847 tokens (6.2x)`}</code>
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
            Start saving on AI costs today
          </h2>
          <p className="text-text-secondary mb-8">
            No credit card required. 5,000 words free every month.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
          >
            Get started free
          </Link>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-text-muted">
              Token<span className="text-savings">Shrink</span> &mdash; Save on every API call
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
              <Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link>
              <a href="https://github.com/chatde/tokenshrink" className="hover:text-text transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
