// Petit stockage clé → JSON : Netlify Blobs en ligne, dossier .data en local.
import { promises as fs } from 'fs';
import path from 'path';
import { store as netlifyStore } from './netlifyStore';

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.SITE_ID);

export async function putJSON(store: string, key: string, value: unknown) {
  if (onNetlify()) {
    await (await netlifyStore(store)).setJSON(key, value);
    return;
  }
  const dir = path.join(process.cwd(), '.data', store);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${key}.json`), JSON.stringify(value));
}

export async function getJSON<T>(store: string, key: string): Promise<T | null> {
  if (onNetlify()) {
    return (await (await netlifyStore(store)).get(key, { type: 'json' })) as T | null;
  }
  try { return JSON.parse(await fs.readFile(path.join(process.cwd(), '.data', store, `${key}.json`), 'utf8')); } catch { return null; }
}

/** Clés d'un stockage (pour les listes de suivi de l'atelier). */
export async function listKeys(store: string): Promise<string[]> {
  if (onNetlify()) {
    const r = await (await netlifyStore(store)).list();
    return r.blobs.map((b) => b.key);
  }
  try { return (await fs.readdir(path.join(process.cwd(), '.data', store))).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)); } catch { return []; }
}

/** Supprime une clé (commande annulée…). */
export async function deleteJSON(store: string, key: string) {
  if (onNetlify()) { await (await netlifyStore(store)).delete(key); return; }
  await fs.rm(path.join(process.cwd(), '.data', store, `${key}.json`), { force: true });
}
