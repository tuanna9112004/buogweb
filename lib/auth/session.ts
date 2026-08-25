import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSessionToken, verifySessionToken } from './token';

export { createSessionToken, verifySessionToken } from './token';

const COOKIE_NAME = 'buogs_admin_session';

// Default bcrypt hash for password "buogs@2026!"
const DEFAULT_HASH = '$2b$10$hczDWN6bg.fyLcN8A3K86uIjSgmzOV4dOdikhJD7boy83ynL6COfS';

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

/**
 * Guard for admin API route handlers: returns a 401 NextResponse when the
 * caller isn't authenticated, or null when the request may proceed.
 */
export async function requireAdminAuth(): Promise<NextResponse | null> {
  if (await isSessionAuthenticated()) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
