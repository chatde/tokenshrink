'use client';

import Link from 'next/link';

export default function PricingTable() {
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-xl border border-savings/30 bg-savings/5 p-8 text-center">
        <div className="text-xs font-medium text-savings mb-3">The only plan</div>
        <h3 className="text-lg font-semibold text-text">Free</h3>

        <div className="mt-3 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-text">$0</span>
          <span className="text-sm text-text-muted">forever</span>
        </div>

        <ul className="mt-6 space-y-2.5 text-left">
          {[
            'Unlimited compressions',
            'Web compressor',
            'API access + SDK',
            'All LLM providers',
            'Usage dashboard',
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 text-savings mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/login"
          className="mt-6 block w-full py-2.5 rounded-lg text-sm font-medium bg-savings text-bg hover:bg-savings/90 transition-all"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
