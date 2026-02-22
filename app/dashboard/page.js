'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const fetchKeys = useCallback(() => {
    setKeysLoading(true);
    fetch('/api/keys')
      .then((r) => r.json())
      .then((data) => setKeys(data.keys || []))
      .catch(console.error)
      .finally(() => setKeysLoading(false));
  }, []);

  useEffect(() => {
    if (session) fetchKeys();
  }, [session, fetchKeys]);

  const createKey = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel || 'Default' }),
      });
      const data = await res.json();
      if (data.key) {
        setCreatedKey(data.key);
        setNewKeyLabel('');
        fetchKeys();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id) => {
    try {
      await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  const planName = (session.user.plan || 'free').charAt(0).toUpperCase() + (session.user.plan || 'free').slice(1);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            {session.user.name || session.user.email} &middot; {planName} plan
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Words compressed', value: wordsUsed.toLocaleString() },
          { label: 'Compressions', value: compressionCount.toLocaleString() },
          {
            label: 'Tokens saved',
            value: (usage?.tokensSaved || 0).toLocaleString(),
            highlight: true,
          },
          {
            label: 'Dollars saved',
            value: `$${(usage?.dollarsSaved || 0).toFixed(2)}`,
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

      {/* Empty state for new users */}
      {compressionCount === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center mb-8">
          <div className="text-4xl mb-3">&#x1F680;</div>
          <h3 className="text-lg font-semibold text-text mb-2">No compressions yet</h3>
          <p className="text-sm text-text-muted mb-4">
            Try compressing your first prompt to see how many tokens you can save.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Compress a prompt
          </a>
        </div>
      ) : (
        /* Recent compressions */
        usage?.recentCompressions?.length > 0 && (
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden mb-8">
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
        )
      )}

      {/* API Keys */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text">API Keys</h3>
        </div>

        <div className="p-5">
          {/* Created key banner */}
          {createdKey && (
            <div className="bg-green-950/30 border border-green-800/50 rounded-lg p-4 mb-4">
              <p className="text-xs text-green-400 font-medium mb-2">
                Save this key — you won&apos;t see it again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-green-300 bg-black/30 px-3 py-1.5 rounded font-mono break-all">
                  {createdKey}
                </code>
                <button
                  onClick={copyKey}
                  className="px-3 py-1.5 text-xs bg-green-800/50 text-green-300 rounded hover:bg-green-800/70 transition-colors shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Create key */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Key label (optional)"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={createKey}
              disabled={creating}
              className="px-4 py-1.5 text-sm bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create key'}
            </button>
          </div>

          {/* Keys table */}
          {keysLoading ? (
            <p className="text-sm text-text-muted">Loading keys...</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-text-muted">
              No API keys yet. Create one to use the SDK or API.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted text-xs">
                    <th className="pb-2 pr-4">Prefix</th>
                    <th className="pb-2 pr-4">Label</th>
                    <th className="pb-2 pr-4">Last used</th>
                    <th className="pb-2 pr-4">Created</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td className="py-2 pr-4 font-mono text-text">{k.keyPrefix}...</td>
                      <td className="py-2 pr-4 text-text-secondary">{k.label}</td>
                      <td className="py-2 pr-4 text-text-muted">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-2 pr-4 text-text-muted">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => revokeKey(k.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
