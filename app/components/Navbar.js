'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AnnouncementBanner from './AnnouncementBanner';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <AnnouncementBanner />
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-text">
            Token<span className="text-savings">Shrink</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-6 overflow-x-auto">
          <Link href="/progress" className="text-sm text-text-secondary hover:text-text">Progress</Link>
          <Link href="/feedback" className="text-sm text-text-secondary hover:text-text">Feedback</Link>
          <Link
            href="/providers"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Providers
          </Link>
          <Link
            href="/integrations"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Integrations
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Docs
          </Link>

          <a
            href="https://github.com/chatde/tokenshrink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-text-secondary hover:text-text transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Sign out
              </button>
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-7 h-7 rounded-full border border-border"
                />
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-savings text-bg hover:bg-savings/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
