'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/usage')
        .then((r) => r.json())
        .then(setUsage)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-text-muted">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  const wordsUsed = usage?.wordsUsed || 0;
  const compressionCount = usage?.compressionCount || 0;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            {session.user.name || session.user.email} &middot; Free plan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Words compressed', value: wordsUsed.toLocaleString() },
          { label: 'Compressions', value: compressionCount.toLocaleString() },
          {
            label: 'Tokens saved',
            value: (usage?.tokensSaved || 0).toLocaleString(),
            highlight: true,
          },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="bg-bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-text-muted mb-1">{label}</div>
            <div className={`text-xl font-bold ${highlight ? 'text-savings' : 'text-text'}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

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
