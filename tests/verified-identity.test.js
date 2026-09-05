import { it, expect, vi } from 'vitest';
import { verifiedIdentity } from '../app/lib/verified-identity.js';
const user = { email: 'owner@example.test' };
it('requires a verified Google email before account linking', async () => {
  expect(await verifiedIdentity({ user, account: { provider: 'google' }, profile: { email_verified: true } })).toBe(true);
  for (const value of [false, undefined, 'true']) expect(await verifiedIdentity({ user, account: { provider: 'google' }, profile: { email_verified: value } })).toBe(false);
});
it('requires GitHub to verify the exact email being linked', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ email: user.email, verified: false }, { email: 'other@example.test', verified: true }] });
  const identity = { user, account: { provider: 'github', access_token: 'test-only' } };
  expect(await verifiedIdentity(identity, fetcher)).toBe(false);
  fetcher.mockResolvedValue({ ok: true, json: async () => [{ email: 'OWNER@example.test', verified: true }] });
  expect(await verifiedIdentity(identity, fetcher)).toBe(true);
});
it('fails closed when GitHub cannot verify the address', async () => {
  expect(await verifiedIdentity({ user, account: { provider: 'github', access_token: 'test-only' } }, vi.fn().mockRejectedValue(new Error('offline')))).toBe(false);
  expect(await verifiedIdentity({ user, account: { provider: 'unknown' } })).toBe(false);
});
