// Avis clients vérifiés (uniquement après une commande payée), avec photo facultative.
// Tout avis, positif ou négatif, reçoit le même merci : un code -10 % sur la prochaine commande, valable 3 mois.
// Les avis sont relus par l'atelier avant publication (règle affichée sur le site, conformément au Code de la consommation).
import { randomBytes } from 'crypto';
import { RELANCE_RATE } from './catalog';
import { getJSON, listKeys, putJSON } from './blobStore';
import { esc, layout, sendMail } from './mail';
import type { RelanceCode } from './relance';
import { sign } from './secure';
import { SITE_URL } from './site';

export const REVIEW_DELAY_DAYS = 10, REVIEW_CODE_DAYS = 90;
const DAY = 864e5;

export type Order = { id: string; name: string; createdAt: string; email?: string; value: number; slugs?: string[]; lang?: 'fr' | 'en'; recommander?: string; avisDemande?: string; avisId?: string; bienvenue?: string; renouvellement?: string; desinscrit?: boolean };
export type Review = {
  id: string; order: string; orderName: string; email: string; createdAt: string;
  name: string; company?: string; city?: string; rating: number; text: string; slugs: string[];
  photoId?: string; showInGallery: boolean; status: 'en_attente' | 'publie' | 'refuse'; code: string; reply?: string;
};
export type PublicReview = Pick<Review, 'id' | 'name' | 'company' | 'city' | 'rating' | 'text' | 'slugs' | 'createdAt' | 'reply'> & { photoId?: string };

export const reviewLink = (orderKey: string) => `${SITE_URL}/avis/${orderKey}?sig=${sign('avis', orderKey)}`;
export const getOrder = (key: string) => (/^\d{1,20}$/.test(key) ? getJSON<Order>('commandes', key) : Promise.resolve(null));

/** Demande d'avis : 10 jours après le paiement (la commande est reçue), une seule fois. */
export async function requestReviews(): Promise<string[]> {
  const out: string[] = [];
  for (const key of await listKeys('commandes')) {
    const o = await getOrder(key);
    if (!o?.email || o.avisDemande || o.avisId || o.desinscrit) continue;
    const age = Date.now() - Date.parse(o.createdAt);
    if (age < REVIEW_DELAY_DAYS * DAY || age > 60 * DAY) continue;
    const r = await sendMail({
      to: o.email, subject: 'Vos tenues sont arrivées ? Votre avis = -10 %',
      html: layout({ title: 'Comment trouvez-vous vos tenues ?', intro: `Votre avis aide d'autres équipes à choisir. Une note, quelques mots, et si vous le souhaitez une photo de vos tenues portées. En remerciement, <b>-10 % sur votre prochaine commande</b>, valable 3 mois, quel que soit votre avis.`, cta: ['Donner mon avis (1 minute)', reviewLink(key)] }),
    }).catch((e) => `erreur ${(e as Error).message}`);
    o.avisDemande = new Date().toISOString();
    await putJSON('commandes', key, o);
    out.push(`${o.name} ${r}`);
  }
  return out;
}

const clean = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');

/** Dépôt de l'avis : un seul par commande. Renvoie le code de remerciement. */
export async function submitReview(orderKey: string, b: Record<string, unknown>): Promise<{ code?: string; error?: string }> {
  const o = await getOrder(orderKey);
  if (!o?.email) return { error: 'Commande introuvable.' };
  if (o.avisId) return { error: 'Vous avez déjà donné votre avis pour cette commande. Merci !' };
  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) return { error: 'Choisissez une note de 1 à 5.' };
  const text = clean(b.text, 1200);
  if (text.length < 5) return { error: 'Écrivez quelques mots sur votre commande.' };
  const photoId = typeof b.photoId === 'string' && /^[a-f0-9]{32}\.(png|jpg|webp|heic|heif)$/.test(b.photoId) ? b.photoId : undefined;
  const code = `AVIS-${randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`;
  const id = randomBytes(8).toString('hex');
  const rv: Review = {
    id, order: orderKey, orderName: o.name, email: o.email, createdAt: new Date().toISOString(),
    name: clean(b.name, 40) || 'Client', company: clean(b.company, 60) || undefined, city: clean(b.city, 40) || undefined,
    rating, text, slugs: o.slugs || [], photoId, showInGallery: b.gallery === true && !!photoId, status: 'en_attente', code,
  };
  const c: RelanceCode = { code, rate: RELANCE_RATE, email: o.email, avis: id, expiresAt: new Date(Date.now() + REVIEW_CODE_DAYS * DAY).toISOString() };
  await putJSON('codes', code, c);
  await putJSON('avis', id, rv);
  o.avisId = id; await putJSON('commandes', orderKey, o);
  await sendMail({
    to: o.email, subject: `Merci ! Votre code -10 % : ${code}`,
    html: layout({ title: 'Merci pour votre avis', intro: `Voici votre code <b>${esc(code)}</b> : -10 % sur votre prochaine commande, valable jusqu'au ${new Date(c.expiresAt).toLocaleDateString('fr-FR')}. À saisir dans le panier.`, cta: ['Commander à nouveau', o.recommander || SITE_URL] }),
  }).catch(() => {});
  return { code };
}

/** Avis publiés (cache unique, reconstruit à chaque modération). */
export const publishedReviews = async (): Promise<PublicReview[]> => (await getJSON<PublicReview[]>('avis-publies', 'tous').catch(() => null)) || [];

export async function listReviews(): Promise<Review[]> {
  const all: Review[] = [];
  for (const k of await listKeys('avis')) { const r = await getJSON<Review>('avis', k); if (r) all.push(r); }
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function moderate(id: string, status: 'publie' | 'refuse', reply?: string) {
  const r = await getJSON<Review>('avis', id);
  if (!r) return null;
  r.status = status; r.reply = reply?.trim().slice(0, 600) || r.reply;
  await putJSON('avis', id, r);
  const pub = (await listReviews()).filter((x) => x.status === 'publie')
    .map(({ id, name, company, city, rating, text, slugs, createdAt, reply, photoId, showInGallery }) => ({ id, name, company, city, rating, text, slugs, createdAt, reply, photoId: showInGallery ? photoId : undefined }));
  await putJSON('avis-publies', 'tous', pub);
  return r;
}

/** Note moyenne et nombre d'avis (tous produits, ou un produit). */
export function stats(list: PublicReview[], slug?: string) {
  const l = slug ? list.filter((r) => r.slugs.includes(slug)) : list;
  return { count: l.length, avg: l.length ? Math.round((l.reduce((a, r) => a + r.rating, 0) / l.length) * 10) / 10 : 0, list: l };
}
