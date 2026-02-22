'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-text">
            Token<span className="text-savings">Shrink</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/providers"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Providers
          </Link>
          <Link
            href="/docs"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Docs
          </Link>

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
