// Server component — fetches npm download count and estimates tokens saved
// Revalidates hourly via Next.js fetch cache
import AnimatedCount from './AnimatedCount';

export default async function TokenCounter() {
  let tokensSaved = 1_200_000; // fallback if npm API fails (~240 downloads × 5000)

  try {
    const res = await fetch(
      'https://api.npmjs.org/downloads/point/2021-01-01:2030-12-31/tokenshrink',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const downloads = data.downloads ?? 0;
      tokensSaved = downloads * 5000;
    }
  } catch {
    // fetch failed — use baseline
  }

  return (
    <div className="savings-glow border border-savings/15 rounded-xl p-5 text-center bg-bg-card">
      <div className="text-savings/40 text-lg mb-2 font-mono">◉</div>
      <div className="text-2xl font-bold text-savings font-mono">
        <AnimatedCount initial={tokensSaved} />
      </div>
      <div className="text-xs text-text-muted mt-1">tokens saved</div>
    </div>
  );
}
