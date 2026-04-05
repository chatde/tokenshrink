import Navbar from './components/Navbar';
import CompressorWidget from './components/CompressorWidget';
import Shrinkray from './components/Shrinkray';
import TokenCounter from './components/TokenCounter';
import LogoBar from './components/LogoBar';
import AuroraCard from './components/AuroraCard';
import Link from 'next/link';
import FadeIn from '@/components/fade-in';
import SplitText from '@/components/split-text';
import MagneticButton from '@/components/magnetic-button';
import TiltWrapper from '@/components/tilt-wrapper';

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-[88px]">
        {/* Hero — the demo IS the product */}
        <section className="px-6 pt-20 pb-16 relative">
          {/* Data stream animation */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="data-stream-line" />
            <div className="data-stream-line" />
            <div className="data-stream-line" />
          </div>

          <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-savings/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center mb-12 relative">
            <FadeIn>
              <p className="text-xs tracking-[0.25em] uppercase text-savings/60 mb-4 font-mono">
                ◈ Token Compression Engine
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="flex justify-center mb-6">
                <Shrinkray size={100} className="animate-bounce-slow" />
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text leading-tight">
                <span className="terminal-prompt" />
                <SplitText text="Same AI, fewer tokens." as="span" stagger={25} delay={400} />
                <br />
                <span className="text-savings">
                  <SplitText text="Ship smarter." as="span" stagger={30} delay={900} />
                  <span className="cursor-blink ml-0.5 inline-block w-0.5 h-[0.9em] bg-savings align-middle" />
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={400}>
              <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
                Your prompts are verbose. Your models don&apos;t need them to be.
                <br />
                TokenShrink compresses prompts — same results, fewer tokens. Open source.
              </p>
              <p className="mt-6 text-xs text-text-muted font-mono tracking-wide text-center">
                Typical savings: <span className="text-savings">15-35%</span> on system prompts
                <span className="hidden sm:inline"> · </span><br className="sm:hidden" />
                Works with <span className="text-savings">8</span> AI providers
                <span className="hidden sm:inline"> · </span><br className="sm:hidden" />
                <span className="text-savings">51</span> tests passing
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={500}>
            <CompressorWidget />
          </FadeIn>
        </section>

        {/* Works With logo bar */}
        <FadeIn delay={600}>
          <LogoBar />
        </FadeIn>

        {/* Social proof / stats */}
        <section className="px-6 py-16 border-t border-border bg-bg-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FadeIn delay={0}>
                <TiltWrapper>
                  <TokenCounter />
                </TiltWrapper>
              </FadeIn>
              {[
                { value: '100%', label: 'Open source', icon: '◈' },
                { value: '< 200ms', label: 'Processing time', icon: '◎' },
                { value: 'All LLMs', label: 'Compatible', icon: '✦' },
              ].map(({ value, label, icon }, i) => (
                <FadeIn key={label} delay={(i + 1) * 100}>
                  <TiltWrapper>
                    <AuroraCard className="savings-glow border border-savings/15 rounded-xl p-5 text-center bg-bg-card h-full">
                      <div className="text-savings/40 text-lg mb-2 font-mono">{icon}</div>
                      <div className="text-2xl font-bold text-savings font-mono">{value}</div>
                      <div className="text-xs text-text-muted mt-1">{label}</div>
                    </AuroraCard>
                  </TiltWrapper>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-3 mb-12">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-xl font-semibold text-text-secondary">How It Works</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Paste your prompt',
                  desc: 'System messages, user prompts, documents — anything you send to an LLM.',
                },
                {
                  step: '02',
                  title: 'We compress it',
                  desc: 'Our engine replaces verbose phrases with short codes and prepends a tiny decoder header.',
                },
                {
                  step: '03',
                  title: 'Use fewer tokens',
                  desc: 'Use the compressed version in your API calls. Same AI quality, fewer tokens.',
                },
              ].map(({ step, title, desc }, i) => (
                <FadeIn key={step} delay={i * 150}>
                  <TiltWrapper>
                    <AuroraCard className="bg-bg-card border border-border rounded-xl p-6 hover:border-border-hover hover:-translate-y-0.5 transition-all h-full">
                      <div className="text-3xl font-bold text-savings/20 mb-3 font-mono">{step}</div>
                      <h3 className="text-base font-semibold text-text mb-2">{title}</h3>
                      <p className="text-sm text-text-secondary">{desc}</p>
                    </AuroraCard>
                  </TiltWrapper>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* SDK / Developer section */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-xl font-semibold text-text-secondary">Drop-in SDK</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="text-sm text-text-secondary text-center mb-8">
                Two lines of code. Automatic compression on every API call.
              </p>
            </FadeIn>

            <FadeIn delay={200}>
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
            </FadeIn>

            <FadeIn delay={300}>
              <div className="text-center mt-6">
                <code className="text-sm text-text-muted bg-bg-card px-3 py-1.5 rounded-lg border border-border">
                  npm install tokenshrink
                </code>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-border bg-bg-secondary text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-text mb-4">
              <span className="terminal-prompt" />Compress your<br />
              <span className="text-savings">prompts for free</span>
            </h2>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="text-text-secondary mb-8">
              No account required. Open source. Compress and ship.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="font-mono text-xs text-text-muted/60 mb-6 mt-2">
              $ npm install tokenshrink <span className="text-savings/50">—</span> save tokens instantly
            </div>
          </FadeIn>
          <FadeIn delay={300}>
            <MagneticButton as="div" className="inline-block">
              <Link
                href="/login"
                className="inline-block px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
              >
                Get started
              </Link>
            </MagneticButton>
          </FadeIn>
        </section>

        {/* Footer */}
        <FadeIn>
          <footer className="px-6 py-10 border-t border-border">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>Token<span className="text-savings">Shrink</span></span>
                <span className="text-border">&middot;</span>
                <span>&copy; {new Date().getFullYear()}</span>
                <span className="text-border">&middot;</span>
                <span>Open source</span>
              </div>
              <div className="flex items-center gap-5 text-xs text-text-muted">
                <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
                <Link href="/providers" className="hover:text-text transition-colors">Providers</Link>
                <Link href="/integrations" className="hover:text-text transition-colors">Integrations</Link>
                <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
                <a href="https://apiguardrails.com" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">API Guardrails</a>
                <a href="https://github.com/chatde/tokenshrink" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">GitHub</a>
                <a href="https://chatde.dev" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">chatde.dev</a>
              </div>
            </div>
          </footer>
        </FadeIn>
      </main>
    </>
  );
}
