// Paniers enregistrés : commande passée (pour « Recommander » en 1 clic) ou devis (pour le reprendre et payer).
// On garde la configuration exacte (vêtements, couleurs, emplacements, logo et maquette validée) sans aperçu lourd.
import { randomBytes } from 'crypto';
import { getJSON, putJSON } from './blobStore';
import type { LineConfig } from './pricing';

export type SavedCart = {
  id: string;
  kind: 'commande' | 'devis' | 'relance' | 'partage';
  createdAt: string;
  lines: LineConfig[];
  promo?: string | null;
  express?: boolean;
  reseller?: boolean;
  quote?: { number: string; company?: string; legal?: string; email?: string; validUntil: string };
};
export const CART_ID = /^[a-f0-9]{24}$/;

export async function saveCart(c: Omit<SavedCart, 'id' | 'createdAt'>): Promise<SavedCart> {
  const saved: SavedCart = { ...c, id: randomBytes(12).toString('hex'), createdAt: new Date().toISOString(), lines: c.lines.map(({ logo, ...l }) => l) };
  await putJSON('paniers', saved.id, saved);
  return saved;
}
export const getCart = (id: string) => (CART_ID.test(id) ? getJSON<SavedCart>('paniers', id) : Promise.resolve(null));
