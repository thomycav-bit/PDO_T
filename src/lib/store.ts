import { promises as fs } from 'fs';
import path from 'path';
import type { Group, Match } from './types';

/**
 * Almacenamiento en archivos.
 *  - Lectura: primero DATA_DIR (lo editado desde el panel) y, si no existe, /seed (datos iniciales).
 *  - Escritura: siempre en DATA_DIR (por defecto ./data).
 * Para usar una base de datos u otro servicio, alcanza con reemplazar las funciones de este archivo.
 */
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const SEED_DIR = path.join(process.cwd(), 'seed');

async function readFirst(file: string): Promise<Buffer | null> {
  for (const dir of [DATA_DIR, SEED_DIR]) {
    try {
      return await fs.readFile(path.join(dir, file));
    } catch {
      /* probar el siguiente directorio */
    }
  }
  return null;
}

async function writeAtomic(file: string, data: Buffer | string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, target);
}

function defaultGroups(): Group[] {
  return ['A', 'B', 'C', 'D'].map((l) => ({ title: `Grupo ${l}`, teams: ['', '', '', ''] }));
}

function defaultBracket(): Match[] {
  return [
    { a: '1° A', b: '2° C' },
    { a: '1° D', b: '2° B' },
    { a: '2° A', b: '1° C' },
    { a: '2° D', b: '1° B' },
  ];
}

async function readJson<T>(file: string, fallback: () => T): Promise<T> {
  const raw = await readFirst(file);
  if (!raw) return fallback();
  try {
    return JSON.parse(raw.toString('utf8')) as T;
  } catch {
    return fallback();
  }
}

// ---- Grupos y cruces (el slug se valida antes contra la lista de categorías) ----
export const getGroups = (slug: string) => readJson<Group[]>(`groups-${slug}.json`, defaultGroups);
export const setGroups = (slug: string, groups: Group[]) =>
  writeAtomic(`groups-${slug}.json`, JSON.stringify(groups, null, 2));

export const getBracket = (slug: string) => readJson<Match[]>(`bracket-${slug}.json`, defaultBracket);
export const setBracket = (slug: string, matches: Match[]) =>
  writeAtomic(`bracket-${slug}.json`, JSON.stringify(matches, null, 2));

// ---- Flyer ----
const EXT_BY_TYPE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const TYPE_BY_EXT: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
export const FLYER_TYPES = Object.keys(EXT_BY_TYPE);
export const FLYER_MAX_BYTES = 8 * 1024 * 1024;

async function findFlyerFile(): Promise<{ file: string; type: string; mtime: number } | null> {
  for (const dir of [DATA_DIR, SEED_DIR]) {
    for (const ext of Object.keys(TYPE_BY_EXT)) {
      const file = path.join(dir, `flyer.${ext}`);
      try {
        const st = await fs.stat(file);
        return { file, type: TYPE_BY_EXT[ext], mtime: Math.floor(st.mtimeMs) };
      } catch {
        /* siguiente */
      }
    }
  }
  return null;
}

export async function getFlyerVersion(): Promise<string | null> {
  const f = await findFlyerFile();
  return f ? String(f.mtime) : null;
}

export async function getFlyer(): Promise<{ data: Buffer; type: string } | null> {
  const f = await findFlyerFile();
  if (!f) return null;
  return { data: await fs.readFile(f.file), type: f.type };
}

export async function saveFlyer(data: Buffer, type: string): Promise<void> {
  const ext = EXT_BY_TYPE[type];
  if (!ext) throw new Error('Formato de imagen no permitido');
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const other of Object.keys(TYPE_BY_EXT)) {
    if (other !== ext) await fs.rm(path.join(DATA_DIR, `flyer.${other}`), { force: true });
  }
  await writeAtomic(`flyer.${ext}`, data);
}
