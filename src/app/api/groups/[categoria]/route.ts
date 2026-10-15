import { NextResponse } from 'next/server';
import { getCategory } from '@/lib/categories';
import { guard } from '@/lib/http';
import { setGroups } from '@/lib/store';
import { parseGroups } from '@/lib/validate';

export async function PUT(req: Request, { params }: { params: Promise<{ categoria: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;

  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) return NextResponse.json({ error: 'Categoría inexistente.' }, { status: 404 });

  let body: { groups?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  const groups = parseGroups(body.groups);
  if (!groups) return NextResponse.json({ error: 'Los datos de los grupos no son válidos.' }, { status: 400 });

  await setGroups(category.slug, groups);
  return NextResponse.json({ ok: true });
}
