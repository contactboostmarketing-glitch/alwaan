// Calcul des prix. Le même code tourne dans le navigateur (affichage) et sur le serveur (paiement),
// le serveur ne fait jamais confiance aux montants envoyés par le client.
import {
  FREE_SHIPPING_HT, PROMO_CODES, RESELLER_RATE, REWORK_FEE, SHIPPING_HT, expressFee, VAT, getProduct, tierFor, zonesFor,
} from './catalog';

/** uploaded = logo fourni ; text = pas de logo, seulement un texte imprimé. */
export type LogoStatus = 'uploaded' | 'text';

export type LineConfig = {
  slug: string;
  color: string;
  zones: string[];
  qty: Record<string, number>;
  text?: string;
  logo?: string; // aperçu (data URL) côté navigateur ; le fichier d'origine est stocké côté serveur (logoId)
  logoName?: string;
  logoId?: string; // fichier à imprimer (détouré si demandé), stocké côté serveur (/api/logo/<id>)
  logoSourceId?: string; // fichier d'origine envoyé par le client
  logoCut?: 'edges' | 'all' | 'none'; // détourage choisi
  logoRework?: boolean; // logo retravaillé par notre graphiste (forfait REWORK_FEE par logo)
  reworkId?: string; // dossier de retouche créé au paiement (côté serveur)
  logoStatus: LogoStatus;
  logoLowRes?: boolean; // logo de faible définition, accepté en connaissance de cause
  mockupId?: string; // maquette validée par le client (BAT), image stockée côté serveur
  approvedAt?: string;
  pack?: boolean; // ajouté depuis une suggestion « même logo » (information, sans remise propre)
};

export const qtyOf = (l: Pick<LineConfig, 'qty'>) => Object.values(l.qty).reduce((a, b) => a + (b > 0 ? Math.floor(b) : 0), 0);

function parts(l: Pick<LineConfig, 'slug' | 'zones'>) {
  const prod = getProduct(l.slug);
  if (!prod) throw new Error(`Produit inconnu : ${l.slug}`);
  const picked = zonesFor(prod).filter((z) => l.zones.includes(z.id));
  const sum = (zs: typeof picked) => zs.reduce((a, z) => a + z.price, 0);
  // fixed : zone à prix fixe (grand devant), sans remise de quantité.
  return { garment: prod.price, marking: sum(picked.filter((z) => !z.fixed)), fixed: sum(picked.filter((z) => z.fixed)) };
}

/** Prix unitaire sans remise : vêtement + marquages. */
export function unitBase(l: Pick<LineConfig, 'slug' | 'zones'>): number {
  const { garment, marking, fixed } = parts(l);
  return round(garment + marking + fixed);
}

/** Prix unitaire pour `pool` pièces portant le même logo : la remise ne porte que sur le marquage (hors zones à prix fixe). */
export function unitAt(l: Pick<LineConfig, 'slug' | 'zones'>, pool: number): number {
  const { garment, marking, fixed } = parts(l);
  return round(garment + fixed + marking * (1 - tierFor(pool)[1]));
}

/** Clé du logo : les pièces au même logo (ou au même texte) cumulent leurs quantités pour la remise marquage. */
export const logoKey = (l: Pick<LineConfig, 'logoId' | 'logoName' | 'text' | 'logoStatus' | 'slug'>) =>
  l.logoId || (l.logoStatus === 'text' ? `t:${(l.text || '').trim().toLowerCase()}` : l.logoName ? `n:${l.logoName}` : `s:${l.slug}`);

/** Nombre de pièces au même logo dans tout le panier, pour chaque ligne. */
export function pools(lines: LineConfig[]): number[] {
  const by = new Map<string, number>();
  for (const l of lines) by.set(logoKey(l), (by.get(logoKey(l)) || 0) + qtyOf(l));
  return lines.map((l) => by.get(logoKey(l)) || 0);
}

export const unitPrice = (l: LineConfig, pool = qtyOf(l)) => unitAt(l, pool);
export const lineTotal = (l: LineConfig, pool = qtyOf(l)) => round(unitAt(l, pool) * qtyOf(l));
export const lineFull = (l: LineConfig) => round(unitBase(l) * qtyOf(l));

/** Logos à retravailler par le graphiste : un forfait par logo, même s'il est sur plusieurs vêtements. */
export function reworkLogos(lines: LineConfig[]): number[] {
  const seen = new Set<string>(), first: number[] = [];
  lines.forEach((l, i) => { if (l.logoRework && l.logoStatus === 'uploaded' && !seen.has(logoKey(l))) { seen.add(logoKey(l)); first.push(i); } });
  return first; // index de la première ligne de chaque logo concerné
}

export function cartTotals(lines: LineConfig[], promo?: string | null, withExpress = false, isReseller = false) {
  const pool = pools(lines);
  const pieces = lines.reduce((a, l) => a + qtyOf(l), 0);
  // Production express : forfait selon le nombre total de pièces, hors remise et hors seuil de livraison offerte.
  const express = withExpress && pieces ? expressFee(pieces) : 0;
  const rework = round(reworkLogos(lines).length * REWORK_FEE);
  const goods = round(lines.reduce((a, l, i) => a + lineTotal(l, pool[i]), 0) + rework);
  const rate = promo ? PROMO_CODES[promo.toUpperCase()] ?? 0 : 0;
  const discount = round(goods * rate);
  const net = goods - discount;
  const shipping = !lines.length || net >= FREE_SHIPPING_HT ? 0 : SHIPPING_HT;
  // Revendeur validé : -10 % sur tout (articles, retouche, express), hors livraison.
  const reseller = isReseller ? round((net + express) * RESELLER_RATE) : 0;
  const ht = round(net + express - reseller + shipping);
  const vat = round(ht * VAT);
  const saved = round(lines.reduce((a, l) => a + lineFull(l), 0) + rework - goods + discount + reseller);
  return { reseller, express, pieces, rework, goods, discount, shipping, ht, vat, ttc: round(ht + vat), saved, remainingForFree: Math.max(0, FREE_SHIPPING_HT - net) };
}

export const round = (n: number) => Math.round(n * 100) / 100;
export const eur = (n: number, lang: 'fr' | 'en' = 'fr') => n.toLocaleString(lang === 'en' ? 'en-IE' : 'fr-FR', { style: 'currency', currency: 'EUR' });
