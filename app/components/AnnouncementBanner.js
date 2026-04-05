'use client';

const MESSAGE = [
  '🚀 TokenShrink v3.0 is live',
  '—',
  'Up to 28% token savings',
  '—',
  'Huffman frequency compression',
  '—',
  'Advanced tier now available',
  '—',
  'Works with Claude · Gemini · GPT · Ollama',
  '—',
  'Zero meaning loss — 51 tests passing',
  '—',
].join('   ');

// Duplicate for seamless loop
const TICKER = `${MESSAGE}   ${MESSAGE}`;

export default function AnnouncementBanner() {
  return (
    <div className="announcement-banner">
      <div className="announcement-track">
        <span>{TICKER}</span>
        <span aria-hidden="true">{TICKER}</span>
      </div>
      <style jsx>{`
        .announcement-banner {
          background: #065f46;
          border-bottom: 1px solid #00d17d33;
          height: 32px;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
        }
        .announcement-track {
          display: flex;
          white-space: nowrap;
          animation: ticker 40s linear infinite;
          font-family: var(--font-geist-mono), monospace;
          font-size: 12px;
          color: #00d17d;
          letter-spacing: 0.02em;
          gap: 0;
        }
        .announcement-track span {
          padding-right: 0;
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .announcement-banner:hover .announcement-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
