'use client';

import { useEffect, useRef, useState } from 'react';

function formatLarge(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

// Roughly 12 tokens/second global rate estimate
const TOKENS_PER_SECOND = 12;

export default function AnimatedCount({ initial }) {
  const [count, setCount] = useState(initial);
  const startRef = useRef(Date.now());
  const baseRef = useRef(initial);

  // Count-up animation on mount (0 → initial over 1.5s)
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const from = initial * 0.85;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (initial - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
      else {
        // After count-up finishes, start the live ticker
        startRef.current = Date.now();
        baseRef.current = initial;
      }
    }
    requestAnimationFrame(step);
  }, [initial]);

  // Live ticker — increments at TOKENS_PER_SECOND
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCount(Math.floor(baseRef.current + elapsed * TOKENS_PER_SECOND));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{formatLarge(count)}</span>;
}
