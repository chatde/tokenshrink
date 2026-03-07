import { Space_Mono, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import { Analytics } from '@vercel/analytics/next';

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'TokenShrink — Same AI, Fewer Tokens. Ship Smarter.',
  description: 'Your prompts are verbose. Your models don\'t need them to be. TokenShrink compresses prompts — same results, fewer tokens. Free forever.',
  keywords: ['AI', 'tokens', 'compression', 'LLM', 'OpenAI', 'cost savings', 'prompt optimization'],
  openGraph: {
    title: 'TokenShrink — Same AI, Fewer Tokens. Ship Smarter.',
    description: 'Your prompts are verbose. Your models don\'t need them to be. Compress prompts — same results, fewer tokens. Free forever.',
    url: 'https://tokenshrink.com',
    siteName: 'TokenShrink',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TokenShrink — Same AI, Fewer Tokens. Ship Smarter.',
    description: 'Your prompts are verbose. Your models don\'t need them to be. Compress prompts — same results, fewer tokens. Free forever.',
  },
  alternates: {
    canonical: 'https://tokenshrink.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "TokenShrink",
              "url": "https://tokenshrink.com",
              "applicationCategory": "DeveloperApplication",
              "description": "Compress AI prompts — same results, fewer tokens. Free forever.",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
              "operatingSystem": "Web"
            })
          }}
        />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
