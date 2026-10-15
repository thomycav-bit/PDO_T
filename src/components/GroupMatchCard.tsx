import type { GroupMatch, MatchStatus } from '@/lib/types';

const STATUS_LABEL: Record<MatchStatus, string> = {
  programado: 'Programado',
  en_vivo: 'En vivo',
  final: 'Final',
};

function StatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span className={`gm-badge ${status}`}>
      {status === 'final' && (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M5.4 8.2l1.8 1.8 3.4-3.6" />
        </svg>
      )}
      {status === 'en_vivo' && (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="1.6" className="fill" />
          <path d="M5.2 5.2a4 4 0 000 5.6M10.8 5.2a4 4 0 010 5.6M3.3 3.3a6.6 6.6 0 000 9.4M12.7 3.3a6.6 6.6 0 010 9.4" />
        </svg>
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

const played = (m: GroupMatch) => m.sets.filter((s) => s.a !== '' || s.b !== '');

function winnerOf(m: GroupMatch): 'a' | 'b' | null {
  if (m.status !== 'final') return null;
  let a = 0;
  let b = 0;
  for (const s of played(m)) {
    const x = Number(s.a || 0);
    const y = Number(s.b || 0);
    if (x > y) a++;
    else if (y > x) b++;
  }
  return a === b ? null : a > b ? 'a' : 'b';
}

export function GroupMatchCard({ match }: { match: GroupMatch }) {
  const sets = match.status === 'programado' ? [] : played(match);
  const winner = winnerOf(match);
  const rows = [
    { side: 'a' as const, name: match.a },
    { side: 'b' as const, name: match.b },
  ];

  return (
    <div className={`gm ${match.status}`}>
      <div className="gm-head">
        <span className="gm-court">{match.court.trim() || 'Pista a definir'}</span>
        <span className="gm-meta">
          {match.time && <span className="gm-time">{match.time} hs</span>}
          <StatusBadge status={match.status} />
        </span>
      </div>
      <table className="gm-score">
        <caption className="sr-only">
          {`${match.a || 'Por definir'} contra ${match.b || 'Por definir'}`}
        </caption>
        <tbody>
          {rows.map(({ side, name }) => (
            <tr key={side} className={winner && winner !== side ? 'loser' : undefined}>
              <th scope="row" className={name.trim() ? 'gm-team' : 'gm-team empty'}>
                {name.trim() || 'Por definir'}
              </th>
              {sets.map((s, i) => {
                const mine = s[side];
                const other = side === 'a' ? s.b : s.a;
                const won = Number(mine || 0) > Number(other || 0);
                const cls = [i === 2 ? 'tb' : '', won ? 'won' : ''].filter(Boolean).join(' ');
                return (
                  <td key={i} className={cls || undefined}>
                    {mine || '0'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {match.status === 'en_vivo' && match.game.trim() && (
        <p className="gm-game">Game actual: {match.game}</p>
      )}
    </div>
  );
}
