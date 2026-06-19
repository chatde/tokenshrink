import Navbar from '../components/Navbar';
import Link from 'next/link';
import FadeIn from '@/components/fade-in';

export const metadata = {
  title: 'Changelog — TokenShrink',
  description: 'TokenShrink version history. See what\'s new in each release.',
};

const releases = [
  {
    version: 'v3.0',
    date: 'June 2026',
    tag: 'Current',
    highlights: [
      'Huffman frequency compression — up to 28% token savings',
      '51 tests passing with zero meaning loss',
      'Advanced tier with Stripe billing',
      'Savings calculator on pricing page',
      'Security headers and @vercel/kv rate limiting',
      'API error handling hardening across all routes',
    ],
  },
  {
    version: 'v2.1',
    date: 'April 2026',
    highlights: [
      'New domain rotors: SQL, TypeScript, Docker, Tailwind CSS',
      'Session vocabulary auto-generation on session start',
      'Auto-detect Docker projects via filesystem signals',
      'Prisma, Drizzle, TypeORM database ORM detection',
    ],
  },
  {
    version: 'v2.0',
    date: 'March 2026',
    highlights: [
      'Token-aware compression — real token counts via cl100k_base lookup',
      'SDK rewrite with drop-in npm package',
      'Custom tokenizer support (bring your own gpt-tokenizer)',
      'Domain rotors: React, Node.js, Python, Supabase auto-detection',
      'Rosetta Protocol — negotiated session vocabulary',
      'Sub-agent vocab inheritance for Claude Code',
      'Compression strategies engine with phrase + domain + session layers',
    ],
  },
  {
    version: 'v1.0',
    date: 'February 2026',
    highlights: [
      'Initial release — phrase compression engine',
      'Web UI with live compressor widget',
      'REST API with API key authentication',
      'Claude Code hook integration',
      'Basic usage dashboard',
      'Open source on GitHub',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[88px] px-6">
        <div className="max-w-3xl mx-auto py-12">
          <FadeIn>
            <h1 className="text-3xl font-bold text-text mb-2">Changelog</h1>
            <p className="text-text-secondary mb-10">
              What&apos;s new in TokenShrink. Every release is backwards-compatible.
            </p>
          </FadeIn>

          <div className="space-y-8">
            {releases.map((release, i) => (
              <FadeIn key={release.version} delay={i * 100}>
                <div className="bg-bg-card border border-border rounded-xl p-6 relative">
                  {release.tag && (
                    <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-savings/10 text-savings border border-savings/20">
                      {release.tag}
                    </span>
                  )}
                  <div className="flex items-baseline gap-3 mb-4">
                    <h2 className="text-xl font-bold text-text font-mono">{release.version}</h2>
                    <span className="text-xs text-text-muted">{release.date}</span>
                  </div>
                  <ul className="space-y-2">
                    {release.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-savings mt-1 shrink-0">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="text-center mt-12">
              <p className="text-sm text-text-muted mb-4">
                View the full commit history on GitHub
              </p>
              <a
                href="https://github.com/chatde/tokenshrink"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
              >
                GitHub repo ↗
              </a>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
