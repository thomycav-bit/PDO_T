import type { Group, GroupMatch, Match, MatchStatus, SetScore } from './types';

export const SETS_PER_MATCH = 3;
const STATUSES: MatchStatus[] = ['programado', 'en_vivo', 'final'];

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length <= max ? v : null;
}

const SCORE = /^\d{0,2}$/;
const GAME = /^[0-9A-Za-z\- ]{0,12}$/;

export const emptySets = (): SetScore[] => Array.from({ length: SETS_PER_MATCH }, () => ({ a: '', b: '' }));

export const emptyMatch = (a = '', b = ''): GroupMatch => ({
  court: '',
  time: '',
  status: 'programado',
  a,
  b,
  sets: emptySets(),
  game: '',
});

function parseSets(input: unknown): SetScore[] | null {
  if (!Array.isArray(input) || input.length !== SETS_PER_MATCH) return null;
  const out: SetScore[] = [];
  for (const s of input) {
    if (!s || typeof s !== 'object') return null;
    const a = str((s as Record<string, unknown>).a, 2);
    const b = str((s as Record<string, unknown>).b, 2);
    if (a === null || b === null || !SCORE.test(a) || !SCORE.test(b)) return null;
    out.push({ a, b });
  }
  return out;
}

function parseMatch(input: unknown): GroupMatch | null {
  if (!input || typeof input !== 'object') return null;
  const m = input as Record<string, unknown>;
  const court = str(m.court, 60);
  const time = str(m.time, 20);
  const a = str(m.a, 120);
  const b = str(m.b, 120);
  const game = str(m.game, 12);
  const status = STATUSES.includes(m.status as MatchStatus) ? (m.status as MatchStatus) : null;
  const sets = parseSets(m.sets);
  if (court === null || time === null || a === null || b === null || game === null || !GAME.test(game)) return null;
  if (!status || !sets) return null;
  return { court, time, status, a, b, sets, game };
}

export function parseGroups(input: unknown): Group[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) return null;
  const out: Group[] = [];
  for (const g of input) {
    if (!g || typeof g !== 'object') return null;
    const title = str((g as Record<string, unknown>).title, 60);
    const matches = (g as Record<string, unknown>).matches;
    if (title === null || !Array.isArray(matches) || matches.length > 30) return null;
    const clean = matches.map(parseMatch);
    if (clean.some((m) => m === null)) return null;
    out.push({ title, matches: clean as GroupMatch[] });
  }
  return out;
}

/** Acepta datos guardados con el formato anterior ({ title, teams }) y los convierte a partidos todos contra todos. */
export function normalizeGroups(input: unknown): Group[] | null {
  if (!Array.isArray(input)) return null;
  const converted = input.map((g) => {
    if (!g || typeof g !== 'object') return g;
    const rec = g as Record<string, unknown>;
    if (Array.isArray(rec.matches) || !Array.isArray(rec.teams)) return g;
    const teams = (rec.teams as unknown[]).filter((t): t is string => typeof t === 'string' && t.trim() !== '');
    const matches: GroupMatch[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) matches.push(emptyMatch(teams[i], teams[j]));
    }
    return { title: rec.title, matches };
  });
  return parseGroups(converted);
}

export function parseBracket(input: unknown): Match[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > 64) return null;
  const out: Match[] = [];
  for (const m of input) {
    if (!m || typeof m !== 'object') return null;
    const a = str((m as Record<string, unknown>).a, 120);
    const b = str((m as Record<string, unknown>).b, 120);
    if (a === null || b === null) return null;
    out.push({ a, b });
  }
  return out;
}
