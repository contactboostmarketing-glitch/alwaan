// Stock atelier côté serveur (Netlify Blobs) : lecture, saisie par l'atelier, déduction à chaque commande payée.
import { getJSON, putJSON } from './blobStore';
import { getProduct, COLOR_NAMES } from './catalog';
import { atelierEmail, esc, layout, sendMail } from './mail';
import { SITE_URL } from './site';
import { skey, type Stock } from './stockTypes';

/** Seuil d'alerte de réassort (pièces restantes par référence). */
export const STOCK_ALERT = Number(process.env.STOCK_ALERT || 5);

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
  // Alerte réassort : références qui viennent de passer sous le seuil avec cette commande.
  const low = items.filter(({ key, quantity }) => key in s.q && s.q[key] <= STOCK_ALERT && s.q[key] + quantity > STOCK_ALERT);
  let alert = '';
  if (low.length) alert = await sendMail({
    to: atelierEmail(),
    subject: `Réassort : ${low.length} référence${low.length > 1 ? 's' : ''} sous ${STOCK_ALERT} pièces`,
    html: layout({ title: 'Stock bas à l\'atelier', intro: `Ces références sont passées sous ${STOCK_ALERT} pièces. Au-delà du stock, le site les affiche « sur commande » (+5 jours ouvrés).`,
      rows: low.map(({ key }) => esc(`${label(key)} : ${s.q[key]} restante${s.q[key] > 1 ? 's' : ''}`)), cta: ['Mettre à jour le stock', `${SITE_URL}/atelier/stock`] }),
  }).catch((e) => `erreur ${(e as Error).message}`);
  return (done.join(', ') || 'rien à déduire') + (alert ? ` · alerte ${alert}` : '');
}
/** Commande annulée : remet en stock ce qui avait été déduit (texte « clé -n, … » enregistré avec la commande). */
export async function restoreStock(taken: string): Promise<string> {
  const back = [...taken.matchAll(/([^,\s][^,]*?) -(\d+)(?=,|$| ·)/g)].map((m) => ({ key: m[1].trim(), quantity: Number(m[2]) }));
  if (!back.length) return 'rien à remettre';
  const s = await getStock();
  const done: string[] = [];
  for (const { key, quantity } of back) if (key in s.q) { s.q[key] += quantity; done.push(`${key} +${quantity}`); }
  if (done.length) await putJSON(STORE, KEY, { q: s.q, updatedAt: new Date().toISOString() });
  return done.join(', ') || 'rien à remettre';
}
export { skey };

const label = (key: string) => { const [slug, color, size] = key.split('|'); return `${getProduct(slug)?.name || slug} ${COLOR_NAMES[color] || color} ${size}`; };
