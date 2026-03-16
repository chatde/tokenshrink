'use client';

import { useCallback } from 'react';

export default function AuroraCard({ children, className = '' }) {
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mx', `${x}%`);
    e.currentTarget.style.setProperty('--my', `${y}%`);
  }, []);

  return (
    <div className={`aurora-hover ${className}`} onMouseMove={handleMouseMove}>
      {children}
    </div>
  );
}
