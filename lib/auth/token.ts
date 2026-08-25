import crypto from 'crypto';

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'buogs_portfolio_secret_session_key_2026_v1_secure_key';
}

function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || 'admin';
}

/**
 * Creates a HMAC signed session token
 */
export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 24 * 60 * 60 * 1000 * 7, // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('hex');
  return `${encodedPayload}.${hmac}`;
}

/**
 * Verifies a HMAC signed session token. Pure crypto, no Next.js request APIs,
 * so it can be imported from proxy.ts without pulling in next/headers or bcryptjs.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return false;

    const expectedHmac = crypto.createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('hex');
    const signatureBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.u !== getAdminUsername()) return false;
    if (payload.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}
