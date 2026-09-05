import Navbar from '../components/Navbar';
import Link from 'next/link';
import UpgradeButton from './UpgradeButton';
import SavingsCalculator from './SavingsCalculator';

export const metadata = {
  title: 'Pricing — TokenShrink',
  description: 'Free open-source SDK. Advanced hosted compression for $5/month or $36/year. Savings vary by workload.',
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
  { label: 'Web compressor and open-source SDK', included: true },
  { label: 'API keys and usage dashboard', included: true },
  { label: '500 full-compression API calls/month when signed in', included: true },
  { label: 'Basic compression after the monthly allowance', included: true },
  { label: 'No sign-up required to try', included: true },
];
const ADVANCED_FEATURES = [
  { label: 'Everything in Free', included: true },
  { label: 'Full hosted compression beyond 500 calls/month', included: true },
  { label: 'Usage history and estimated savings dashboard', included: true },
  { label: '30 requests/minute; 100,000 words/request', included: true },
  { label: 'Cancel through your billing portal', included: true },
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
              Use the SDK free. Upgrade for continued full hosted compression.
            </p>
          </div>

          <SavingsCalculator />

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
                  Hosted Advanced
                </span>
              </div>

              <div>
                <div className="text-xs font-medium text-savings mb-3 uppercase tracking-wider">Advanced</div>
                <h3 className="text-lg font-semibold text-text">TokenShrink Advanced</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-text">$5</span>
                  <span className="text-sm text-text-muted">/ month</span>
                </div>
                <p className="text-sm font-medium text-savings mt-2">$36/year — save 40% <span className="text-xs font-normal text-text-secondary">($3/mo)</span></p>
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
                  a: 'Advanced keeps full hosted compression available after 500 signed-in API calls per month. The SDK remains free; local codebook experiments are not a paid hosted feature.',
                },
                {
                  q: 'Does compression affect AI response quality?',
                  a: 'It can. Compression rewrites text, so evaluate answer quality on your own tasks. Detected code and quoted literals are left unchanged. Savings are estimates unless you provide the matching tokenizer.',
                },
                {
                  q: 'What AI providers does it work with?',
                  a: 'All of them. OpenAI, Anthropic, Google, Mistral, Llama, Cohere — any LLM that accepts text prompts. Pass the returned text to your provider and evaluate the result.',
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
