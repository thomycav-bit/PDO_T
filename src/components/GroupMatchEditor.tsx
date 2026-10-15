'use client';

import type { GroupMatch, MatchStatus } from '@/lib/types';

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 2);

export function GroupMatchEditor({
  match,
  onChange,
  onRemove,
}: {
  match: GroupMatch;
  onChange: (m: GroupMatch) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof GroupMatch>(key: K, value: GroupMatch[K]) => onChange({ ...match, [key]: value });
  const setScore = (i: number, side: 'a' | 'b', value: string) =>
    set(
      'sets',
      match.sets.map((s, k) => (k === i ? { ...s, [side]: onlyDigits(value) } : s)),
    );

  return (
    <div className={`gm editing ${match.status}`}>
      <button type="button" className="match-remove" aria-label="Quitar partido" onClick={onRemove}>
        &times;
      </button>
      <div className="gm-edit-head">
        <input
          className="gm-input"
          value={match.court}
          placeholder="Pista"
          aria-label="Pista"
          maxLength={60}
          onChange={(e) => set('court', e.target.value)}
        />
        <input
          className="gm-input gm-time-input"
          type="time"
          value={match.time}
          aria-label="Horario"
          onChange={(e) => set('time', e.target.value)}
        />
        <select
          className="gm-input"
          value={match.status}
          aria-label="Estado"
          onChange={(e) => set('status', e.target.value as MatchStatus)}
        >
          <option value="programado">Programado</option>
          <option value="en_vivo">En vivo</option>
          <option value="final">Final</option>
        </select>
      </div>
      {(['a', 'b'] as const).map((side) => (
        <div className="gm-edit-row" key={side}>
          <input
            className="gm-input gm-name-input"
            value={match[side]}
            placeholder={side === 'a' ? 'Pareja 1' : 'Pareja 2'}
            aria-label={side === 'a' ? 'Pareja 1' : 'Pareja 2'}
            maxLength={120}
            onChange={(e) => set(side, e.target.value)}
          />
          {match.sets.map((s, i) => (
            <input
              key={i}
              className={`gm-input gm-set-input${i === 2 ? ' tb' : ''}`}
              inputMode="numeric"
              value={s[side]}
              placeholder="-"
              aria-label={`${side === 'a' ? 'Pareja 1' : 'Pareja 2'}, ${i === 2 ? 'super tie-break' : `set ${i + 1}`}`}
              onChange={(e) => setScore(i, side, e.target.value)}
            />
          ))}
        </div>
      ))}
      {match.status === 'en_vivo' && (
        <input
          className="gm-input gm-game-input"
          value={match.game}
          placeholder="Game actual (ej: 40-30)"
          aria-label="Game actual"
          maxLength={12}
          onChange={(e) => set('game', e.target.value.replace(/[^0-9A-Za-z\- ]/g, ''))}
        />
      )}
    </div>
  );
}
