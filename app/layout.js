import './globals.css';
import Providers from './components/Providers';

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
