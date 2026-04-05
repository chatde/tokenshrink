import { describe, it, expect } from 'vitest';
import { PLANS, getPlan, getCurrentPeriod } from '../app/lib/billing.js';

describe('Billing plans configuration', () => {
  it('has exactly free and advanced plans', () => {
    expect(Object.keys(PLANS)).toEqual(['free', 'advanced']);
  });

  it('free plan has correct properties', () => {
    const free = PLANS.free;
    expect(free.name).toBe('Free');
    expect(free.price).toBe(0);
    expect(free.wordsPerMonth).toBeGreaterThan(0);
    expect(free.maxWordsPerShrink).toBeGreaterThan(0);
    expect(free.features).toContain('Web compressor');
    expect(free.features).toContain('API access + SDK');
  });

  it('advanced plan has correct pricing', () => {
    const adv = PLANS.advanced;
    expect(adv.name).toBe('Advanced');
    expect(adv.price).toBe(5);
    expect(adv.priceAnnual).toBe(36);
  });

  it('advanced plan has Rosetta Protocol feature', () => {
    const adv = PLANS.advanced;
    const hasRosetta = adv.features.some(f => f.includes('Rosetta Protocol'));
    expect(hasRosetta).toBe(true);
  });

  it('advanced plan has domain rotors feature', () => {
    const adv = PLANS.advanced;
    const hasRotors = adv.features.some(f => f.includes('Domain rotors'));
    expect(hasRotors).toBe(true);
  });

  it('advanced plan has stripePriceId field', () => {
    // The field exists in config even if process.env is undefined in test
    expect('stripePriceId' in PLANS.advanced).toBe(true);
    expect('stripePriceIdAnnual' in PLANS.advanced).toBe(true);
  });
});

describe('Checkout route — PRICE_MAP', () => {
  it('checkout route only accepts advanced plan', async () => {
    const { readFileSync } = await import('fs');
    const source = readFileSync(new URL('../app/api/billing/checkout/route.js', import.meta.url), 'utf8');

    // Verify PRICE_MAP structure
    expect(source).toContain('PRICE_MAP');
    expect(source).toContain('advanced');
    expect(source).not.toContain('STRIPE_PRO_PRICE_ID');
    expect(source).not.toContain('STRIPE_TEAM_PRICE_ID');
  });
});

describe('Webhook handler', () => {
  it('handles checkout.session.completed event type', async () => {
    const { readFileSync } = await import('fs');
    const source = readFileSync(new URL('../app/api/billing/webhook/route.js', import.meta.url), 'utf8');

    expect(source).toContain('checkout.session.completed');
    expect(source).toContain('customer.subscription.updated');
    expect(source).toContain('customer.subscription.deleted');
  });

  it('webhook verifies Stripe signature', async () => {
    const { readFileSync } = await import('fs');
    const source = readFileSync(new URL('../app/api/billing/webhook/route.js', import.meta.url), 'utf8');

    expect(source).toContain('stripe-signature');
    expect(source).toContain('constructEvent');
    expect(source).toContain('STRIPE_WEBHOOK_SECRET');
  });

  it('webhook downgrades to free on subscription.deleted', async () => {
    const { readFileSync } = await import('fs');
    const source = readFileSync(new URL('../app/api/billing/webhook/route.js', import.meta.url), 'utf8');

    expect(source).toContain("plan: 'free'");
    expect(source).toContain("status: 'canceled'");
  });
});

describe('Env vars documentation', () => {
  it('.env.example includes all required Stripe vars', async () => {
    const { readFileSync } = await import('fs');
    const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');

    expect(envExample).toContain('STRIPE_SECRET_KEY');
    expect(envExample).toContain('STRIPE_WEBHOOK_SECRET');
    expect(envExample).toContain('STRIPE_ADVANCED_PRICE_ID');
  });
});
