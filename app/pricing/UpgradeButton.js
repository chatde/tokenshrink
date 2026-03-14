'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UpgradeButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      router.push('/login?next=/pricing');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'advanced' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-8 block w-full py-2.5 rounded-lg text-sm font-medium text-center bg-savings text-bg hover:bg-savings/90 transition-all disabled:opacity-60"
    >
      {loading ? 'Redirecting…' : session ? 'Upgrade to Advanced' : 'Get started'}
    </button>
  );
}
