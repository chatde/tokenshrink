// Public npm downloads are installs, not unique people or measured token savings.
export default async function TokenCounter() {
  let downloads = null;
  let period = '';
  try {
    const response = await fetch('https://api.npmjs.org/downloads/point/last-month/tokenshrink', {
      next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      if (Number.isSafeInteger(data.downloads) && data.downloads >= 0) {
        downloads = data.downloads;
        period = `${data.start} – ${data.end}`;
      }
    }
  } catch { /* No invented fallback when the registry is unavailable. */ }
  return (
    <div className="border border-savings/15 rounded-xl p-5 text-center bg-bg-card">
      <div className="text-savings/40 text-lg mb-2 font-mono">◉</div>
      <div className="text-2xl font-bold text-savings font-mono">{downloads === null ? 'Unavailable' : downloads.toLocaleString('en-US')}</div>
      <div className="text-xs text-text-muted mt-1">npm downloads · reported month</div>
      <p className="text-xs text-text-muted mt-1">{period || 'Registry data could not be loaded'}</p>
    </div>
  );
}
