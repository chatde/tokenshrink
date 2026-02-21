import Navbar from '../components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — TokenShrink',
  description: 'TokenShrink Privacy Policy. Learn how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold text-text mb-2">Privacy Policy</h1>
          <p className="text-sm text-text-muted mb-10">Last updated: February 19, 2026</p>

          <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">1. Overview</h2>
              <p>
                TokenShrink (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy. This policy explains what data we collect, how we use it, and your rights regarding that data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">2. What We Collect</h2>

              <h3 className="text-base font-medium text-text mt-4 mb-2">Account Information</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-text">Email address</strong> — from your OAuth provider (GitHub or Google), used for account identification and billing communications</li>
                <li><strong className="text-text">Display name</strong> — from your OAuth provider, shown in your dashboard</li>
                <li><strong className="text-text">Profile image URL</strong> — from your OAuth provider, displayed in the navbar</li>
              </ul>

              <h3 className="text-base font-medium text-text mt-4 mb-2">Usage Statistics</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Word counts (original and compressed)</li>
                <li>Compression ratios and strategy used</li>
                <li>Token savings and estimated dollar savings</li>
                <li>Number of compressions per billing period</li>
              </ul>

              <h3 className="text-base font-medium text-text mt-4 mb-2">Payment Information</h3>
              <p>
                Payment processing is handled entirely by Stripe. We store only your Stripe customer ID — we never see or store your credit card number, expiration date, or CVC.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">3. What We Do NOT Collect</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-text">Prompt text</strong> — your original text is never stored, logged, or transmitted to third parties</li>
                <li><strong className="text-text">Compressed output</strong> — the compressed result is never stored on our servers</li>
                <li><strong className="text-text">Third-party API keys</strong> — we do not accept or store API keys from OpenAI, Anthropic, Google, or any other AI provider</li>
                <li><strong className="text-text">Browsing history</strong> — we do not track pages you visit outside of TokenShrink</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">4. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>To provide and operate the compression service</li>
                <li>To track your usage against your plan&rsquo;s word quota</li>
                <li>To display your savings history in the dashboard</li>
                <li>To process payments and manage subscriptions via Stripe</li>
                <li>To send transactional emails (billing confirmations, quota warnings)</li>
              </ul>
              <p className="mt-2">We do not sell your data. We do not use your data for advertising. We do not share your data with AI model providers.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">5. Cookies</h2>
              <p>
                We use only essential cookies required for authentication (session cookies via NextAuth.js). We do not use tracking cookies, analytics pixels, or advertising identifiers. No third-party cookies are set.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">6. Third-Party Services</h2>
              <div className="mt-2 space-y-2">
                <p><strong className="text-text">Stripe</strong> — payment processing. See <a href="https://stripe.com/privacy" className="text-savings hover:underline" target="_blank" rel="noopener noreferrer">Stripe&rsquo;s Privacy Policy</a>.</p>
                <p><strong className="text-text">Neon</strong> — database hosting (PostgreSQL). Stores account info and usage statistics only.</p>
                <p><strong className="text-text">Vercel</strong> — application hosting. See <a href="https://vercel.com/legal/privacy-policy" className="text-savings hover:underline" target="_blank" rel="noopener noreferrer">Vercel&rsquo;s Privacy Policy</a>.</p>
                <p><strong className="text-text">GitHub / Google</strong> — OAuth authentication only. We receive your public profile information during sign-in.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">7. Data Retention</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-text">Usage statistics</strong> — retained for the duration of your account</li>
                <li><strong className="text-text">Account data</strong> — retained until you request deletion</li>
                <li><strong className="text-text">API key hashes</strong> — retained until revoked; revoked keys are soft-deleted</li>
                <li><strong className="text-text">Prompt text</strong> — never stored (processed in-memory only)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">8. Your Rights (GDPR / CCPA)</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-text">Access</strong> — request a copy of all data we hold about you</li>
                <li><strong className="text-text">Correction</strong> — request correction of inaccurate data</li>
                <li><strong className="text-text">Deletion</strong> — request deletion of your account and all associated data</li>
                <li><strong className="text-text">Export</strong> — request a machine-readable export of your data</li>
                <li><strong className="text-text">Objection</strong> — object to processing of your data</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:privacy@tokenshrink.com" className="text-savings hover:underline">privacy@tokenshrink.com</a>.
                We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">9. Security</h2>
              <p>
                We protect your data using industry-standard measures: encrypted connections (TLS), hashed API keys (SHA-256), OAuth authentication (no passwords stored), and access controls on our database. No system is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">10. Children</h2>
              <p>
                TokenShrink is not directed at children under 13. We do not knowingly collect data from children under 13. If you believe we have collected such data, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">11. Changes</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Material changes will be communicated via email.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">12. Contact</h2>
              <p>
                Questions about privacy? Contact us at{' '}
                <a href="mailto:privacy@tokenshrink.com" className="text-savings hover:underline">privacy@tokenshrink.com</a>.
              </p>
            </section>
          </div>
        </article>

        <footer className="px-6 py-8 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-text-muted">
              Token<span className="text-savings">Shrink</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
              <Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link>
              <Link href="/providers" className="hover:text-text transition-colors">Providers</Link>
              <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
              <Link href="/privacy" className="text-text transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
