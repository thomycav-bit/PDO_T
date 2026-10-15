import { NextResponse } from 'next/server';
import { guard } from '@/lib/http';
import { FLYER_MAX_BYTES, FLYER_TYPES, getFlyer, saveFlyer } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const flyer = await getFlyer();
  if (!flyer) return new Response('Not found', { status: 404 });
  // La URL lleva ?v=<versión>, así que se puede cachear sin riesgo de ver un flyer viejo.
  const versioned = new URL(req.url).searchParams.has('v');
  return new Response(flyer.data as unknown as BodyInit, {
    headers: {
      'Content-Type': flyer.type,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-cache',
    },
  });
}

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  const file = form.get('flyer');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Falta la imagen del flyer.' }, { status: 400 });
  }
  if (!FLYER_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Usá una imagen JPG, PNG o WebP.' }, { status: 400 });
  }
  if (file.size > FLYER_MAX_BYTES) {
    return NextResponse.json({ error: 'La imagen supera los 8 MB.' }, { status: 413 });
  }

  await saveFlyer(Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json({ ok: true });
}
