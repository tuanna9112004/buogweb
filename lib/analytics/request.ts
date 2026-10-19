import { randomUUID, createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/token';
const uuid = /^[a-f0-9-]{36}$/i;
export function publicHost(request: NextRequest) { return request.headers.get('host') || request.nextUrl.host; }
export function excluded(request: NextRequest) {
  const hostname = new URL(`http://${publicHost(request)}`).hostname;
  return process.env.NODE_ENV !== 'production' || ['localhost', '127.0.0.1', '[::1]'].includes(hostname) ||
    verifySessionToken(request.cookies.get('buogs_admin_session')?.value) || /bot|crawler|spider|headless|preview|slurp/i.test(request.headers.get('user-agent') || '') ||
    request.headers.get('purpose') === 'prefetch';
}
export function identity(request: NextRequest) {
  const value = (name: string) => { const raw = request.cookies.get(name)?.value; return raw && uuid.test(raw) ? raw : randomUUID(); };
  return { visitor: value('buogs_visitor'), session: value('buogs_visit') };
}
export function identifyResponse(response: NextResponse, ids: ReturnType<typeof identity>, request: NextRequest) {
  const options = { httpOnly: true, sameSite: 'lax' as const, secure: request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https', path: '/' };
  response.cookies.set('buogs_visitor', ids.visitor, { ...options, maxAge: 365 * 86400 });
  response.cookies.set('buogs_visit', ids.session, { ...options, maxAge: 1800 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
export function device(request: NextRequest) { return /mobile|android|iphone|ipad/i.test(request.headers.get('user-agent') || '') ? 'Mobile / Tablet' : 'Desktop'; }
const buckets = new Map<string, { at: number; count: number }>();
export function requestLimitKey(request: NextRequest) {
  // Used only in memory for rate limiting; addresses are never written to analytics journals.
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
  return address ? createHash('sha256').update(address).digest('hex') : null;
}
export function limited(key: string) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [id, entry] of buckets) if (now - entry.at > 60000) buckets.delete(id);
  const old = buckets.get(key);
  if (!old && buckets.size >= 10000) return true;
  if (!old || now - old.at > 60000) { buckets.set(key, { at: now, count: 1 }); return false; }
  return ++old.count > 90;
}
