'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

const MAX_WIDTH = 2400;

/** Reduce la imagen (máx. 2400 px de ancho) y la convierte a JPG para que la página cargue rápido. */
async function toJpegBlob(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('No se pudo leer la imagen. Probá con un archivo JPG o PNG.'));
      i.src = url;
    });
    const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo procesar la imagen.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.'))), 'image/jpeg', 0.88),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Placeholder() {
  return (
    <div className="hero">
      <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect x="10" y="5" width="180" height="90" />
        <line className="net" x1="100" y1="5" x2="100" y2="95" />
        <line x1="37.5" y1="5" x2="37.5" y2="95" />
        <line x1="162.5" y1="5" x2="162.5" y2="95" />
        <line x1="37.5" y1="50" x2="162.5" y2="50" />
      </svg>
      <p>Acá va el flyer oficial del torneo</p>
    </div>
  );
}

export function FlyerSection({ version }: { version: string | null }) {
  const { admin, expire } = useAuth();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null);
  const [saved, setSaved] = useState<{ url: string; base: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Cierra la vista previa si se cierra la sesión.
  useEffect(() => {
    if (!admin && pending) {
      URL.revokeObjectURL(pending.url);
      setPending(null);
      setError('');
    }
  }, [admin, pending]);

  // Cuando llega la nueva versión del servidor, se suelta la imagen local.
  useEffect(() => {
    if (saved && version !== saved.base) {
      URL.revokeObjectURL(saved.url);
      setSaved(null);
    }
  }, [version, saved]);

  const src = pending?.url ?? saved?.url ?? (version ? `/api/flyer?v=${version}` : null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Elegí un archivo de imagen (JPG, PNG o WebP).');
      return;
    }
    try {
      const blob = await toJpegBlob(file);
      if (pending) URL.revokeObjectURL(pending.url);
      setPending({ blob, url: URL.createObjectURL(blob) });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo leer la imagen.');
    }
  }

  function discard() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
    setError('');
  }

  async function save() {
    if (!pending) return;
    setSaving(true);
    setError('');
    const body = new FormData();
    body.append('flyer', pending.blob, 'flyer.jpg');
    try {
      const res = await fetch('/api/flyer', { method: 'POST', body });
      if (res.status === 401) {
        expire();
        setError('La sesión venció. Iniciá sesión de nuevo.');
      } else if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'No se pudo guardar el flyer.');
      } else {
        setSaved({ url: pending.url, base: version });
        setPending(null);
        router.refresh();
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {admin && (
        <div className="flyer-controls">
          {pending ? (
            <>
              <button type="button" className="flyer-btn" onClick={discard}>
                Cancelar
              </button>
              <button type="button" className="flyer-btn primary" onClick={save} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar flyer'}
              </button>
            </>
          ) : (
            <button type="button" className="flyer-btn" onClick={() => input.current?.click()}>
              {src ? 'Cambiar flyer' : 'Subir flyer'}
            </button>
          )}
          <input ref={input} type="file" accept="image/*" hidden onChange={onPick} />
          {error && (
            <p className="flyer-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
      {src ? (
        <div className="flyer-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Flyer oficial del torneo" />
        </div>
      ) : (
        <Placeholder />
      )}
    </>
  );
}
