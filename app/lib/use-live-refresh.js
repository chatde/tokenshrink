'use client';
import { useEffect } from 'react';

export function useLiveRefresh(refresh, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const update = () => { if (document.visibilityState === 'visible') refresh(); };
    update();
    const timer = setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, [refresh, enabled]);
}
