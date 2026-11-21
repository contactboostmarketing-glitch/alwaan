// Voix du client : tout ce qui nourrit le contenu du site (et l'agent SEO).
//  - questions posées au conseiller en ligne (anonymisées, 12 mois) ;
//  - demandes de devis du formulaire ;
//  - carnet de retours saisis par l'atelier (litiges, messages WhatsApp ou email, téléphone, suggestions, photos).
import { randomBytes } from 'crypto';
import { getJSON, listKeys, putJSON } from './blobStore';

/** Retire les données personnelles d'un texte libre (emails, téléphones, adresses web, IBAN, numéros longs). */
export function redact(s: string): string {
  return s
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/\bFR\d{2}[\d\sA-Z]{10,30}\b/gi, '[iban]')
    .replace(/(?:\+33|\+32|0)\s?[1-9](?:[\s.-]?\d{2}){4}/g, '[téléphone]')
    .replace(/https?:\/\/\S+/g, '[lien]')
    .replace(/\b\d{9,}\b/g, '[numéro]')
    .trim();
}
const id = () => `${new Date().toISOString().slice(0, 10)}-${randomBytes(4).toString('hex')}`;

export type Question = { at: string; text: string; page?: string; lang?: string; handoff?: boolean };
export async function logQuestion(q: Omit<Question, 'at'>) {
  const text = redact(q.text).slice(0, 600);
  if (text.length < 3) return;
  await putJSON('questions', id(), { ...q, text, at: new Date().toISOString() }).catch(() => {});
}

export type Demande = { at: string; company?: string; name: string; email: string; phone?: string; need: string };
export const addDemande = async (d: Omit<Demande, 'at'>) => { const k = id(); await putJSON('demandes', k, { ...d, at: new Date().toISOString() }); return k; };

export const RETOUR_TYPES = ['question', 'demande', 'litige', 'retour', 'compliment', 'suggestion'] as const;
export const RETOUR_CANAUX = ['whatsapp', 'email', 'telephone', 'chat', 'avis-google', 'salon', 'autre'] as const;
export type Retour = { id: string; at: string; type: (typeof RETOUR_TYPES)[number]; canal: (typeof RETOUR_CANAUX)[number]; text: string; slugs: string[]; photoId?: string; publicPhoto?: boolean; resolved?: boolean };
export async function addRetour(r: Omit<Retour, 'id' | 'at'>) {
  const x: Retour = { ...r, id: id(), at: new Date().toISOString(), text: r.text.slice(0, 3000) };
  await putJSON('retours', x.id, x);
  return x;
}

/** Lecture d'un magasin, du plus récent au plus ancien, limité à `days` jours. */
export async function recent<T extends { at: string }>(store: string, days = 365, max = 500): Promise<T[]> {
  const since = Date.now() - days * 864e5;
  const keys = (await listKeys(store)).sort().reverse().slice(0, max * 2);
  const out: T[] = [];
  for (const k of keys) { const x = await getJSON<T>(store, k); if (x && Date.parse(x.at) >= since) out.push(x); if (out.length >= max) break; }
  return out;
}
