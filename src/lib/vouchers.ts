// Parrainage et bons d'achat, gérés par le site (et non par des codes Shopify, pour ne jamais
// casser la remise exacte du panier) :
//   REF-XXXXXX : code de parrainage d'un client → le filleul a REFERRAL_REWARD € dès REFERRAL_MIN € HT ;
//   MERCI-XXXXXX : bon de REFERRAL_REWARD € offert au parrain après la 1re commande payée du filleul.
import { createHash, randomBytes } from 'crypto';
import { getJSON, putJSON } from './blobStore';

export const REFERRAL_REWARD = 20, REFERRAL_MIN = 150;
const h = (email: string) => createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
export const referralCodeOf = (email: string) => `REF-${parseInt(h(email).slice(0, 10), 16).toString(36).toUpperCase().slice(0, 6)}`;

export type Bon = { code: string; amount: number; owner: string; from?: string; createdAt: string; usedBy?: string };

/** Enregistre (une fois) la correspondance code de parrainage → email du parrain. */
export async function ensureReferralCode(email: string): Promise<string> {
  const code = referralCodeOf(email);
  if (!(await getJSON('parrains', code))) await putJSON('parrains', code, { email: email.trim().toLowerCase() });
  return code;
}

export type CodeInfo = { kind: 'parrain'; email: string; amount: number; min: number } | { kind: 'bon'; bon: Bon; amount: number; min: number };
export async function lookupCode(raw: string): Promise<CodeInfo | null> {
  const code = raw.trim().toUpperCase();
  if (/^REF-[A-Z0-9]{4,8}$/.test(code)) {
    const p = await getJSON<{ email: string }>('parrains', code);
    return p ? { kind: 'parrain', email: p.email, amount: REFERRAL_REWARD, min: REFERRAL_MIN } : null;
  }
  if (/^MERCI-[A-Z0-9]{6}$/.test(code)) {
    const b = await getJSON<Bon>('bons', code);
    return b && !b.usedBy ? { kind: 'bon', bon: b, amount: b.amount, min: 0 } : null;
  }
  return null;
}

export async function issueBon(owner: string, amount: number, from: string): Promise<Bon> {
  const b: Bon = { code: `MERCI-${randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`, amount, owner: owner.trim().toLowerCase(), from, createdAt: new Date().toISOString() };
  await putJSON('bons', b.code, b);
  const list = (await getJSON<string[]>('bons-clients', h(owner))) || [];
  await putJSON('bons-clients', h(owner), [b.code, ...list].slice(0, 100));
  return b;
}
export async function bonsOf(email: string): Promise<Bon[]> {
  const list = (await getJSON<string[]>('bons-clients', h(email))) || [];
  return (await Promise.all(list.map((c) => getJSON<Bon>('bons', c)))).filter((b): b is Bon => !!b);
}
export async function markBonUsed(code: string, order: string) {
  const b = await getJSON<Bon>('bons', code.toUpperCase());
  if (b && !b.usedBy) await putJSON('bons', b.code, { ...b, usedBy: order });
}
