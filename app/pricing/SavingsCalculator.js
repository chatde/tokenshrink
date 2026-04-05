'use client';

import { useId, useState } from 'react';

const DEFAULT_TOKENS_PER_DAY = 50_000;
const MIN_TOKENS_PER_DAY = 1_000;
const MAX_TOKENS_PER_DAY = 1_000_000;
const STEP = 1_000;
const COMPRESSION_RATE = 0.22;
const GPT_4O_INPUT_COST_PER_MILLION = 5;
const DAYS_PER_MONTH = 30;
const ADVANCED_MONTHLY_PRICE = 5;

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function sanitizeTokensPerDay(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_TOKENS_PER_DAY;
  }

  return Math.min(
    MAX_TOKENS_PER_DAY,
    Math.max(MIN_TOKENS_PER_DAY, Math.round(value / STEP) * STEP),
  );
}

export default function SavingsCalculator() {
  const inputId = useId();
  const [tokensPerDay, setTokensPerDay] = useState(DEFAULT_TOKENS_PER_DAY);
  const safeTokensPerDay = sanitizeTokensPerDay(tokensPerDay);

  const tokensSavedPerDay = Math.round(safeTokensPerDay * COMPRESSION_RATE);
  const monthlyCost =
    (safeTokensPerDay / 1_000_000) * GPT_4O_INPUT_COST_PER_MILLION * DAYS_PER_MONTH;
  const monthlySavings = monthlyCost * COMPRESSION_RATE;
  const paybackDays = monthlySavings > 0
    ? Math.ceil((ADVANCED_MONTHLY_PRICE / monthlySavings) * DAYS_PER_MONTH)
    : null;

  return (
    <div className="max-w-3xl mx-auto mb-10 rounded-xl border border-savings/20 bg-bg-card p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-savings mb-2">
            Savings calculator
          </p>
          <h2 className="text-xl font-semibold text-text">
            See what 22% prompt compression is worth
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Based on GPT-4o input pricing at $5 per 1M tokens and a 30-day month.
          </p>
        </div>

        <div>
          <label htmlFor={inputId} className="block text-sm font-medium text-text mb-3">
            How many tokens do you send per day?
          </label>
          <div className="rounded-lg border border-border bg-bg px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <input
                id={inputId}
                type="range"
                min={MIN_TOKENS_PER_DAY}
                max={MAX_TOKENS_PER_DAY}
                step={STEP}
                value={safeTokensPerDay}
                onChange={(event) => setTokensPerDay(sanitizeTokensPerDay(Number(event.target.value)))}
                className="w-full accent-savings"
              />
              <input
                type="number"
                min={MIN_TOKENS_PER_DAY}
                max={MAX_TOKENS_PER_DAY}
                step={STEP}
                value={safeTokensPerDay}
                onChange={(event) => {
                  setTokensPerDay(sanitizeTokensPerDay(Number(event.target.value)));
                }}
                className="w-36 rounded-md border border-border bg-bg-card px-3 py-2 text-right text-sm text-text focus:border-savings/40 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              <span>{integerFormatter.format(MIN_TOKENS_PER_DAY)}</span>
              <span>{integerFormatter.format(MAX_TOKENS_PER_DAY)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg px-4 py-4 text-sm text-text-secondary">
          You send about{' '}
          <span className="font-semibold text-text">
            {integerFormatter.format(safeTokensPerDay)} tokens/day
          </span>
          {' '}and save about{' '}
          <span className="font-semibold text-savings">
            {integerFormatter.format(tokensSavedPerDay)} tokens/day
          </span>
          , worth about{' '}
          <span className="font-semibold text-savings">
            {currencyFormatter.format(monthlySavings)}/month
          </span>
          {' '}on your upstream LLM bill (GPT-4o pricing).
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-bg px-4 py-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">Tokens saved</p>
            <p className="mt-2 text-2xl font-bold text-savings">
              {integerFormatter.format(tokensSavedPerDay)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">Per day at 22% average compression</p>
          </div>

          <div className="rounded-lg border border-border bg-bg px-4 py-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">Monthly API cost</p>
            <p className="mt-2 text-2xl font-bold text-text">
              {currencyFormatter.format(monthlyCost)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">Before TokenShrink compression</p>
          </div>

          <div className="rounded-lg border border-border bg-bg px-4 py-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">Advanced payback</p>
            <p className="mt-2 text-2xl font-bold text-savings">
              {paybackDays === null ? 'N/A' : `${paybackDays} days`}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {paybackDays === null
                ? 'Requires a positive monthly savings estimate'
                : `${currencyFormatter.format(monthlySavings)} saved per month`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
