import Navbar from '../components/Navbar';

export const metadata = {
  title: 'API Documentation — TokenShrink',
  description: 'TokenShrink API and SDK documentation. Compress your AI prompts programmatically.',
};

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 px-6">
        <div className="max-w-3xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-text mb-2">API Documentation</h1>
          <p className="text-text-secondary mb-10">
            Compress prompts programmatically via our REST API or npm SDK.
          </p>

          {/* Quick start */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Quick start</h2>
            <div className="space-y-4">
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">1. Get your API key</h3>
                <p className="text-sm text-text-secondary">
                  Sign up (free), then generate an API key from your{' '}
                  <a href="/dashboard" className="text-savings hover:underline">dashboard</a>.
                </p>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">2. Compress via API</h3>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://tokenshrink.com/api/compress \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ts_live_your_key_here" \\
  -d '{
    "text": "Your long prompt text here...",
    "domain": "auto"
  }'`}
                </pre>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-savings mb-3">3. Or use the SDK</h3>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto">
{`npm install tokenshrink`}
                </pre>
                <pre className="text-xs font-mono text-text-secondary bg-bg p-4 rounded-lg overflow-x-auto mt-3">
{`import { TokenShrink } from 'tokenshrink';

const ts = new TokenShrink({ apiKey: 'ts_live_...' });

// Compress a prompt
const result = await ts.compress('Your long prompt...');
console.log(result.compressed);
console.log(result.stats.tokensSaved);

// Or wrap your OpenAI client
import OpenAI from 'openai';
const openai = ts.wrapOpenAI(new OpenAI());
// All prompts are now auto-compressed!`}
                </pre>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">API Reference</h2>

            <div className="space-y-6">
              {/* POST /api/compress */}
              <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-savings bg-savings/10 px-2 py-0.5 rounded">POST</span>
                  <span className="text-sm font-mono text-text">/api/compress</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-text-muted mb-2">Headers</h4>
                    <div className="text-xs font-mono text-text-secondary space-y-1">
                      <div><span className="text-text">Content-Type:</span> application/json</div>
                      <div><span className="text-text">x-api-key:</span> ts_live_... <span className="text-text-muted">(optional for anonymous, required for API usage)</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-text-muted mb-2">Request body</h4>
                    <pre className="text-xs font-mono text-text-secondary bg-bg p-3 rounded-lg">
{`{
  "text": "string (required) — the text to compress",
  "domain": "string (optional) — auto|code|medical|legal|business"
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-text-muted mb-2">Response</h4>
                    <pre className="text-xs font-mono text-text-secondary bg-bg p-3 rounded-lg">
{`{
  "compressed": "string — full compressed text with Rosetta header",
  "rosetta": "string — just the decoder header",
  "stats": {
    "originalWords": 150,
    "compressedWords": 42,
    "rosettaWords": 18,
    "totalCompressedWords": 60,
    "ratio": 2.5,
    "tokensSaved": 117,
    "dollarsSaved": 0.06,
    "strategy": "domain",
    "domain": "code"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* GET /api/usage */}
              <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">GET</span>
                  <span className="text-sm font-mono text-text">/api/usage</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-text-secondary">
                    Returns your current usage stats, monthly history, and recent compressions.
                    Requires authentication (session or API key).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Rate limits */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">Rate limits</h2>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Requests per minute</span>
                  <span className="text-text font-medium">10</span>
                </div>
                <div className="flex justify-between">
                  <span>Words per request</span>
                  <span className="text-text font-medium">100,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly limit</span>
                  <span className="text-text font-medium">Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-savings font-medium">Free forever</span>
                </div>
              </div>
            </div>
          </section>

          {/* Domains */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Compression domains</h2>
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-text-secondary mb-4">
                Set <code className="text-text bg-bg px-1.5 py-0.5 rounded text-xs">domain</code> to
                optimize compression for specific content types. Default is <code className="text-text bg-bg px-1.5 py-0.5 rounded text-xs">auto</code>.
              </p>
              <div className="space-y-2 text-sm">
                {[
                  { domain: 'auto', desc: 'Automatically detects the best strategy' },
                  { domain: 'code', desc: 'Programming and technical documentation' },
                  { domain: 'medical', desc: 'Medical records, clinical notes' },
                  { domain: 'legal', desc: 'Contracts, legal documents' },
                  { domain: 'business', desc: 'Business communications, reports' },
                ].map(({ domain, desc }) => (
                  <div key={domain} className="flex items-start gap-3">
                    <code className="text-xs font-mono text-savings bg-savings/10 px-2 py-0.5 rounded shrink-0">
                      {domain}
                    </code>
                    <span className="text-text-secondary">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
