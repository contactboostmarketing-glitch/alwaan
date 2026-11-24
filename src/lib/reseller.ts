// Revendeurs : le client envoie son Kbis depuis son espace, l'équipe valide, il bénéficie alors de -10 % sur tout.
import { createHash } from 'crypto';
import { getJSON, listKeys, putJSON } from './blobStore';

export { RESELLER_RATE } from './catalog';
export type ResellerStatus = 'en_attente' | 'valide' | 'refuse';
export type Reseller = { email: string; company: string; siret: string; kbisId: string; status: ResellerStatus; createdAt: string; decidedAt?: string; note?: string };

const key = (email: string) => createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32);
export const getReseller = (email: string) => getJSON<Reseller>('revendeurs', key(email));
export const saveReseller = (r: Reseller) => putJSON('revendeurs', key(r.email), r);
export const isReseller = async (email?: string | null) => !!email && (await getReseller(email))?.status === 'valide';
export async function listResellers(): Promise<Reseller[]> {
  const all = await Promise.all((await listKeys('revendeurs')).map((k) => getJSON<Reseller>('revendeurs', k)));
  return all.filter((r): r is Reseller => !!r).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Devis rattachés à l'email du client (pour les retrouver dans son espace).
export async function addQuoteToEmail(email: string, id: string) {
  const k = key(email), list = (await getJSON<string[]>('devis-clients', k)) || [];
  if (!list.includes(id)) await putJSON('devis-clients', k, [id, ...list].slice(0, 100));
}
export const quotesOfEmail = async (email: string) => (await getJSON<string[]>('devis-clients', key(email))) || [];
