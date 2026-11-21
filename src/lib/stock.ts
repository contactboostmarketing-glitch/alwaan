// Stock atelier côté serveur (Netlify Blobs) : lecture, saisie par l'atelier, déduction à chaque commande payée.
import { getJSON, putJSON } from './blobStore';
import { skey, type Stock } from './stockTypes';

const STORE = 'stock', KEY = 'atelier';
type Saved = { q: Record<string, number>; updatedAt?: string };

export async function getStock(): Promise<Stock> {
  const d = await getJSON<Saved>(STORE, KEY).catch(() => null);
  const q = d?.q || {};
  return { tracking: Object.keys(q).length > 0, q, updatedAt: d?.updatedAt };
}

/** Saisie atelier : quantité par clé (vêtement|couleur|taille) ; null = retirée du stock (sur commande). */
export async function setStock(changes: Record<string, number | null>): Promise<Stock> {
  const { q } = await getStock();
  for (const [k, v] of Object.entries(changes)) {
    if (!/^[a-z0-9-]+\|#[0-9a-f]{6}\|[\w ]{1,20}$/i.test(k)) continue;
    if (v === null || !Number.isFinite(v)) delete q[k]; else q[k] = Math.max(0, Math.min(99999, Math.round(v)));
  }
  const updatedAt = new Date().toISOString();
  await putJSON(STORE, KEY, { q, updatedAt });
  return { tracking: Object.keys(q).length > 0, q, updatedAt };
}

/** Commande payée : on retire les pièces prises dans le stock (jamais en dessous de 0). */
export async function decrementStock(items: { key: string; quantity: number }[]): Promise<string> {
  const s = await getStock();
  if (!s.tracking || !items.length) return 'non suivi';
  const done: string[] = [];
  for (const { key, quantity } of items) {
    if (!(key in s.q)) continue; // référence sur commande : rien à retirer
    s.q[key] = Math.max(0, s.q[key] - quantity); done.push(`${key} -${quantity}`);
  }
  if (done.length) await putJSON(STORE, KEY, { q: s.q, updatedAt: new Date().toISOString() });
  return done.join(', ') || 'rien à déduire';
}
export { skey };
