import Navbar from '../components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'AI Provider Directory — TokenShrink',
  description: 'Compare AI API providers, pricing, and models. TokenShrink works with every LLM provider — compress your prompts and save on all of them.',
  keywords: ['AI API pricing', 'LLM comparison', 'OpenAI pricing', 'Anthropic pricing', 'Gemini pricing', 'AI token costs'],
};

const providers = [
  {
    name: 'OpenAI',
    tagline: 'The pioneer in large language models',
    models: [
      { name: 'GPT-4o', input: '$2.50', output: '$10.00' },
      { name: 'GPT-4o mini', input: '$0.15', output: '$0.60' },
      { name: 'o1', input: '$15.00', output: '$60.00' },
      { name: 'o3-mini', input: '$1.10', output: '$4.40' },
    ],
    free: 'Free tier with usage limits for new accounts',
    link: 'https://openai.com/api/pricing/',
    color: 'text-green-400',
    borderColor: 'border-green-400/20',
    bgColor: 'bg-green-400/5',
  },
  {
    name: 'Anthropic',
    tagline: 'Safety-focused AI with Claude models',
    models: [
      { name: 'Claude Opus 4', input: '$15.00', output: '$75.00' },
      { name: 'Claude Sonnet 4', input: '$3.00', output: '$15.00' },
      { name: 'Claude Haiku 3.5', input: '$0.80', output: '$4.00' },
    ],
    free: 'Free tier via claude.ai (limited usage)',
    link: 'https://www.anthropic.com/pricing',
    color: 'text-orange-400',
    borderColor: 'border-orange-400/20',
    bgColor: 'bg-orange-400/5',
  },
  {
    name: 'Google',
    tagline: 'Gemini models with massive context windows',
    models: [
      { name: 'Gemini 2.5 Flash', input: '$0.15', output: '$0.60' },
      { name: 'Gemini 2.5 Pro', input: '$1.25', output: '$10.00' },
      { name: 'Gemini 2.0 Flash', input: '$0.10', output: '$0.40' },
    ],
    free: 'Generous free tier via Google AI Studio',
    link: 'https://ai.google.dev/pricing',
    color: 'text-blue-400',
    borderColor: 'border-blue-400/20',
    bgColor: 'bg-blue-400/5',
  },
  {
    name: 'Mistral',
    tagline: 'European AI with efficient open-weight models',
    models: [
      { name: 'Mistral Large', input: '$2.00', output: '$6.00' },
      { name: 'Mistral Small', input: '$0.10', output: '$0.30' },
      { name: 'Codestral', input: '$0.30', output: '$0.90' },
    ],
    free: 'Free tier for experimentation',
    link: 'https://mistral.ai/products/pricing/',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/20',
    bgColor: 'bg-purple-400/5',
  },
  {
    name: 'Meta / Llama',
    tagline: 'Open-source models available via multiple hosts',
    models: [
      { name: 'Llama 3.3 70B', input: '$0.60', output: '$0.60' },
      { name: 'Llama 3.2 8B', input: '$0.05', output: '$0.05' },
      { name: 'Llama 4 Scout', input: '$0.17', output: '$0.17' },
    ],
    free: 'Open weights — self-host for free, or use hosted providers',
    link: 'https://llama.meta.com/',
    color: 'text-sky-400',
    borderColor: 'border-sky-400/20',
    bgColor: 'bg-sky-400/5',
  },
  {
    name: 'Cohere',
    tagline: 'Enterprise-focused AI with RAG specialization',
    models: [
      { name: 'Command R+', input: '$2.50', output: '$10.00' },
      { name: 'Command R', input: '$0.15', output: '$0.60' },
    ],
    free: 'Free trial tier for developers',
    link: 'https://cohere.com/pricing',
    color: 'text-rose-400',
    borderColor: 'border-rose-400/20',
    bgColor: 'bg-rose-400/5',
  },
  {
    name: 'Groq',
    tagline: 'Ultra-fast inference with custom LPU hardware',
    models: [
      { name: 'Llama 3.3 70B', input: '$0.59', output: '$0.79' },
      { name: 'Mixtral 8x7B', input: '$0.24', output: '$0.24' },
      { name: 'Gemma 2 9B', input: '$0.20', output: '$0.20' },
    ],
    free: 'Free tier with rate limits',
    link: 'https://groq.com/pricing/',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/20',
    bgColor: 'bg-amber-400/5',
  },
  {
    name: 'Cerebras',
    tagline: 'Wafer-scale inference for blazing speed',
    models: [
      { name: 'Llama 3.3 70B', input: '$0.60', output: '$0.60' },
      { name: 'Llama 3.1 8B', input: '$0.10', output: '$0.10' },
    ],
    free: 'Free tier available for developers',
    link: 'https://cerebras.ai/',
    color: 'text-teal-400',
    borderColor: 'border-teal-400/20',
    bgColor: 'bg-teal-400/5',
  },
];

export default function ProvidersPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-text">
              AI Provider <span className="text-savings">Directory</span>
            </h1>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
              Compare pricing across major AI API providers. TokenShrink compresses your prompts before you send them — saving you money with every provider listed here.
            </p>
          </div>

          {/* How savings work callout */}
          <div className="mb-12 p-5 rounded-xl border border-savings/20 bg-savings/5 text-center">
            <p className="text-sm text-text-secondary">
              <strong className="text-savings">How it works:</strong> Compress your prompt with TokenShrink, then paste the compressed version into your provider of choice. Fewer tokens in = lower cost. It works with every provider below.
            </p>
          </div>

          {/* Provider cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className={`rounded-xl border ${provider.borderColor} ${provider.bgColor} overflow-hidden`}
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-bold ${provider.color}`}>
                      {provider.name}
                    </h2>
                    <span className="text-[10px] uppercase tracking-wider text-savings/70 bg-savings/10 px-2 py-0.5 rounded-full font-medium">
                      Works with TokenShrink
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{provider.tagline}</p>
                </div>

                {/* Pricing table */}
                <div className="px-5 py-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-muted">
                        <th className="text-left py-1.5 font-medium">Model</th>
                        <th className="text-right py-1.5 font-medium">Input / 1M</th>
                        <th className="text-right py-1.5 font-medium">Output / 1M</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      {provider.models.map((model) => (
                        <tr key={model.name} className="border-t border-border/30">
                          <td className="py-1.5 text-text font-medium">{model.name}</td>
                          <td className="py-1.5 text-right">{model.input}</td>
                          <td className="py-1.5 text-right">{model.output}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">{provider.free}</span>
                  <a
                    href={provider.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-medium ${provider.color} hover:underline`}
                  >
                    View pricing &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mt-10 text-center text-xs text-text-muted max-w-2xl mx-auto">
            TokenShrink is not affiliated with any AI provider listed above. Pricing shown is approximate and may be outdated — always check the provider&rsquo;s official pricing page for current rates. All trademarks belong to their respective owners.
          </p>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">
              Ready to save on all of them?
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
            >
              Try TokenShrink free
            </Link>
          </div>
        </section>

        <footer className="px-6 py-8 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-text-muted">
              Token<span className="text-savings">Shrink</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
              <Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link>
              <Link href="/providers" className="text-text transition-colors">Providers</Link>
              <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
