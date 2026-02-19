import Navbar from '../components/Navbar';
import PricingTable from '../components/PricingTable';
import SavingsCalculator from '../components/SavingsCalculator';

export const metadata = {
  title: 'Pricing — TokenShrink',
  description: 'Simple, transparent pricing. Start free, upgrade when you need more compression.',
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <section className="px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-text">Simple pricing</h1>
            <p className="text-text-secondary mt-2">
              Pay for words processed. No hidden fees. Cancel anytime.
            </p>
          </div>
          <PricingTable />
        </section>

        <section className="px-6 py-16 border-t border-border">
          <SavingsCalculator />
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
                  q: 'What counts as a "word"?',
                  a: 'We count input words only — what you submit for compression. The compressed output and Rosetta Stone decoder don\'t count against your quota.',
                },
                {
                  q: 'Does compression affect AI response quality?',
                  a: 'No. We prepend a tiny decoder header that teaches the LLM our abbreviations. The AI understands the compressed prompt just as well as the original. For prompts under 50 words, we skip compression entirely.',
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
                  q: 'Can I cancel anytime?',
                  a: 'Yes. Cancel instantly from the dashboard. You keep access until the end of your billing period.',
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
