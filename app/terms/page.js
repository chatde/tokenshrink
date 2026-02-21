import Navbar from '../components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — TokenShrink',
  description: 'TokenShrink Terms of Service. Read our terms for using the AI prompt compression service.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold text-text mb-2">Terms of Service</h1>
          <p className="text-sm text-text-muted mb-10">Last updated: February 19, 2026</p>

          <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">1. Service Description</h2>
              <p>
                TokenShrink (&ldquo;Service&rdquo;) is an AI prompt compression tool operated by TokenShrink (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). We compress text to reduce token counts before you send it to your own AI providers. We do not send your text to any third-party AI model, do not store your prompt content, and do not act as a proxy or reseller of any AI service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">2. Prompt Modification Disclosure</h2>
              <p>
                Our Service modifies your text through compression. This includes abbreviating words, removing filler phrases, replacing repeated patterns with short codes, and prepending a decoder header (&ldquo;Rosetta Stone&rdquo;). The compressed output is semantically equivalent but not identical to your original text. You are responsible for verifying that compressed output is suitable for your use case before submitting it to any AI provider.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">3. AI Output Disclaimer</h2>
              <p>
                Compressed prompts may produce slightly different AI outputs compared to the original text. All AI-generated outputs are provided &ldquo;AS IS&rdquo; without warranties of any kind, whether express or implied. We make no guarantees about the accuracy, completeness, or suitability of any AI output generated using compressed text.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">4. No Reliance</h2>
              <p>
                Do not rely on AI outputs generated from compressed prompts for medical, legal, financial, or safety-critical decisions without independent verification by a qualified professional. TokenShrink is a text processing tool, not a source of professional advice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to reverse-engineer, decompile, or disassemble the compression algorithms</li>
                <li>Use automated means to exceed your plan&rsquo;s rate limits or word quotas</li>
                <li>Resell, sublicense, or redistribute the Service without written permission</li>
                <li>Submit content that violates applicable laws or third-party rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">6. Data Handling</h2>
              <p>
                We do <strong className="text-text">not</strong> store your prompt text or compressed output. We record only aggregate usage statistics: word counts, compression ratios, and token savings. See our{' '}
                <Link href="/privacy" className="text-savings hover:underline">Privacy Policy</Link> for full details.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">7. API Keys</h2>
              <p>
                TokenShrink API keys are for authenticating with our compression service only. We do not accept, store, or use API keys from any third-party AI provider (OpenAI, Anthropic, Google, etc.). You are responsible for keeping your TokenShrink API key confidential. Revoke compromised keys immediately via your dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">8. Billing and Subscriptions</h2>
              <p>
                Paid plans are billed monthly through Stripe. You may cancel at any time; access continues until the end of the current billing period. Refunds are not provided for partial months. Word quotas reset at the start of each billing period and do not roll over.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, TokenShrink&rsquo;s total liability for any claims arising from use of the Service is limited to the amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">10. User Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless TokenShrink from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights including AI provider terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">11. Service Availability</h2>
              <p>
                We strive for high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue the Service at any time with reasonable notice. Scheduled maintenance will be announced in advance when possible.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">12. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. Material changes will be communicated via email or in-app notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text mb-3">13. Contact</h2>
              <p>
                Questions about these Terms? Contact us at{' '}
                <a href="mailto:legal@tokenshrink.com" className="text-savings hover:underline">legal@tokenshrink.com</a>.
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
              <Link href="/terms" className="text-text transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
