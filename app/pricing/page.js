import Navbar from '../components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing — TokenShrink',
  description: 'TokenShrink is free forever. No limits, no credit card, no catch.',
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <section className="px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-text">Free forever</h1>
            <p className="text-text-secondary mt-2">
              No paid plans. No credit card. No limits. Just compress.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-xl border border-savings/30 bg-savings/5 p-8">
            <div className="text-center">
              <div className="text-xs font-medium text-savings mb-3">The only plan</div>
              <h3 className="text-lg font-semibold text-text">Free</h3>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-text">$0</span>
                <span className="text-sm text-text-muted">forever</span>
              </div>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                'Unlimited compressions',
                'Web compressor',
                'API access + SDK',
                'All LLM providers supported',
                'Usage dashboard',
                'No sign-up required to try',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-savings mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="mt-8 block w-full py-2.5 rounded-lg text-sm font-medium text-center bg-savings text-bg hover:bg-savings/90 transition-all"
            >
              Get started
            </Link>
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
                  q: 'Is it really free?',
                  a: 'Yes. No paid plans, no credit card, no hidden fees. TokenShrink is free for everyone.',
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
                  q: 'Why is it free?',
                  a: 'We believe prompt compression should be accessible to everyone. We may add optional premium features in the future, but the core compressor will always be free.',
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
