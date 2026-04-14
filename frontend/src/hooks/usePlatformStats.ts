import { useEffect, useState } from 'react';
import { analyticsAPI, type PlatformStats } from '@/api/analyticsAPI';

function formatNumber(n: number): string {
  if (n >= 1000) {
    const k = Math.floor(n / 100) / 10;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k+`;
  }
  return `${n}`;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<{ value: string; label: string }[]>([
    { value: '—', label: 'Active positions' },
    { value: '—', label: 'Companies' },
    { value: '—', label: 'Applications' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsAPI.getPlatformStats().then((data: PlatformStats) => {
      if (cancelled) return;
      setStats([
        { value: formatNumber(data.active_jobs), label: 'Active positions' },
        { value: formatNumber(data.companies), label: 'Companies' },
        { value: formatNumber(data.applications), label: 'Applications' },
      ]);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading };
}
