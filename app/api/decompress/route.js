import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/app/lib/rate-limit';
import { readJsonLimited, RequestError } from '@/app/lib/request-safety';
import { decodeLegacy } from '@/app/lib/decode';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, retryAfter } = await checkRateLimit(`decompress:${ip}`, { limit: 60, windowMs: 60_000 });
    if (!allowed) return rateLimitResponse(retryAfter);
    const { text } = await readJsonLimited(request, 2_000_000);
    return NextResponse.json(decodeLegacy(text), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof RequestError ? error.message : 'Internal server error' },
      { status: error instanceof RequestError ? error.status : 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
