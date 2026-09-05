import Navbar from '../components/Navbar';
import Link from 'next/link';
import FadeIn from '@/components/fade-in';

export const metadata = {
  title: 'Changelog — TokenShrink',
  description: 'TokenShrink version history. See what\'s new in each release.',
};

const releases = [
  {
    version: 'Web reliability update', date: 'September 2026', tag: 'Current',
    highlights: [
      'Quoted literals and detected code are conservatively left unchanged',
      'Savings checks count the entire returned payload',
      'Homepage reports npm downloads rather than estimated global savings',
      'Analytics validation and subscription synchronization hardened',
      'See npm for the currently published SDK version',
    ],
  },
  {
    version: 'SDK 2.0.0', date: 'February 2026',
    highlights: ['Published token-aware compression SDK', 'Custom tokenizer support'],
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
