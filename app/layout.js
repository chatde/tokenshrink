import './globals.css';
import Providers from './components/Providers';

export const metadata = {
  title: 'TokenShrink — Save 60-80% on AI Token Costs',
  description: 'Compress your AI prompts and save money on every API call. Works with OpenAI, Anthropic, Google, and more.',
  keywords: ['AI', 'tokens', 'compression', 'LLM', 'OpenAI', 'cost savings', 'prompt optimization'],
  openGraph: {
    title: 'TokenShrink — Save 60-80% on AI Token Costs',
    description: 'Compress your AI prompts and save money on every API call.',
    url: 'https://tokenshrink.com',
    siteName: 'TokenShrink',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TokenShrink — Save 60-80% on AI Token Costs',
    description: 'Compress your AI prompts and save money on every API call.',
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
