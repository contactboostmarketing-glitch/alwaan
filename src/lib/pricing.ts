// Calcul des prix. Le même code tourne dans le navigateur (affichage) et sur le serveur (paiement),
// le serveur ne fait jamais confiance aux montants envoyés par le client.
import {
  FREE_SHIPPING_HT, PACK_DISCOUNT, PROMO_CODES, SHIPPING_HT, VAT, getProduct, tierFor, zonesFor,
} from './catalog';

export type LogoStatus = 'uploaded' | 'create' | 'later';

export type LineConfig = {
  slug: string;
  color: string;
  zones: string[];
  qty: Record<string, number>;
  text?: string;
  logo?: string; // aperçu (data URL) côté navigateur ; le fichier d'origine sera stocké côté serveur
  logoName?: string;
  logoId?: string; // fichier d'origine stocké côté serveur (/api/logo/<id>)
  logoStatus: LogoStatus;
  pack?: boolean;
};

export const qtyOf = (l: Pick<LineConfig, 'qty'>) => Object.values(l.qty).reduce((a, b) => a + (b > 0 ? Math.floor(b) : 0), 0);

export function unitBase(l: Pick<LineConfig, 'slug' | 'zones'>): number {
  const prod = getProduct(l.slug);
  if (!prod) throw new Error(`Produit inconnu : ${l.slug}`);
  const valid = zonesFor(prod);
  return prod.price + valid.filter((z) => l.zones.includes(z.id)).reduce((a, z) => a + z.price, 0);
}

export function unitPrice(l: LineConfig): number {
  return round(unitBase(l) * (1 - tierFor(qtyOf(l))[1]) * (l.pack ? 1 - PACK_DISCOUNT : 1));
}
export const lineTotal = (l: LineConfig) => round(unitPrice(l) * qtyOf(l));
export const lineFull = (l: LineConfig) => round(unitBase(l) * qtyOf(l));

export function cartTotals(lines: LineConfig[], promo?: string | null) {
  const goods = round(lines.reduce((a, l) => a + lineTotal(l), 0));
  const rate = promo ? PROMO_CODES[promo.toUpperCase()] ?? 0 : 0;
  const discount = round(goods * rate);
  const net = goods - discount;
  const shipping = !lines.length || net >= FREE_SHIPPING_HT ? 0 : SHIPPING_HT;
  const ht = round(net + shipping);
  const vat = round(ht * VAT);
  const saved = round(lines.reduce((a, l) => a + lineFull(l), 0) - goods + discount);
  return { goods, discount, shipping, ht, vat, ttc: round(ht + vat), saved, remainingForFree: Math.max(0, FREE_SHIPPING_HT - net) };
}

export const round = (n: number) => Math.round(n * 100) / 100;
export const eur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
