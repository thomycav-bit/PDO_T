'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import type { Match } from '@/lib/types';
import { useAuth } from './AuthProvider';
import { PageHeader } from './PageHeader';

const clone = (matches: Match[]): Match[] => matches.map((m) => ({ a: m.a, b: m.b }));

function semifinalRows(n: number): Match[] {
  const total = Math.ceil(n / 2);
  return Array.from({ length: total }, (_, i) => {
    const m1 = i * 2 + 1;
    const m2 = i * 2 + 2;
    return { a: `Ganador Cruce ${m1}`, b: m2 <= n ? `Ganador Cruce ${m2}` : 'Clasificado directo' };
  });
}

export function BracketBoard({ slug, title, initial }: { slug: string; title: string; initial: Match[] }) {
  const { admin, expire } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<Match[]>(initial);
  const [draft, setDraft] = useState<Match[]>(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [paths, setPaths] = useState({ d: '', g: '' });
  const wrapRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(initial);
  }, [initial]);

  useEffect(() => {
    if (!admin) {
      setEditing(false);
      setError('');
    }
  }, [admin]);

  const matches = editing ? draft : saved;
  const semis = semifinalRows(matches.length);

  // Dibuja las líneas que unen cada cruce con el siguiente, midiendo las tarjetas.
  const drawLinks = useCallback(() => {
    const wrap = wrapRef.current;
    const root = rootRef.current;
    if (!wrap || !root) return;
    const box = wrap.getBoundingClientRect();
    const cols = Array.from(root.children).map((c) => Array.from(c.querySelectorAll<HTMLElement>('.match, .champion-box')));
    const point = (el: HTMLElement, side: 'l' | 'r') => {
      const r = el.getBoundingClientRect();
      return { x: (side === 'r' ? r.right : r.left) - box.left, y: r.top + r.height / 2 - box.top };
    };
    let d = '';
    let g = '';
    for (let c = 0; c < cols.length - 1; c++) {
      const next = cols[c + 1];
      if (!next.length) continue;
      cols[c].forEach((el, i) => {
        const target = next[c === 0 ? Math.min(Math.floor(i / 2), next.length - 1) : 0];
        const a = point(el, 'r');
        const b = point(target, 'l');
        const xm = a.x + (b.x - a.x) / 2;
        const seg = `M${a.x} ${a.y}H${xm}V${b.y}H${b.x}`;
        if (c === cols.length - 2) g += seg;
        else d += seg;
      });
    }
    setPaths({ d, g });
  }, []);

  useLayoutEffect(() => {
    drawLinks();
  }, [drawLinks, matches, editing]);

  useEffect(() => {
    window.addEventListener('resize', drawLinks);
    document.fonts?.ready.then(drawLinks);
    return () => window.removeEventListener('resize', drawLinks);
  }, [drawLinks]);

  function startEdit() {
    setDraft(clone(saved));
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  const setTeam = (i: number, side: 'a' | 'b', value: string) =>
    setDraft((d) => d.map((m, k) => (k === i ? { ...m, [side]: value } : m)));
  const addMatch = () => setDraft((d) => [...d, { a: 'Nueva pareja', b: 'Nueva pareja' }]);
  const removeMatch = (i: number) => setDraft((d) => (d.length <= 1 ? d : d.filter((_, k) => k !== i)));

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/bracket/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: draft }),
      });
      if (res.status === 401) {
        expire();
        setError('La sesión venció. Iniciá sesión de nuevo.');
      } else if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'No se pudieron guardar los cambios.');
      } else {
        setSaved(draft);
        setEditing(false);
        router.refresh();
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  }

  const actions = !admin ? null : editing ? (
    <div className="edit-actions">
      <button type="button" className="btn" onClick={cancel}>
        Cancelar
      </button>
      <button type="button" className="btn primary" onClick={save} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  ) : (
    <button type="button" className="edit-btn" onClick={startEdit}>
      ✎ Editar
    </button>
  );

  return (
    <>
      <PageHeader title={title} actions={actions} />
      {error && (
        <p className="form-error bracket-error" role="alert">
          {error}
        </p>
      )}
      <div className="bracket-wrap">
        <div className="bracket" ref={wrapRef}>
          <svg className="links" aria-hidden="true">
            <path d={paths.d} />
            <path className="gold" d={paths.g} />
          </svg>
          <div className="bracket-root" ref={rootRef} style={{ '--rows': matches.length } as CSSProperties}>
            <div className="round">
              <div className="round-title">Primera ronda</div>
              {matches.map((m, i) => (
                <div className="match" key={i}>
                  {editing ? (
                    <>
                      {matches.length > 1 && (
                        <button type="button" className="match-remove" aria-label="Quitar cruce" onClick={() => removeMatch(i)}>
                          &times;
                        </button>
                      )}
                      <input className="team-input" value={m.a} maxLength={120} onChange={(e) => setTeam(i, 'a', e.target.value)} />
                      <input className="team-input" value={m.b} maxLength={120} onChange={(e) => setTeam(i, 'b', e.target.value)} />
                    </>
                  ) : (
                    <>
                      <div className="team">{m.a}</div>
                      <div className="team">{m.b}</div>
                    </>
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" className="add-match" onClick={addMatch}>
                  + Agregar pareja
                </button>
              )}
            </div>

            <div className="round">
              <div className="round-title">Semifinal</div>
              {semis.map((m, i) => (
                <div className="match" key={i}>
                  <div className="team">{m.a}</div>
                  <div className="team">{m.b}</div>
                </div>
              ))}
            </div>

            <div className="round final">
              <div className="round-title">Final</div>
              <div className="match">
                <div className="team">Ganador SF 1</div>
                <div className="team">Ganador SF 2</div>
              </div>
            </div>

            <div className="champion">
              <div className="champion-box">
                <div className="label">Campeón</div>
                <div className="team">&mdash;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
