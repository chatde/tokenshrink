import Stripe from 'stripe';

let instance;

export function getStripe() {
  if (!instance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      return null;
    }
    instance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return instance;
}
