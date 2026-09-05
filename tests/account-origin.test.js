import { it, expect, vi } from 'vitest';
const m = vi.hoisted(() => ({ auth: vi.fn(), rate: vi.fn(), stripe: vi.fn() }));
vi.mock('@/app/lib/auth', () => ({ auth: m.auth }));
vi.mock('@/app/lib/db', () => ({ db: {} }));
vi.mock('@/app/lib/rate-limit', () => ({ checkRateLimit: m.rate, rateLimitResponse: vi.fn() }));
vi.mock('@/app/lib/stripe', () => ({ getStripe: m.stripe }));
import { POST as createKey, DELETE as revokeKey } from '../app/api/keys/route.js';
import { POST as checkout } from '../app/api/billing/checkout/route.js';
import { POST as portal } from '../app/api/billing/portal/route.js';

it.each([createKey, revokeKey, checkout, portal])('blocks cross-origin account mutations before side effects', async handler => {
  const response = await handler(new Request('https://tokenshrink.com/api/keys', { method: 'POST', headers: { origin: 'https://attacker.test' }, body: '{}' }));
  expect(response.status).toBe(403);
  expect(m.auth).not.toHaveBeenCalled();
  expect(m.stripe).not.toHaveBeenCalled();
  expect(m.rate).not.toHaveBeenCalled();
});
