import { NextResponse } from 'next/server';
import { isAdmin } from './auth';

/** Rechaza peticiones que vengan de otro origen (defensa extra contra CSRF). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Devuelve una respuesta de error si no se puede editar, o null si todo está bien. */
export async function guard(req: Request): Promise<NextResponse | null> {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Necesitás iniciar sesión para editar.' }, { status: 401 });
  }
  return null;
}
