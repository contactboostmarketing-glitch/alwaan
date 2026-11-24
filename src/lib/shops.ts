// Boutiques club / entreprise : page privée aux couleurs du club, chaque membre commande et paie lui-même,
// le club reçoit SHOP_COMMISSION des ventes HT en bons d'achat.
import { createHash } from 'crypto';
import { getJSON, putJSON } from './blobStore';

export type ShopItem = { slug: string; color: string; zones: string[]; mockupId: string };
export type Shop = {
  slug: string; name: string; ownerEmail: string; logoId: string; items: ShopItem[]; createdAt: string; active: boolean;
  stats: { orders: number; revenueHT: number; commission: number; pending: number };
};
export const SHOP_SLUG = /^[a-z0-9-]{3,40}$/;
const h = (email: string) => createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

export const getShop = (slug: string) => (SHOP_SLUG.test(slug) ? getJSON<Shop>('boutiques', slug) : Promise.resolve(null));
export const saveShop = (s: Shop) => putJSON('boutiques', s.slug, s);
export async function addShopToOwner(email: string, slug: string) {
  const list = (await getJSON<string[]>('boutiques-clients', h(email))) || [];
  if (!list.includes(slug)) await putJSON('boutiques-clients', h(email), [slug, ...list]);
}
export async function shopsOf(email: string): Promise<Shop[]> {
  const list = (await getJSON<string[]>('boutiques-clients', h(email))) || [];
  return (await Promise.all(list.map(getShop))).filter((s): s is Shop => !!s);
}
export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
