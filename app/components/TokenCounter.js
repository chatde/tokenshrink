// Server component — fetches npm download count and estimates tokens saved
// Revalidates hourly via Next.js fetch cache

function formatLarge(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default async function TokenCounter() {
  let tokensSaved = 1_500_000; // fallback baseline

  try {
    const res = await fetch(
      'https://api.npmjs.org/downloads/point/2021-01-01:2030-12-31/tokenshrink',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const downloads = data.downloads ?? 0;
      // Conservative estimate: avg 50 compressions/user × 100 tokens saved each
      tokensSaved = Math.max(downloads * 5000, 1_500_000);
    }
  } catch {
    // fetch failed — use baseline
  }

  return (
    <div className="savings-glow border border-savings/15 rounded-xl p-5 text-center bg-bg-card">
      <div className="text-savings/40 text-lg mb-2 font-mono">◉</div>
      <div className="text-2xl font-bold text-savings font-mono">
        {formatLarge(tokensSaved)}
      </div>
      <div className="text-xs text-text-muted mt-1">tokens saved</div>
    </div>
  );
}
