'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/client';
export default function AnalyticsTracker() {
  const path = usePathname();
  const last = useRef('');
  useEffect(() => {
    if (last.current !== path) { last.current = path; trackEvent('pageview'); }
    let active = Date.now();
    const activity = () => { active = Date.now(); };
    const heartbeat = () => { if (document.visibilityState === 'visible' && Date.now() - active < 300000) trackEvent('heartbeat'); };
    const timer = setInterval(heartbeat, 60000);
    window.addEventListener('pointerdown', activity, { passive: true });
    window.addEventListener('scroll', activity, { passive: true });
    window.addEventListener('keydown', activity);
    document.addEventListener('visibilitychange', heartbeat);
    return () => { clearInterval(timer); window.removeEventListener('pointerdown', activity); window.removeEventListener('scroll', activity); window.removeEventListener('keydown', activity); document.removeEventListener('visibilitychange', heartbeat); };
  }, [path]);
  return null;
}
