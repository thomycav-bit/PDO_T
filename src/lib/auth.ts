import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'pdo_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('Falta SESSION_SECRET (mínimo 16 caracteres) en las variables de entorno.');
  }
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null): boolean {
  try {
    if (!token) return false;
    const i = token.lastIndexOf('.');
    if (i < 0) return false;
    const payload = token.slice(0, i);
    const given = Buffer.from(token.slice(i + 1));
    const expected = Buffer.from(sign(payload));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
    const [role, exp] = payload.split('.');
    return role === 'admin' && Number(exp) > Date.now() / 1000;
  } catch {
    return false;
  }
}

/** true si la petición actual tiene una sesión de administrador válida. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

const digest = (s: string) => createHash('sha256').update(s).digest();

export function checkCredentials(user: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER ?? '';
  const expectedPass = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedUser || !expectedPass) return false;
  const okUser = timingSafeEqual(digest(user.trim().toLowerCase()), digest(expectedUser.trim().toLowerCase()));
  const okPass = timingSafeEqual(digest(password), digest(expectedPass));
  return okUser && okPass;
}

export function sessionSecretConfigured(): boolean {
  try {
    secret();
    return true;
  } catch {
    return false;
  }
}
