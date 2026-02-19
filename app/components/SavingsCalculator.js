'use client';

import { useState } from 'react';

export default function SavingsCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(200);

  const savings = Math.round(monthlySpend * 0.65);
  const netSavings = savings - 19; // After Pro subscription

  return (
    <div className="max-w-lg mx-auto p-6 bg-bg-card border border-border rounded-xl">
      <h3 className="text-lg font-semibold text-text mb-4">Calculate your savings</h3>

      <label className="block text-sm text-text-secondary mb-2">
        Your monthly AI API spend
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={monthlySpend}
          onChange={(e) => setMonthlySpend(Number(e.target.value))}
          className="w-full mt-2 accent-savings"
        />
        <div className="text-center text-2xl font-bold text-text mt-2">
          ${monthlySpend}/mo
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Token savings (~65%)</span>
          <span className="text-savings font-medium">${savings}/mo</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">TokenShrink Pro</span>
          <span className="text-cost">-$19/mo</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="text-text font-medium">Net savings</span>
          <span className="text-savings text-xl font-bold">${Math.max(0, netSavings)}/mo</span>
        </div>
        <div className="text-xs text-text-muted text-center">
          {netSavings > 0
            ? `That's a ${Math.round(netSavings / 19)}x return on your subscription`
            : 'Upgrade to Pro when your spend exceeds ~$30/mo for positive ROI'}
        </div>
      </div>
    </div>
  );
}
