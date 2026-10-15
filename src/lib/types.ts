export type MatchStatus = 'programado' | 'en_vivo' | 'final';
export type SetScore = { a: string; b: string };
export type GroupMatch = {
  court: string;
  time: string;
  status: MatchStatus;
  a: string;
  b: string;
  sets: SetScore[];
  game: string;
};
export type Group = { title: string; matches: GroupMatch[] };
export type Match = { a: string; b: string };
