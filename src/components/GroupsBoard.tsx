'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Group } from '@/lib/types';
import { useAuth } from './AuthProvider';
import { PageHeader } from './PageHeader';

const clone = (groups: Group[]): Group[] => groups.map((g) => ({ title: g.title, teams: [...g.teams] }));
const nextTitle = (n: number) => `Grupo ${n < 26 ? String.fromCharCode(65 + n) : n + 1}`;

export function GroupsBoard({ slug, title, initial }: { slug: string; title: string; initial: Group[] }) {
  const { admin, expire } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<Group[]>(initial);
  const [draft, setDraft] = useState<Group[]>(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSaved(initial);
  }, [initial]);

  // Si se cierra la sesión, se sale del modo edición.
  useEffect(() => {
    if (!admin) {
      setEditing(false);
      setError('');
    }
  }, [admin]);

  const groups = editing ? draft : saved;

  function startEdit() {
    setDraft(clone(saved));
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  const setTitle = (i: number, value: string) =>
    setDraft((d) => d.map((g, k) => (k === i ? { ...g, title: value } : g)));

  const setTeam = (i: number, j: number, value: string) =>
    setDraft((d) => d.map((g, k) => (k === i ? { ...g, teams: g.teams.map((t, m) => (m === j ? value : t)) } : g)));

  const addGroup = () => setDraft((d) => [...d, { title: nextTitle(d.length), teams: ['', '', '', ''] }]);
  const removeGroup = (i: number) => setDraft((d) => (d.length <= 1 ? d : d.filter((_, k) => k !== i)));

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/groups/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: draft }),
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
      <main className="wrap">
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="grid">
          {groups.map((g, i) => (
            <article className="card" key={i}>
              {editing ? (
                <>
                  {groups.length > 1 && (
                    <button type="button" className="card-remove" aria-label="Quitar grupo" onClick={() => removeGroup(i)}>
                      &times;
                    </button>
                  )}
                  <input
                    className="title-input"
                    value={g.title}
                    placeholder="Título del grupo"
                    maxLength={60}
                    onChange={(e) => setTitle(i, e.target.value)}
                  />
                  {g.teams.map((t, j) => (
                    <input
                      key={j}
                      className="slot-input"
                      value={t}
                      placeholder="Nombre de la pareja"
                      maxLength={120}
                      onChange={(e) => setTeam(i, j, e.target.value)}
                    />
                  ))}
                </>
              ) : (
                <>
                  <h2 className="card-title">{g.title}</h2>
                  {g.teams.map((t, j) =>
                    t.trim() ? (
                      <div className="slot" key={j}>
                        {t}
                      </div>
                    ) : (
                      <div className="slot empty" key={j}>
                        Por definir
                      </div>
                    ),
                  )}
                </>
              )}
            </article>
          ))}
          {editing && (
            <button type="button" className="add-group" onClick={addGroup}>
              + Agregar grupo
            </button>
          )}
        </div>
      </main>
    </>
  );
}
