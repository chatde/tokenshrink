import Navbar from '../components/Navbar';
import Link from 'next/link';
import UpgradeButton from './UpgradeButton';

export const metadata = {
  title: 'Pricing — TokenShrink',
  description: 'TokenShrink Free is free forever. TokenShrink Advanced unlocks the Rosetta Protocol — negotiated session cipher, domain rotors, and cross-session learning.',
};

const CHECK = (
  <svg className="w-4 h-4 text-savings mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DASH = (
  <svg className="w-4 h-4 text-text-muted mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const FREE_FEATURES = [
  { label: 'Web compressor', included: true },
  { label: 'Unlimited compressions', included: true },
  { label: 'API access + SDK', included: true },
  { label: 'All LLM providers supported', included: true },
  { label: 'Usage dashboard', included: true },
  { label: 'No sign-up required to try', included: true },
  { label: 'Rosetta Protocol (Enigma codec)', included: false },
  { label: 'Domain rotors (React / Node / Python / Supabase)', included: false },
  { label: 'Sub-agent vocab inheritance', included: false },
  { label: 'Cross-session learning', included: false },
];

const ADVANCED_FEATURES = [
  { label: 'Everything in Free', included: true },
  { label: 'Rosetta Protocol (Enigma codec)', included: true },
  { label: 'Session codebook — negotiated cipher', included: true },
  { label: 'Domain rotors (React / Node / Python / Supabase)', included: true },
  { label: 'Sub-agent vocab inheritance', included: true },
  { label: 'Cross-session learning — Hall of Fame', included: true },
  { label: 'Compaction-safe Rosetta re-injection', included: true },
  { label: 'Advanced usage dashboard', included: true },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[88px]">
        <section className="px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-text">Simple pricing</h1>
            <p className="text-text-secondary mt-2">
              Free forever for phrase compression. Advanced unlocks the Enigma machine.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

            {/* Free plan */}
            <div className="rounded-xl border border-border bg-bg-card p-8 flex flex-col">
              <div>
                <div className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wider">Free forever</div>
                <h3 className="text-lg font-semibold text-text">TokenShrink Free</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-text">$0</span>
                  <span className="text-sm text-text-muted">/ month</span>
                </div>
                <p className="text-xs text-text-muted mt-2">No credit card. No expiry.</p>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {FREE_FEATURES.map(({ label, included }) => (
                  <li key={label} className="flex items-start gap-2 text-sm text-text-secondary">
                    {included ? CHECK : DASH}
                    <span className={included ? '' : 'text-text-muted'}>{label}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="mt-8 block w-full py-2.5 rounded-lg text-sm font-medium text-center border border-border text-text hover:bg-bg transition-all"
              >
                Get started free
              </Link>
            </div>

            {/* Advanced plan */}
            <div className="rounded-xl border border-savings/40 bg-savings/5 p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-savings text-bg text-xs font-semibold px-3 py-1 rounded-full">
                  The Enigma Machine
                </span>
              </div>

              <div>
                <div className="text-xs font-medium text-savings mb-3 uppercase tracking-wider">Advanced</div>
                <h3 className="text-lg font-semibold text-text">TokenShrink Advanced</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-text">$5</span>
                  <span className="text-sm text-text-muted">/ month</span>
                </div>
                <p className="text-xs text-text-muted mt-2">$36/year — save 40%</p>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {ADVANCED_FEATURES.map(({ label }) => (
                  <li key={label} className="flex items-start gap-2 text-sm text-text-secondary">
                    {CHECK}
                    {label}
                  </li>
                ))}
              </ul>

              <UpgradeButton />
            </div>

          </div>
        </section>

        {/* What is the Rosetta Protocol */}
        <section className="px-6 py-16 border-t border-border">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-xl font-bold text-text">What is the Rosetta Protocol?</h2>
            <p className="text-sm text-text-secondary mt-3 leading-relaxed">
              The Enigma Machine concept: at session start, Claude and you negotiate a shared codebook — a compressed cipher
              built from your actual project&apos;s vocabulary. Every subsequent message is compressed using that cipher.
              The cost is paid once, amortized across every message in the session.
            </p>
          </div>
          <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'Domain Rotors',
                body: 'Auto-detects your stack from package.json. React, Node, Python, Supabase vocab packs load automatically — 88 terms across 4 domains.',
              },
              {
                title: 'Cross-Session Learning',
                body: 'Terms that fire frequently across sessions get promoted to the Hall of Fame. Dead weight gets pruned. The codec improves every session.',
              },
              {
                title: 'Compaction-Safe',
                body: 'Context window resets? The Rosetta block is re-injected automatically. Sub-agents inherit the session vocab. The cipher never drops.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text mb-2">{title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-text text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Is Free really free forever?',
                  a: 'Yes. Phrase compression, API access, and the usage dashboard stay free with no credit card and no expiry. We mean it.',
                },
                {
                  q: 'What does Advanced add on top of Free?',
                  a: 'The Rosetta Protocol — a negotiated session cipher. At session start, a codebook is built from your project vocabulary. Every message is then compressed using that cipher. Advanced also includes domain rotors (tech-stack vocab packs), sub-agent vocab inheritance, and cross-session learning that improves the codec over time.',
                },
                {
                  q: 'Does compression affect AI response quality?',
                  a: 'No. We prepend a tiny decoder header that teaches the LLM our abbreviations. The AI understands the compressed prompt just as well as the original. For prompts under 30 words, we skip compression entirely.',
                },
                {
                  q: 'What AI providers does it work with?',
                  a: 'All of them. OpenAI, Anthropic, Google, Mistral, Llama, Cohere — any LLM that accepts text prompts. Our SDK has first-class support for OpenAI and Anthropic.',
                },
                {
                  q: 'Do you store my prompts?',
                  a: 'No. We never store your prompt text. We only store word counts, compression ratios, and usage statistics. Your prompts are processed in memory and immediately discarded.',
                },
                {
                  q: 'Can I cancel Advanced at any time?',
                  a: 'Yes. Cancel from the billing portal in your dashboard. You keep Advanced features until the end of your billing period, then drop back to Free automatically.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-bg-card border border-border rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-text mb-2">{q}</h3>
                  <p className="text-sm text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
