/** Current Stripe APIs put billing periods on subscription items. */
export function subscriptionState(subscription, env = process.env) {
  const prices = new Set([env.STRIPE_ADVANCED_PRICE_ID, env.STRIPE_ADVANCED_ANNUAL_PRICE_ID,
    env.STRIPE_ADVANCED_PRICE_ID_ANNUAL].filter(Boolean));
  const item = subscription.items?.data?.find(item => prices.has(item.price?.id));
  if (!item) return null; // Another product in the same Stripe account.
  const start = item.current_period_start ?? subscription.current_period_start;
  const end = item.current_period_end ?? subscription.current_period_end;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error('Subscription billing period is missing');
  }
  return {
    status: subscription.status,
    plan: subscription.status === 'active' ? 'advanced' : 'free',
    currentPeriodStart: new Date(start * 1000),
    currentPeriodEnd: new Date(end * 1000),
  };
}
