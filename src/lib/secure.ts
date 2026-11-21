// Outils de sécurité partagés : comparaison de clés à temps constant, signature de liens.
import { createHmac, timingSafeEqual } from 'crypto';

/** Compare deux secrets sans fuite par le temps de réponse. */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const secret = () => process.env.SESSION_SECRET || process.env.SHOPIFY_CLIENT_SECRET || 'dev-only';
/** Signature d'un lien privé (ex. liste nominative jointe à la commande pour l'atelier). */
export const sign = (purpose: string, id: string) => createHmac('sha256', secret()).update(`${purpose}:${id}`).digest('hex').slice(0, 32);
export const checkSig = (purpose: string, id: string, sig: string | null) => safeEqual(sig, sign(purpose, id));
