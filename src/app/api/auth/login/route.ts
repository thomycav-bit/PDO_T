import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkCredentials,
  createSessionToken,
  sessionSecretConfigured,
} from '@/lib/auth';
import { sameOrigin } from '@/lib/http';

// Límite simple de intentos por IP (en memoria): 8 intentos cada 10 minutos.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; reset: number }>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }
  if (!sessionSecretConfigured()) {
    return NextResponse.json(
      { error: 'El servidor no está configurado: falta SESSION_SECRET.' },
      { status: 500 },
    );
  }

  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (tooMany(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
      { status: 429 },
    );
  }

  let body: { user?: unknown; password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  const user = typeof body.user === 'string' ? body.user : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!checkCredentials(user, password)) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
