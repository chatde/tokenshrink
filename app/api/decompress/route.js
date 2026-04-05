import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';

export async function POST(request) {
  try {
    // Rate limit by IP — 60 requests per minute
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const { allowed, retryAfter } = await checkRateLimit(`decompress:${ip}`, { limit: 60, windowMs: 60_000 });
    if (!allowed) {
      return rateLimitResponse(retryAfter);
    }

    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Extract Rosetta Stone decode block
    const decodeMatch = text.match(/\[DECODE\]([\s\S]*?)\[\/DECODE\]/);
    if (!decodeMatch) {
      return NextResponse.json({
        decompressed: text,
        note: 'No Rosetta Stone decoder found — text returned as-is',
      });
    }

    const decodeBlock = decodeMatch[1].trim();
    const body = text.replace(/\[DECODE\][\s\S]*?\[\/DECODE\]\s*/, '').trim();

    // Parse replacement rules
    const replacements = {};
    for (const line of decodeBlock.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Pattern codes: P1="some phrase"
      const patternMatch = trimmed.match(/^(P\d+)="(.+)"$/);
      if (patternMatch) {
        replacements[patternMatch[1]] = patternMatch[2];
        continue;
      }

      // Abbreviations: abbr=fullword
      const abbrMatch = trimmed.match(/^(.+?)=(.+)$/);
      if (abbrMatch) {
        replacements[abbrMatch[1]] = abbrMatch[2];
      }
    }

    // Apply replacements (longest first to avoid partial matches)
    let decompressed = body;
    const sortedEntries = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length);

    for (const [code, original] of sortedEntries) {
      const regex = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      decompressed = decompressed.replace(regex, original);
    }

    return NextResponse.json({ decompressed });
  } catch (error) {
    console.error('Decompress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
