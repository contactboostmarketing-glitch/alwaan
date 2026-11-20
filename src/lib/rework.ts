// Dossiers de retouche : le client a demandé que notre graphiste retravaille son logo.
// L'atelier dépose le logo retravaillé, le site génère les nouvelles maquettes,
// le client les valide (ou demande une modification) en un clic sur /bat/<id>. Rien n'est imprimé avant.
import { randomBytes } from 'crypto';
import { getJSON, listKeys, putJSON } from './blobStore';
import type { Rework, ReworkItem } from './reworkTypes';
export * from './reworkTypes';

const STORE = 'retouches';
export const REWORK_ID = /^[a-f0-9]{32}$/;

export const getRework = (id: string) => (REWORK_ID.test(id) ? getJSON<Rework>(STORE, id) : Promise.resolve(null));
export const saveRework = (r: Rework) => putJSON(STORE, r.id, r);

export async function createRework(items: ReworkItem[]): Promise<string> {
  const id = randomBytes(16).toString('hex');
  const now = new Date().toISOString();
  await saveRework({ id, createdAt: now, status: 'a_retoucher', items, history: [{ at: now, event: 'Commande passée avec retouche du logo' }] });
  return id;
}

export async function listReworks(): Promise<Rework[]> {
  const keys = (await listKeys(STORE)).filter((k) => REWORK_ID.test(k));
  const all = await Promise.all(keys.map((k) => getJSON<Rework>(STORE, k)));
  return all.filter((r): r is Rework => !!r).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Clé de l'atelier (pages /atelier) : STAFF_KEY, sinon la clé de synchronisation. */
export const staffKey = () => process.env.STAFF_KEY || process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY || '';
export const isStaff = (req: Request) => !!staffKey() && req.headers.get('x-staff-key') === staffKey();
