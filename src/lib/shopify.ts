// Branchement Shopify (Storefront API) : le site garde son design et son configurateur,
// Shopify gère le panier, le paiement, les commandes et le back office.
//
// Variables d'environnement :
//   SHOPIFY_STORE_DOMAIN       ex. alwaan.myshopify.com
//   SHOPIFY_STOREFRONT_TOKEN   jeton public Storefront (Back office → Applications → Headless)
import { COLOR_NAMES, ZONES, getProduct, zonesFor, type Zone } from './catalog';
import { sign } from './secure';
import { getStock } from './stock';
import { ON_ORDER_DAYS, shortSizes, skey } from './stockTypes';
import { cartTotals, lineFull, namesAllowed, qtyOf, reworkLogos, round, type LineConfig } from './pricing';
import { admin, adminEnabled, createExactDiscount } from './shopifyAdmin';
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
  const stock = await getStock().catch(() => null);

  for (const [i, l] of lines.entries()) {
    const p = getProduct(l.slug)!;
    const color = COLOR_NAMES[l.color];
    const group = `Article ${i + 1} · ${p.name}`;
    const attrs = [
      { key: 'Groupe', value: group },
      { key: 'Emplacements', value: l.logoStatus === 'blank' ? 'Aucun : textile vierge' : zonesFor(getProduct(l.slug)!).filter((z) => l.zones.includes(z.id)).map((z) => `${z.name} (${z.size})`).join(' + ') },
      { key: 'Logo', value: l.logoStatus === 'blank' ? 'Aucun : textile vierge, SANS MARQUAGE' : l.logoStatus === 'text' ? 'Aucun : texte seul' : `Fourni${l.logoName ? ` (${l.logoName})` : ''}${l.logoLowRes ? ' · PETITE DÉFINITION acceptée par le client' : ''}` },
      ...(l.mockupId ? [{ key: 'Maquette validée (BAT)', value: `${origin}/api/logo/${l.mockupId}` }, { key: 'Droits sur le logo', value: 'Confirmés par le client à la validation' }, { key: 'BAT validé le', value: new Date(l.approvedAt || Date.now()).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) }] : []),
      ...(l.logoId ? [{ key: 'Fichier logo à imprimer', value: `${origin}/api/logo/${l.logoId}` }] : []),
      ...(l.logoCut && l.logoCut !== 'none' ? [{ key: 'Détourage', value: l.logoCut === 'all' ? 'Fond retiré, intérieur compris (validé sur la maquette)' : 'Fond retiré automatiquement (validé sur la maquette)' }] : []),
      ...(l.logoSourceId && l.logoSourceId !== l.logoId ? [{ key: 'Fichier d\'origine du client', value: `${origin}/api/logo/${l.logoSourceId}` }] : []),
      ...(l.text ? [{ key: 'Texte', value: `${l.text}${l.text2 ? ` / 2e ligne : ${l.text2}` : ''} · police ${l.textFont || 'oswald'}${l.textColor ? ` · couleur ${l.textColor}` : ''}` }] : []),
      ...(l.zoneText && Object.keys(l.zoneText).length ? [{ key: 'Texte à la place du logo', value: Object.entries(l.zoneText).map(([z, v]) => `${zonesFor(getProduct(l.slug)!).find((x) => x.id === z)?.name || z} : « ${v} »`).join(' · ') }] : []),
      ...(l.design ? [{ key: 'Design particulier', value: `${l.design}${l.designText ? ` · ${l.designText}` : ''}` }] : []),
      ...(l.teamId ? [{ key: 'Liste nominative (nom, prénom, taille)', value: `${origin}/api/equipe/${l.teamId}/liste?sig=${sign('liste', l.teamId)}` }] : []),
      ...(l.printNames && namesAllowed(l) ? [{ key: 'Prénom imprimé', value: 'OUI : prénom de chaque personne sous le logo (voir la liste nominative)' }] : []),
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
      // Stock atelier : clé cachée (préfixe _) pour la déduction au paiement, et mention « sur commande » pour l'atelier.
      const stockAttrs = [{ key: '_stock', value: skey(l.slug, l.color, size) }, ...(shortSizes(stock, l).includes(size) ? [{ key: 'Disponibilité', value: `Sur commande fournisseur (+${ON_ORDER_DAYS} j ouvrés)` }] : [])];
      out.push({ merchandiseId: v.id, quantity: q, attributes: [...attrs, ...stockAttrs, ...(size === 'Total' ? [{ key: 'Tailles', value: 'À préciser avant production' }] : [])] });
    }
    const pieces = qtyOf(l);
    // Design particulier : une ligne « creation-design » par pièce.
    if (l.design) {
      const [dv] = await vs(DESIGN_HANDLE);
      if (!dv) throw new Error(`Produit introuvable dans Shopify : ${DESIGN_HANDLE}`);
      out.push({ merchandiseId: dv.id, quantity: pieces, attributes: [{ key: 'Groupe', value: group }] });
    }
    // Prénom imprimé sur chaque pièce : une ligne « marquage-prenom » par pièce.
    if (l.printNames && namesAllowed(l)) {
      const [nv] = await vs(NAME_HANDLE);
      if (!nv) throw new Error(`Produit de marquage introuvable dans Shopify : ${NAME_HANDLE}`);
      out.push({ merchandiseId: nv.id, quantity: pieces, attributes: [{ key: 'Groupe', value: group }] });
    }
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
export const NAME_HANDLE = 'marquage-prenom';
export const DESIGN_HANDLE = 'creation-design';
export const expressHandle = (amount: number) => `production-express-${amount}`;

/**
 * Crée le panier Shopify et renvoie l'adresse de paiement.
 * Le prix payé doit être exactement celui affiché sur le site : Shopify facture les prix catalogue,
 * on applique donc un code unique du montant de l'écart (paliers de quantité, pack, code promo),
 * puis on vérifie le sous-total obtenu avant d'envoyer le client au paiement.
 */
export async function createShopifyCheckout(lines: LineConfig[], opts: { promo?: string | null; note?: string; origin?: string; attributes?: Record<string, string>; lang?: 'fr' | 'en'; express?: boolean; reseller?: boolean; voucher?: { amount: number; min: number } | null } = {}) {
  const t = cartTotals(lines, opts.promo, opts.express, opts.reseller, opts.voucher);
  const shopLines = await toShopifyLines(lines, opts.origin, t.express);
  const catalogue = round(lines.reduce((a, l) => a + lineFull(l), 0) + t.rework + t.express);
  const expected = round(t.goods - t.discount + t.express - t.reseller - t.voucher); // montant des articles affiché sur le site, HT
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

/**
 * Paiement par virement (pros connectés) : commande provisoire Shopify (« brouillon ») au montant exact du site,
 * envoyée au client avec l'IBAN et la référence. À réception du virement, l'équipe la marque « payée » dans Shopify :
 * elle devient une commande normale (webhook « commande payée » → production).
 * Droits de l'application nécessaires : read_draft_orders, write_draft_orders.
 */
export async function createTransferOrder(lines: LineConfig[], opts: { email: string; promo?: string | null; note?: string; origin?: string; attributes?: Record<string, string>; express?: boolean; reseller?: boolean; voucher?: { amount: number; min: number } | null; iban?: string }) {
  const t = cartTotals(lines, opts.promo, opts.express, opts.reseller, opts.voucher);
  const shopLines = await toShopifyLines(lines, opts.origin, t.express);
  const catalogue = round(lines.reduce((a, l) => a + lineFull(l), 0) + t.rework + t.express);
  const expected = round(t.goods - t.discount + t.express - t.reseller - t.voucher);
  const gap = round(catalogue - expected);
  type R = { draftOrderCreate: { draftOrder: { id: string; name: string; subtotalPriceSet: { shopMoney: { amount: string } }; totalPriceSet: { shopMoney: { amount: string } } } | null; userErrors: { field?: string[]; message: string }[] } };
  const d = await admin<R>(`mutation($i: DraftOrderInput!) { draftOrderCreate(input: $i) { draftOrder { id name subtotalPriceSet { shopMoney { amount } } totalPriceSet { shopMoney { amount } } } userErrors { field message } } }`, { i: {
    email: opts.email,
    lineItems: shopLines.map((l) => ({ variantId: l.merchandiseId, quantity: l.quantity, customAttributes: l.attributes })),
    ...(gap > 0.009 ? { appliedDiscount: { value: gap, valueType: 'FIXED_AMOUNT', title: 'Remise site (quantité, codes, revendeur)' } } : {}),
    shippingLine: { title: t.shipping ? 'Livraison' : 'Livraison offerte', priceWithCurrency: { amount: t.shipping.toFixed(2), currencyCode: 'EUR' } },
    note: `${opts.note || ''} · PAIEMENT PAR VIREMENT : ne pas produire avant réception`.trim(),
    customAttributes: Object.entries({ ...(opts.attributes || {}), _paiement: 'virement' }).map(([key, value]) => ({ key, value })),
    tags: ['virement', 'attente-paiement'],
  } });
  const dr = d.draftOrderCreate.draftOrder;
  if (!dr) throw new Error(d.draftOrderCreate.userErrors.map((e) => e.message).join(', '));
  const sub = Number(dr.subtotalPriceSet.shopMoney.amount);
  if (Math.abs(sub - expected) > 0.02) throw new Error(`Écart de prix : Shopify ${sub} € / site ${expected} €`);
  const total = Number(dr.totalPriceSet.shopMoney.amount);
  // Email Shopify au client : récapitulatif, montant et coordonnées du virement.
  await admin(`mutation($id: ID!, $e: EmailInput) { draftOrderInvoiceSend(id: $id, email: $e) { userErrors { message } } }`, { id: dr.id, e: {
    subject: `Votre commande ${dr.name} · paiement par virement`,
    customMessage: `Merci pour votre commande. Montant à régler : ${total.toFixed(2).replace('.', ',')} € TTC${opts.iban ? `, par virement sur l'IBAN ${opts.iban}` : ''}, référence ${dr.name}. La production démarre dès réception du virement.`,
  } }).catch(() => null);
  return { name: dr.name, total, ht: t.ht };
}
