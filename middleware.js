import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/app/lib/rate-limit';

/** Return the per-IP rate limit for a given pathname. */
function getLimitForPath(pathname) {
  if (pathname.startsWith('/api/compress') || pathname.startsWith('/api/decompress')) {
    return 60;
  }
  if (pathname.startsWith('/api/analytics')) {
    return 120;
  }
  // Dashboard / auth / billing / keys — tighter limit
  return 30;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Never rate-limit the Stripe webhook — it uses signature verification
  if (pathname.startsWith('/api/billing/webhook')) {
    return NextResponse.next();
  }

  // Never rate-limit NextAuth routes — they handle their own CSRF/session logic
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown';

  const limit = getLimitForPath(pathname);
  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`;
  const { allowed, remaining, retryAfter } = await checkRateLimit(key, { limit, windowMs: 60_000 });

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // Attach rate-limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
