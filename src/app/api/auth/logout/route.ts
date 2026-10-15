import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';
import { sameOrigin } from '@/lib/http';

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
