import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const COOKIE_NAME = 'buogs_admin_session';

// Default bcrypt hash for password "buogs@2026!"
const DEFAULT_HASH = '$2b$10$hczDWN6bg.fyLcN8A3K86uIjSgmzOV4dOdikhJD7boy83ynL6COfS';

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'buogs_portfolio_secret_session_key_2026_v1_secure_key';
}

function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || 'admin';
}

function getAdminPasswordHash(): string {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (!envHash || !envHash.startsWith('$2')) {
    return DEFAULT_HASH;
  }
  return envHash.replace(/^['"]|['"]$/g, '');
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
 * Verifies a HMAC signed session token
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return false;

    const expectedHmac = crypto.createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('hex');
    if (signature !== expectedHmac) return false;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.u !== getAdminUsername()) return false;
    if (payload.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Authenticates admin credentials
 */
export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  const expectedUser = getAdminUsername();
  if (username !== expectedUser) return false;

  const expectedHash = getAdminPasswordHash();
  const match = await bcrypt.compare(password, expectedHash);
  return match;
}

/**
 * Sets session cookie on login
 */
export async function setAdminSessionCookie(username: string) {
  const cookieStore = await cookies();
  const token = createSessionToken(username);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.REQUIRE_HTTPS === 'true',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Removes session cookie on logout
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Checks if request is authenticated as Admin
 */
export async function isSessionAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
