'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UpgradeButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState('monthly');

  const handleUpgrade = async () => {
    if (!session) {
      router.push('/login?next=/pricing');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const plan = billing === 'annual' ? 'advanced_annual' : 'advanced';
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout is unavailable. Please try again.');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-3">
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {/* Billing toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
        <button
          onClick={() => setBilling('annual')}
          className={`flex-1 py-1.5 transition-colors ${
            billing === 'annual'
              ? 'bg-savings text-bg'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          Annual · $36/yr
          <span className="ml-1 opacity-75">save 40%</span>
        </button>
        <button
          onClick={() => setBilling('monthly')}
          className={`flex-1 py-1.5 transition-colors ${
            billing === 'monthly'
              ? 'bg-savings text-bg'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          Monthly · $5/mo
        </button>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="block w-full py-2.5 rounded-lg text-sm font-medium text-center bg-savings text-bg hover:bg-savings/90 transition-all disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : session ? 'Upgrade to Advanced' : 'Get started'}
      </button>
    </div>
  );
}
