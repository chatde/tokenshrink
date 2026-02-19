'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgraded, setShowUpgraded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgraded(true);
      setTimeout(() => setShowUpgraded(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session) {
      fetch('/api/usage')
        .then((r) => r.json())
        .then(setUsage)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleManageBilling = async () => {
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-text-muted">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  const plan = usage?.plan || 'free';
  const wordsUsed = usage?.wordsUsed || 0;
  const wordsLimit = usage?.wordsLimit || 5000;
  const usagePercent = Math.min((wordsUsed / wordsLimit) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto py-12">
      {showUpgraded && (
        <div className="mb-6 p-4 bg-savings/10 border border-savings/20 rounded-lg text-savings text-sm animate-fade-in">
          Welcome to {plan.charAt(0).toUpperCase() + plan.slice(1)}! Your quota has been upgraded.
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            {session.user.name || session.user.email} &middot;{' '}
            <span className="capitalize">{plan}</span> plan
          </p>
        </div>
        {plan !== 'free' && (
          <button
            onClick={handleManageBilling}
            className="text-sm text-text-secondary border border-border px-4 py-2 rounded-lg hover:border-border-hover transition-colors"
          >
            Manage billing
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Words used', value: wordsUsed.toLocaleString(), sub: `of ${wordsLimit.toLocaleString()}` },
          { label: 'Compressions', value: (usage?.compressionCount || 0).toLocaleString() },
          { label: 'Tokens saved', value: (usage?.tokensSaved || 0).toLocaleString() },
          {
            label: 'Money saved',
            value: `$${(usage?.dollarsSaved || 0).toFixed(2)}`,
            highlight: true,
          },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className="bg-bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-text-muted mb-1">{label}</div>
            <div className={`text-xl font-bold ${highlight ? 'text-savings' : 'text-text'}`}>
              {value}
            </div>
            {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text">Monthly usage</span>
          <span className="text-xs text-text-muted">{usage?.currentPeriod}</span>
        </div>
        <div className="h-3 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${usagePercent}%`,
              backgroundColor: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>{wordsUsed.toLocaleString()} words</span>
          <span>{wordsLimit.toLocaleString()} limit</span>
        </div>
      </div>

      {plan === 'free' && (
        <div className="bg-savings/5 border border-savings/20 rounded-xl p-6 mb-8 text-center">
          <h3 className="text-lg font-semibold text-text mb-2">
            Upgrade to Pro for API access
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Get 250,000 words/month, API keys, SDK access, and a full usage dashboard.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-2.5 bg-savings text-bg font-medium rounded-lg hover:bg-savings/90 transition-colors text-sm"
          >
            View plans
          </button>
        </div>
      )}

      {usage?.recentCompressions?.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-text">Recent compressions</h3>
          </div>
          <div className="divide-y divide-border">
            {usage.recentCompressions.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  {c.originalWords} words &rarr; {c.compressedWords} words
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-savings font-medium">{c.ratio}x</span>
                  <span className="text-xs text-text-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 px-6">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto py-20 text-center text-text-muted">
            Loading...
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </main>
    </>
  );
}
