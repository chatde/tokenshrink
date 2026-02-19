'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    words: '5,000',
    perShrink: '1,000',
    features: ['Web compressor', '5,000 words/month', 'See your savings'],
    cta: 'Get started',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/month',
    words: '250,000',
    perShrink: '10,000',
    features: [
      'Everything in Free',
      '250,000 words/month',
      'API access + SDK',
      'Usage dashboard',
      'Priority support',
    ],
    cta: 'Subscribe',
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$79',
    period: '/month',
    words: '1,000,000',
    perShrink: '50,000',
    features: [
      'Everything in Pro',
      '1,000,000 words/month',
      '5 team seats',
      'Proxy mode',
      'Custom dictionaries',
    ],
    cta: 'Subscribe',
    highlight: false,
  },
];

export default function PricingTable() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      router.push(session ? '/dashboard' : '/login');
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`rounded-xl border p-6 flex flex-col ${
            plan.highlight
              ? 'border-savings bg-savings/5 ring-1 ring-savings/20'
              : 'border-border bg-bg-card'
          }`}
        >
          {plan.highlight && (
            <div className="text-xs font-medium text-savings mb-3">Most popular</div>
          )}

          <h3 className="text-lg font-semibold text-text">{plan.name}</h3>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-text">{plan.price}</span>
            <span className="text-sm text-text-muted">{plan.period}</span>
          </div>

          <div className="mt-3 text-sm text-text-secondary">
            <span className="font-medium text-text">{plan.words}</span> words/month
          </div>
          <div className="text-xs text-text-muted mt-1">
            Up to {plan.perShrink} words per submission
          </div>

          <ul className="mt-5 space-y-2.5 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-savings mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(plan.id)}
            className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              plan.highlight
                ? 'bg-savings text-bg hover:bg-savings/90'
                : 'border border-border text-text hover:border-border-hover hover:bg-bg-secondary'
            }`}
          >
            {session?.user?.plan === plan.id ? 'Current plan' : plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
