import type { Group, Match } from './types';

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length <= max ? v : null;
}

export function parseGroups(input: unknown): Group[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) return null;
  const out: Group[] = [];
  for (const g of input) {
    if (!g || typeof g !== 'object') return null;
    const title = str((g as Record<string, unknown>).title, 60);
    const teams = (g as Record<string, unknown>).teams;
    if (title === null || !Array.isArray(teams) || teams.length !== 4) return null;
    const clean = teams.map((t) => str(t, 120));
    if (clean.some((t) => t === null)) return null;
    out.push({ title, teams: clean as string[] });
  }
  return out;
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
