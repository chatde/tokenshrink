import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TokenShrink — Same AI, Fewer Tokens';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Shrinkray triangle */}
        <svg width="80" height="80" viewBox="0 0 32 32">
          <path d="M8 22 L16 8 L24 22 Z" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round"/>
          <line x1="12" y1="18" x2="20" y2="18" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="14" x2="18" y2="14" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        </svg>

        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 800,
            color: '#fafafa',
            marginTop: 24,
            letterSpacing: '-0.02em',
          }}
        >
          Token
          <span style={{ color: '#10b981' }}>Shrink</span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#a1a1aa',
            marginTop: 16,
          }}
        >
          Same AI, fewer tokens. Free forever.
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            marginTop: 40,
            fontSize: 20,
            color: '#71717a',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>~10%</span> token savings
          </span>
          <span style={{ color: '#3f3f46' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>&lt;1ms</span> processing
          </span>
          <span style={{ color: '#3f3f46' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>0</span> dependencies
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontSize: 18,
            color: '#52525b',
            background: '#18181b',
            padding: '8px 20px',
            borderRadius: 8,
            border: '1px solid #27272a',
          }}
        >
          npm install tokenshrink
        </div>
      </div>
    ),
    { ...size }
  );
}
