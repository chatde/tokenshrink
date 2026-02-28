import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
