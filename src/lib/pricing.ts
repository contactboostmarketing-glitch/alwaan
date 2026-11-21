// Calcul des prix. Le même code tourne dans le navigateur (affichage) et sur le serveur (paiement),
// le serveur ne fait jamais confiance aux montants envoyés par le client.
import {
  DESIGN_FEE, FREE_SHIPPING_HT, NAME_FEE, NAMES_MIN, promoRate, RESELLER_RATE, REWORK_FEE, SHIPPING_HT, expressFee, VAT, getProduct, tierFor, zonesFor,
} from './catalog';

/** uploaded = logo fourni ; text = pas de logo, seulement un texte imprimé. */
export type LogoStatus = 'uploaded' | 'text' | 'blank'; // blank : textile vierge, sans marquage

export type LineConfig = {
  slug: string;
  color: string;
  zones: string[];
  qty: Record<string, number>;
  text?: string;
  text2?: string; // 2e ligne de texte
  textFont?: string; // police du texte (TEXT_FONTS)
  textColor?: string; // couleur du texte (#rrggbb), sinon automatique selon le textile
  zoneText?: Record<string, string>; // emplacement → texte imprimé À LA PLACE du logo (ex. le dos : adresse du site)
  logo?: string; // aperçu (data URL) côté navigateur ; le fichier d'origine est stocké côté serveur (logoId)
  logoName?: string;
  logoId?: string; // fichier à imprimer (détouré si demandé), stocké côté serveur (/api/logo/<id>)
  logoSourceId?: string; // fichier d'origine envoyé par le client
  logoCut?: 'edges' | 'all' | 'none'; // détourage choisi
  logoRework?: boolean; // logo retravaillé par notre graphiste (forfait REWORK_FEE par logo)
  reworkId?: string; // dossier de retouche créé au paiement (côté serveur)
  teamId?: string; // liste d'équipe (noms, prénoms, tailles) d'où vient cette ligne
  printNames?: boolean; // prénom imprimé sur chaque pièce (au-delà de NAMES_MIN pièces)
  shop?: string; // boutique club / entreprise d'où vient l'article
  designText?: string; // textes saisis dans le design (pour l'atelier)
  design?: string; // design particulier prêt à personnaliser (supplément DESIGN_FEE par pièce)
  logoStatus: LogoStatus;
  logoRatio?: number; // largeur / hauteur du logo, pour ses dimensions réelles d'impression
  logoMono?: string; // logo passé en une couleur (#ffffff…) pour ressortir sur le textile
  logoLowRes?: boolean; // logo de faible définition, accepté en connaissance de cause
  mockupId?: string; // maquette validée par le client (BAT), image stockée côté serveur
  approvedAt?: string;
  pack?: boolean; // ajouté depuis une suggestion « même logo » (information, sans remise propre)
};

export const qtyOf = (l: Pick<LineConfig, 'qty'>) => Object.values(l.qty).reduce((a, b) => a + (b > 0 ? Math.floor(b) : 0), 0);

/** Le prénom imprimé n'est proposé qu'au-delà de NAMES_MIN pièces sur la ligne. */
export const namesAllowed = (l: Pick<LineConfig, 'qty'>) => qtyOf(l) > NAMES_MIN;

function parts(l: Pick<LineConfig, 'slug' | 'zones'> & { printNames?: boolean; qty?: Record<string, number>; design?: string }) {
  const prod = getProduct(l.slug);
  if (!prod) throw new Error(`Produit inconnu : ${l.slug}`);
  const picked = zonesFor(prod).filter((z) => l.zones.includes(z.id));
  const sum = (zs: typeof picked) => zs.reduce((a, z) => a + z.price, 0);
  // fixed : zone à prix fixe (grand devant), sans remise de quantité.
  const names = l.printNames && l.qty && namesAllowed({ qty: l.qty }) ? NAME_FEE : 0;
  const design = l.design ? DESIGN_FEE : 0;
  return { garment: prod.price, marking: sum(picked.filter((z) => !z.fixed)), fixed: sum(picked.filter((z) => z.fixed)) + names + design };
}

/** Prix unitaire sans remise : vêtement + marquages. */
export function unitBase(l: Pick<LineConfig, 'slug' | 'zones'> & { printNames?: boolean; qty?: Record<string, number>; design?: string }): number {
  const { garment, marking, fixed } = parts(l);
  return round(garment + marking + fixed);
}

/** Prix unitaire pour `pool` pièces portant le même logo : la remise ne porte que sur le marquage (hors zones à prix fixe). */
export function unitAt(l: Pick<LineConfig, 'slug' | 'zones'> & { printNames?: boolean; qty?: Record<string, number>; design?: string }, pool: number): number {
  const { garment, marking, fixed } = parts(l);
  return round(garment + fixed + marking * (1 - tierFor(pool)[1]));
}

/** Clé du logo : les pièces au même logo (ou au même texte) cumulent leurs quantités pour la remise marquage. */
export const logoKey = (l: Pick<LineConfig, 'logoId' | 'logoName' | 'text' | 'logoStatus' | 'slug'>) =>
  l.logoStatus === 'blank' ? `b:${l.slug}` : l.logoId || (l.logoStatus === 'text' ? `t:${(l.text || '').trim().toLowerCase()}` : l.logoName ? `n:${l.logoName}` : `s:${l.slug}`);

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

/** voucher : code parrain ou bon d'achat (montant fixe HT, à partir d'un minimum d'articles). */
function totalsWith(lines: LineConfig[], promo?: string | null, withExpress = false, isReseller = false, voucher?: { amount: number; min: number } | null) {
  const pool = pools(lines);
  const pieces = lines.reduce((a, l) => a + qtyOf(l), 0);
  // Production express : forfait selon le nombre total de pièces, hors remise et hors seuil de livraison offerte.
  const express = withExpress && pieces ? expressFee(pieces) : 0;
  const rework = round(reworkLogos(lines).length * REWORK_FEE);
  const goods = round(lines.reduce((a, l, i) => a + lineTotal(l, pool[i]), 0) + rework);
  const rate = promoRate(promo);
  const discount = round(goods * rate);
  const net = goods - discount;
  const shipping = !lines.length || net >= FREE_SHIPPING_HT ? 0 : SHIPPING_HT;
  // Revendeur validé : -10 % sur tout (articles, retouche, express), hors livraison.
  const reseller = isReseller ? round((net + express) * RESELLER_RATE) : 0;
  const voucherOff = voucher && net >= voucher.min ? Math.min(voucher.amount, round(net + express - reseller)) : 0;
  const ht = round(net + express - reseller - voucherOff + shipping);
  const vat = round(ht * VAT);
  const saved = round(lines.reduce((a, l) => a + lineFull(l), 0) + rework - goods + discount + reseller);
  return { voucher: voucherOff, reseller, express, pieces, rework, goods, discount, shipping, ht, vat, ttc: round(ht + vat), saved, remainingForFree: Math.max(0, FREE_SHIPPING_HT - net) };
}

export type Advantage = 'promo' | 'revendeur' | 'bon' | null;
/**
 * Un seul avantage par commande (CGV) : code promo, remise revendeur ou code parrain / bon d'achat.
 * Si plusieurs sont présents, on applique automatiquement le plus intéressant pour le client.
 */
export function cartTotals(lines: LineConfig[], promo?: string | null, withExpress = false, isReseller = false, voucher?: { amount: number; min: number } | null) {
  const base = totalsWith(lines, null, withExpress);
  const options: [Advantage, ReturnType<typeof totalsWith>][] = [];
  if (promo && promoRate(promo)) options.push(['promo', totalsWith(lines, promo, withExpress)]);
  if (voucher) options.push(['bon', totalsWith(lines, null, withExpress, false, voucher)]);
  if (isReseller) options.push(['revendeur', totalsWith(lines, null, withExpress, true)]);
  // Seuls les avantages qui baissent vraiment le total comptent ; à égalité, la remise revendeur l'emporte (le code reste utilisable).
  const useful = options.filter(([, t]) => t.ht < base.ht);
  const [applied, t] = useful.reduce<[Advantage, typeof base]>((best, o) => (o[1].ht <= best[1].ht ? o : best), [null, base]);
  return { ...t, applied, skipped: useful.length > 1 };
}
/** Avantages réellement retenus (à transmettre au paiement et aux attributs de commande). */
export function keptAdvantages(lines: LineConfig[], promo: string | null, withExpress: boolean, isReseller: boolean, voucher: { amount: number; min: number } | null) {
  const { applied } = cartTotals(lines, promo, withExpress, isReseller, voucher);
  return { promo: applied === 'promo' ? promo : null, reseller: applied === 'revendeur', voucher: applied === 'bon' ? voucher : null };
}

export const round = (n: number) => Math.round(n * 100) / 100;
export const eur = (n: number, lang: 'fr' | 'en' = 'fr') => n.toLocaleString(lang === 'en' ? 'en-IE' : 'fr-FR', { style: 'currency', currency: 'EUR' });
