// Branchement Shopify (Storefront API) : le site garde son design et son configurateur,
// Shopify gère le panier, le paiement, les commandes et le back office.
//
// Variables d'environnement :
//   SHOPIFY_STORE_DOMAIN       ex. alwaan.myshopify.com
//   SHOPIFY_STOREFRONT_TOKEN   jeton public Storefront (Back office → Applications → Headless)
import { COLOR_NAMES, ZONES, getProduct, zonesFor, type Zone } from './catalog';
import { cartTotals, lineFull, qtyOf, reworkLogos, round, type LineConfig } from './pricing';
import { adminEnabled, createExactDiscount } from './shopifyAdmin';
import { SITE_URL } from './site';

const API_VERSION = '2025-01';

export const shopifyEnabled = () => !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const r = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN! },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(`Shopify : ${JSON.stringify(j.errors || r.status)}`);
  return j.data as T;
}

type Variant = { id: string; availableForSale: boolean; selectedOptions: { name: string; value: string }[] };

/** Variantes d'un produit (par handle = slug du site). */
async function variantsOf(handle: string): Promise<Variant[]> {
  const d = await storefront<{ product: { variants: { nodes: Variant[] } } | null }>(
    `query($h: String!) { product(handle: $h) { variants(first: 250) { nodes { id availableForSale selectedOptions { name value } } } } }`,
    { h: handle },
  );
  if (!d.product) throw new Error(`Produit introuvable dans Shopify : ${handle}`);
  return d.product.variants.nodes;
}

const opt = (v: Variant, name: string) => v.selectedOptions.find((o) => o.name === name)?.value;

/**
 * Les marquages sont des produits Shopify à part (« marquage-heart »…), facturés par pièce marquée.
 * Quand le prix de la zone diffère du prix standard (cœur et dos à 5 € sur les textiles vendus plus de 25 € HT),
 * on utilise le produit « marquage-<zone>-premium ».
 */
export const markHandle = (z: Zone) => `marquage-${z.id}${z.price !== ZONES.find((x) => x.id === z.id)?.price ? '-premium' : ''}`;

export type CartLineInput = { merchandiseId: string; quantity: number; attributes: { key: string; value: string }[] };

/** Transforme les lignes du configurateur en lignes de panier Shopify. */
export async function toShopifyLines(lines: LineConfig[], origin = SITE_URL, expressAmount = 0): Promise<CartLineInput[]> {
  const out: CartLineInput[] = [];
  const cache = new Map<string, Variant[]>();
  const vs = async (h: string) => { if (!cache.has(h)) cache.set(h, await variantsOf(h)); return cache.get(h)!; };

  for (const [i, l] of lines.entries()) {
    const p = getProduct(l.slug)!;
    const color = COLOR_NAMES[l.color];
    const group = `Article ${i + 1} · ${p.name}`;
    const attrs = [
      { key: 'Groupe', value: group },
      { key: 'Emplacements', value: zonesFor(getProduct(l.slug)!).filter((z) => l.zones.includes(z.id)).map((z) => `${z.name} (${z.size})`).join(' + ') },
      { key: 'Logo', value: l.logoStatus === 'text' ? 'Aucun : texte seul' : `Fourni${l.logoName ? ` (${l.logoName})` : ''}${l.logoLowRes ? ' · PETITE DÉFINITION acceptée par le client' : ''}` },
      ...(l.mockupId ? [{ key: 'Maquette validée (BAT)', value: `${origin}/api/logo/${l.mockupId}` }, { key: 'BAT validé le', value: new Date(l.approvedAt || Date.now()).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) }] : []),
      ...(l.logoId ? [{ key: 'Fichier logo à imprimer', value: `${origin}/api/logo/${l.logoId}` }] : []),
      ...(l.logoCut && l.logoCut !== 'none' ? [{ key: 'Détourage', value: l.logoCut === 'all' ? 'Fond retiré, intérieur compris (validé sur la maquette)' : 'Fond retiré automatiquement (validé sur la maquette)' }] : []),
      ...(l.logoSourceId && l.logoSourceId !== l.logoId ? [{ key: 'Fichier d\'origine du client', value: `${origin}/api/logo/${l.logoSourceId}` }] : []),
      ...(l.text ? [{ key: 'Texte', value: l.text }] : []),
      ...(l.logoRework ? [{ key: 'Retouche graphiste', value: 'OUI : NE PAS IMPRIMER avant validation du client' }] : []),
      ...(l.reworkId ? [{ key: 'Dossier retouche (atelier)', value: `${origin}/atelier/retouche/${l.reworkId}` }] : []),
    ];
    const variants = await vs(p.slug);
    for (const [size, q] of Object.entries(l.qty)) {
      if (!q) continue;
      const shopSize = size === 'Total' ? undefined : size;
      const v = variants.find((x) => opt(x, 'Couleur') === color && (!shopSize || opt(x, 'Taille') === shopSize))
        ?? variants.find((x) => opt(x, 'Couleur') === color);
      if (!v) throw new Error(`Variante introuvable : ${p.name} ${color} ${size}`);
      out.push({ merchandiseId: v.id, quantity: q, attributes: size === 'Total' ? [...attrs, { key: 'Tailles', value: 'À préciser avant production' }] : attrs });
    }
    const pieces = qtyOf(l);
    for (const z of zonesFor(p).filter((x) => l.zones.includes(x.id))) {
      const [mv] = await vs(markHandle(z));
      if (!mv) throw new Error(`Produit de marquage introuvable dans Shopify : ${markHandle(z)}`);
      out.push({ merchandiseId: mv.id, quantity: pieces, attributes: [{ key: 'Groupe', value: group }] });
    }
  }
  // Retouche du logo par le graphiste : un forfait par logo, rattaché au premier article qui le porte.
  for (const i of reworkLogos(lines)) {
    const [rv] = await vs(REWORK_HANDLE);
    if (!rv) throw new Error(`Produit introuvable dans Shopify : ${REWORK_HANDLE}`);
    out.push({ merchandiseId: rv.id, quantity: 1, attributes: [{ key: 'Groupe', value: `Article ${i + 1} · ${getProduct(lines[i].slug)!.name}` }] });
  }
  // Production express : un produit par palier de prix (production-express-15, -20, -30, -60).
  if (expressAmount) {
    const [ev] = await vs(expressHandle(expressAmount));
    if (!ev) throw new Error(`Produit introuvable dans Shopify : ${expressHandle(expressAmount)}`);
    out.push({ merchandiseId: ev.id, quantity: 1, attributes: [{ key: 'Production', value: 'EXPRESS' }] });
  }
  return out;
}
export const REWORK_HANDLE = 'retouche-logo';
export const expressHandle = (amount: number) => `production-express-${amount}`;

/**
 * Crée le panier Shopify et renvoie l'adresse de paiement.
 * Le prix payé doit être exactement celui affiché sur le site : Shopify facture les prix catalogue,
 * on applique donc un code unique du montant de l'écart (paliers de quantité, pack, code promo),
 * puis on vérifie le sous-total obtenu avant d'envoyer le client au paiement.
 */
export async function createShopifyCheckout(lines: LineConfig[], opts: { promo?: string | null; note?: string; origin?: string; attributes?: Record<string, string>; lang?: 'fr' | 'en'; express?: boolean; reseller?: boolean } = {}) {
  const t = cartTotals(lines, opts.promo, opts.express, opts.reseller);
  const shopLines = await toShopifyLines(lines, opts.origin, t.express);
  const catalogue = round(lines.reduce((a, l) => a + lineFull(l), 0) + t.rework + t.express);
  const expected = round(t.goods - t.discount + t.express - t.reseller); // montant des articles affiché sur le site, HT
  const gap = round(catalogue - expected);

  let codes: string[] = [];
  if (gap > 0.009) {
    if (!adminEnabled()) throw new Error('Remise exacte indisponible : identifiants Admin Shopify manquants');
    codes = [await createExactDiscount(gap, `Remise quantité site · ${expected.toFixed(2)} € HT`)];
  }

  const d = await storefront<{ cartCreate: { cart: { checkoutUrl: string; discountCodes: { code: string; applicable: boolean }[]; cost: { subtotalAmount: { amount: string } }; discountAllocations: { discountedAmount: { amount: string } }[] } | null; userErrors: { message: string }[] } }>(
    // Paiement en anglais pour /en (la langue anglaise doit être activée dans Shopify, sinon le paiement reste en français).
    `mutation($input: CartInput!) ${opts.lang === 'en' ? '@inContext(language: EN) ' : ''}{ cartCreate(input: $input) { cart { checkoutUrl discountCodes { code applicable } cost { subtotalAmount { amount } } discountAllocations { discountedAmount { amount } } } userErrors { message } } }`,
    { input: { lines: shopLines, discountCodes: codes, note: opts.note, buyerIdentity: { countryCode: 'FR' }, attributes: Object.entries(opts.attributes || {}).map(([key, value]) => ({ key, value })) } },
  );
  const cart = d.cartCreate.cart;
  if (!cart) throw new Error(d.cartCreate.userErrors.map((e) => e.message).join(', '));
  if (codes.length && !cart.discountCodes.every((c) => c.applicable)) throw new Error('La remise exacte n\'a pas été acceptée par Shopify');

  // Contrôle final : sous-total Shopify − remise = montant affiché (tolérance 2 centimes d'arrondi).
  const discounted = cart.discountAllocations.reduce((a, x) => a + Number(x.discountedAmount.amount), 0);
  const charged = round(Number(cart.cost.subtotalAmount.amount) - (codes.length && discounted === 0 ? gap : discounted));
  if (Math.abs(charged - expected) > 0.02) throw new Error(`Écart de prix : Shopify ${charged} € / site ${expected} €`);
  return cart.checkoutUrl;
}
