'use client';
import type { EventKind } from './core';
let queue = Promise.resolve();
function eventId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function trackEvent(kind: EventKind | 'heartbeat', extra: { item?: string; placement?: string } = {}) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;
  const payload = { id: eventId(), kind, path: location.pathname, referrer: document.referrer, ...extra };
  // Serialize the first requests so all events share the server-issued visitor/session cookie.
  queue = queue.then(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try { await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true, signal: controller.signal }); } catch { /* Analytics never interrupts playback/navigation. */ }
    finally { clearTimeout(timeout); }
  });
}
