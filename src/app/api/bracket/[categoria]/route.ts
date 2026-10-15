import { NextResponse } from 'next/server';
import { getCategory } from '@/lib/categories';
import { guard } from '@/lib/http';
import { setBracket } from '@/lib/store';
import { parseBracket } from '@/lib/validate';

export async function PUT(req: Request, { params }: { params: Promise<{ categoria: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;

  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) return NextResponse.json({ error: 'Categoría inexistente.' }, { status: 404 });

  let body: { matches?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  const matches = parseBracket(body.matches);
  if (!matches) return NextResponse.json({ error: 'Los datos de la llave no son válidos.' }, { status: 400 });

  await setBracket(category.slug, matches);
  return NextResponse.json({ ok: true });
}
