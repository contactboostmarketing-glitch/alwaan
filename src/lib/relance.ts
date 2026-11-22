// Relance des paniers abandonnés (client qui a laissé son email) :
//  1. tout de suite : « Votre panier vous attend » avec le lien pour le reprendre ;
//  2. 24 h sans activité (ni retour sur le lien, ni commande) : code -10 % à usage unique, valable 7 jours.
// Une commande payée arrête la relance (webhook), le lien de désinscription aussi.
import { randomBytes } from 'crypto';
import { RELANCE_CODE, RELANCE_RATE } from './catalog';
import { getJSON, listKeys, putJSON } from './blobStore';
import { esc, layout, sendMail } from './mail';
import type { LineConfig } from './pricing';
import { saveCart } from './savedCart';
import { sign } from './secure';
import { SITE_URL } from './site';

export type Relance = { id: string; email: string; lang: 'fr' | 'en'; createdAt: string; lastActivity: string; step: 1 | 2; code?: string; done?: 'commande' | 'desinscrit'; log: string[] };
export type RelanceCode = { code: string; rate: number; email: string; relance?: string; avis?: string; expiresAt: string; usedBy?: string };
const DAY = 864e5;

const link = (r: Relance, code?: string) => `${SITE_URL}/recommander/${r.id}?relance=1${code ? `&code=${code}` : ''}`;
const stop = (r: Relance) => `${SITE_URL}/api/relance?stop=${r.id}&sig=${sign('relance', r.id)}`;
const foot = (r: Relance) => `Vous recevez cet email car vous avez demandé à recevoir votre panier. <a href="${stop(r)}" style="color:#5b6478">Ne plus recevoir de relance</a>.`;

export async function createRelance(email: string, lines: LineConfig[], o: { promo?: string | null; express?: boolean; lang?: 'fr' | 'en' }) {
  const saved = await saveCart({ kind: 'relance', lines, promo: o.promo, express: o.express });
  const now = new Date().toISOString();
  const r: Relance = { id: saved.id, email: email.trim().toLowerCase(), lang: o.lang === 'en' ? 'en' : 'fr', createdAt: now, lastActivity: now, step: 1, log: [] };
  const pcs = lines.reduce((a, l) => a + Object.values(l.qty).reduce((x, y) => x + y, 0), 0);
  r.log.push(`email 1 : ${await sendMail({
    to: r.email, subject: 'Votre panier alwaan vous attend',
    html: layout({ title: 'Votre panier est enregistré', intro: `Vos ${pcs} pièce${pcs > 1 ? 's' : ''} et votre maquette validée sont gardées. Reprenez votre commande en un clic, quand vous voulez.`, cta: ['Reprendre mon panier', link(r)], foot: foot(r) }),
  }).catch((e) => `erreur ${(e as Error).message}`)}`);
  await putJSON('relances', r.id, r);
  return r;
}

export const getRelance = (id: string) => (/^[a-f0-9]{24}$/.test(id) ? getJSON<Relance>('relances', id) : Promise.resolve(null));

/** Le client est revenu sur son panier : on repousse l'offre de 24 h. */
export async function touchRelance(id: string) {
  const r = await getRelance(id);
  if (r && !r.done && r.step === 1) { r.lastActivity = new Date().toISOString(); await putJSON('relances', r.id, r); }
}
export async function closeRelance(id: string, why: Relance['done']) {
  const r = await getRelance(id);
  if (r && !r.done) { r.done = why; r.log.push(`${why} ${new Date().toISOString()}`); await putJSON('relances', r.id, r); }
  return r;
}

/** Passage horaire : envoie l'offre -10 % aux paniers sans activité depuis 24 h. */
export async function runRelances(): Promise<string[]> {
  const out: string[] = [];
  for (const id of await listKeys('relances')) {
    const r = await getRelance(id);
    if (!r || r.done || r.step !== 1 || Date.now() - Date.parse(r.lastActivity) < DAY) continue;
    const code = `RETOUR-${randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`;
    if (!RELANCE_CODE.test(code)) continue;
    const c: RelanceCode = { code, rate: RELANCE_RATE, email: r.email, relance: r.id, expiresAt: new Date(Date.now() + 7 * DAY).toISOString() };
    await putJSON('codes', code, c);
    r.step = 2; r.code = code;
    r.log.push(`email 2 : ${await sendMail({
      to: r.email, subject: '-10 % sur votre panier alwaan',
      html: layout({ title: '-10 % pour finaliser votre commande', intro: `Votre panier vous attend toujours. Avec le code <b>${esc(code)}</b>, profitez de <b>10 % de remise</b> sur l'ensemble, valable 7 jours. Le code est déjà appliqué via le bouton.`, cta: ['Commander avec -10 %', link(r, code)], foot: foot(r) }),
    }).catch((e) => `erreur ${(e as Error).message}`)}`);
    await putJSON('relances', r.id, r);
    out.push(`${r.id} → ${code}`);
  }
  return out;
}

/** Code de relance encore valable (non utilisé, non expiré). */
// Codes de bienvenue affichés à l'écran avant l'envoi obligatoire par email : invalidés (émis avant cette date).
const BIENV_SINCE = Date.parse('2026-11-22T18:00:00Z');
export async function validRelanceCode(code: string): Promise<RelanceCode | null> {
  const c = RELANCE_CODE.test(code) ? await getJSON<RelanceCode>('codes', code) : null;
  if (c && code.startsWith('BIENV-') && Date.parse(c.expiresAt) - 30 * DAY < BIENV_SINCE) return null;
  return c && !c.usedBy && Date.parse(c.expiresAt) > Date.now() ? c : null;
}
export async function useRelanceCode(code: string, order: string) {
  const c = RELANCE_CODE.test(code) ? await getJSON<RelanceCode>('codes', code) : null;
  if (c && !c.usedBy) { c.usedBy = order; await putJSON('codes', code, c); if (c.relance) await closeRelance(c.relance, 'commande'); }
}
