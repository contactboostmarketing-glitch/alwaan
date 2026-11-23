import { NextResponse } from 'next/server';
import { COLOR_NAMES, DESIGN_FEE, EXPRESS_FEES, NAME_FEE, PRODUCTS, REWORK_FEE, ZONES, sizesFor, zonesFor, type Product, type Zone } from '@/lib/catalog';
import { DESIGN_HANDLE, NAME_HANDLE, REWORK_HANDLE, expressHandle, markHandle } from '@/lib/shopify';
import { admin, adminEnabled } from '@/lib/shopifyAdmin';
import { safeEqual } from '@/lib/secure';
import { publicOrigin } from '@/lib/site';

/**
 * Met Shopify en accord avec la grille de prix du site :
 *  - crée ou met à jour chaque produit de marquage (marquage-heart, marquage-back-premium…) au bon prix ;
 *  - met chaque variante de vêtement au prix de vente du site (prix d'achat × coefficient).
 * Les prix Shopify doivent être égaux aux prix catalogue du site : le paiement le vérifie.
 * Protégé par la clé SYNC_KEY (ou ROLY_SYNC_KEY). POST ?dry=1 pour voir sans rien modifier.
 * Droits de l'application nécessaires : read_products, write_products, read_publications, write_publications.
 */
export const maxDuration = 60;

type UserError = { field?: string[]; message: string };

/** Toutes les zones vendues, avec leur prix réel (standard et premium). */
function markingProducts(): { handle: string; zone: Zone }[] {
  const seen = new Map<string, Zone>();
  for (const z of ZONES) seen.set(markHandle(z), z);
  // Variantes de prix (premium) : nom standard de la zone, pas son nom propre à un vêtement (« Face » sur casquette).
  for (const p of PRODUCTS) for (const z of zonesFor(p)) if (!seen.has(markHandle(z))) seen.set(markHandle(z), { ...z, name: ZONES.find((x) => x.id === z.id)!.name });
  return [...seen].map(([handle, zone]) => ({ handle, zone }));
}

async function publications(): Promise<string[]> {
  const d = await admin<{ publications: { nodes: { id: string }[] } }>(`{ publications(first: 20) { nodes { id } } }`, {});
  return d.publications.nodes.map((n) => n.id);
}

async function productByHandle(handle: string) {
  const d = await admin<{ productByIdentifier: { id: string; title: string; variants: { nodes: { id: string; price: string; selectedOptions: { name: string; value: string }[] }[] } } | null }>(
    `query($h: String!) { productByIdentifier(identifier: { handle: $h }) { id title variants(first: 250) { nodes { id price selectedOptions { name value } } } } }`,
    { h: handle },
  );
  return d.productByIdentifier;
}

const upsertMarking = (handle: string, z: Zone, pubs: string[], dry: boolean) =>
  upsertSimple(handle, `Marquage ${z.name} (${z.size})${handle.endsWith('-premium') ? ' · textile > 25 €' : ''}`, z.price,
    `<p>Impression DTF ${z.name.toLowerCase()}, logo inscrit dans un gabarit de ${z.size}. Facturé par pièce marquée.</p>`, 'Marquage', pubs, dry);

/** Produit simple à un seul prix (marquage, service), créé ou mis à jour par son handle. */
async function upsertSimple(handle: string, title: string, amount: number, descriptionHtml: string, productType: string, pubs: string[], dry: boolean) {
  const price = amount.toFixed(2);
  const existing = await productByHandle(handle);
  if (existing) {
    // Nom lisible par l'atelier sur les commandes (« Marquage Grand devant (28 × 30 cm) »).
    if (existing.title !== title && !dry) {
      await admin(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { field message } } }`, { p: { id: existing.id, title } });
    }
    const v = existing.variants.nodes[0];
    if (v && v.price === price) return { handle, action: existing.title !== title ? `renommé « ${title} »` : 'déjà au bon prix', price };
    if (dry) return { handle, action: `prix ${v?.price} → ${price}` };
    const r = await admin<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(
      `mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $p, variants: $v) { userErrors { field message } } }`,
      { p: existing.id, v: [{ id: v.id, price }] },
    );
    const e = r.productVariantsBulkUpdate.userErrors;
    return { handle, action: e.length ? 'erreur' : `prix mis à ${price}`, errors: e };
  }
  if (dry) return { handle, action: `à créer à ${price}` };
  const r = await admin<{ productSet: { product: { id: string } | null; userErrors: UserError[] } }>(
    `mutation($i: ProductSetInput!) { productSet(synchronous: true, input: $i) { product { id } userErrors { field message } } }`,
    { i: {
      handle,
      title,
      status: 'ACTIVE',
      productType,
      vendor: 'alwaan',
      descriptionHtml,
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      variants: [{ optionValues: [{ optionName: 'Title', name: 'Default Title' }], price, inventoryPolicy: 'CONTINUE', taxable: true }],
    } },
  );
  const e = r.productSet.userErrors;
  if (e.length || !r.productSet.product) return { handle, action: 'erreur', errors: e };
  const id = r.productSet.product.id;
  // Visible par le site (canal Headless / Storefront) et sur toutes les ventes.
  const pr = await admin<{ publishablePublish: { userErrors: UserError[] } }>(
    `mutation($id: ID!, $in: [PublicationInput!]!) { publishablePublish(id: $id, input: $in) { userErrors { field message } } }`,
    { id, in: pubs.map((publicationId) => ({ publicationId })) },
  ).catch((err) => ({ publishablePublish: { userErrors: [{ message: String(err.message) }] } }));
  return { handle, action: `créé à ${price}`, publication: pr.publishablePublish.userErrors };
}

/** Vêtement absent de Shopify (nouveau produit du catalogue) : créé avec ses variantes Couleur × Taille au prix du site. */
async function createGarment(g: Product, price: string, pubs: string[]) {
  const colors = g.colors.map((c) => COLOR_NAMES[c] || c), sizes = sizesFor(g);
  const r = await admin<{ productSet: { product: { id: string } | null; userErrors: UserError[] } }>(
    `mutation($i: ProductSetInput!) { productSet(synchronous: true, input: $i) { product { id } userErrors { field message } } }`,
    { i: {
      handle: g.slug, title: g.name, status: 'ACTIVE', productType: 'Vêtement', vendor: 'alwaan',
      descriptionHtml: `<p>${g.type}. ${g.composition}.</p>`,
      productOptions: [{ name: 'Couleur', values: colors.map((name) => ({ name })) }, { name: 'Taille', values: sizes.map((name) => ({ name })) }],
      variants: colors.flatMap((c) => sizes.map((t) => ({ optionValues: [{ optionName: 'Couleur', name: c }, { optionName: 'Taille', name: t }], price, inventoryPolicy: 'CONTINUE', taxable: true }))),
    } },
  );
  const e = r.productSet.userErrors;
  if (e.length || !r.productSet.product) return { handle: g.slug, action: 'erreur à la création', errors: e };
  const pr = await admin<{ publishablePublish: { userErrors: UserError[] } }>(
    `mutation($id: ID!, $in: [PublicationInput!]!) { publishablePublish(id: $id, input: $in) { userErrors { field message } } }`,
    { id: r.productSet.product.id, in: pubs.map((publicationId) => ({ publicationId })) },
  ).catch((err) => ({ publishablePublish: { userErrors: [{ message: String(err.message) }] } }));
  return { handle: g.slug, action: `créé à ${price} (${colors.length} couleurs × ${sizes.length} tailles)`, publication: pr.publishablePublish.userErrors };
}

async function syncGarment(slug: string, price: number, dry: boolean, pubs: string[] = []) {
  const p = await productByHandle(slug);
  if (!p) {
    const g = PRODUCTS.find((x) => x.slug === slug)!;
    return dry ? { handle: slug, action: `à créer à ${price.toFixed(2)}` } : createGarment(g, price.toFixed(2), pubs);
  }
  const target = price.toFixed(2);
  // Couleurs ajoutées au catalogue depuis la création du produit : variantes Couleur × Taille à créer.
  const g = PRODUCTS.find((x) => x.slug === slug)!;
  const has = new Set(p.variants.nodes.map((v) => v.selectedOptions.find((o) => o.name === 'Couleur')?.value));
  const missing = has.has(undefined) ? [] : g.colors.map((c) => COLOR_NAMES[c] || c).filter((c) => !has.has(c));
  let added = '';
  if (missing.length) {
    if (dry) added = `couleurs à ajouter : ${missing.join(', ')} · `;
    else {
      const sizes = sizesFor(g);
      const r = await admin<{ productVariantsBulkCreate: { userErrors: UserError[] } }>(
        `mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $p, variants: $v) { userErrors { field message } } }`,
        { p: p.id, v: missing.flatMap((c) => sizes.map((s) => ({ optionValues: [{ optionName: 'Couleur', name: c }, { optionName: 'Taille', name: s }], price: target, inventoryPolicy: 'CONTINUE', taxable: true }))) },
      );
      const e = r.productVariantsBulkCreate.userErrors;
      added = e.length ? `erreur couleurs : ${e.map((x) => x.message).join(', ')} · ` : `couleurs ajoutées : ${missing.join(', ')} · `;
    }
  }
  const wrong = p.variants.nodes.filter((v) => v.price !== target);
  if (!wrong.length) return { handle: slug, action: `${added}déjà au bon prix`, price: target };
  if (dry) return { handle: slug, action: `${added}${wrong.length} variante(s) ${[...new Set(wrong.map((v) => v.price))].join('/')} → ${target}` };
  const r = await admin<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(
    `mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $p, variants: $v) { userErrors { field message } } }`,
    { p: p.id, v: wrong.map((v) => ({ id: v.id, price: target })) },
  );
  const e = r.productVariantsBulkUpdate.userErrors;
  return { handle: slug, action: e.length ? `${added}erreur` : `${added}${wrong.length} variante(s) mises à ${target}`, errors: e };
}

/** Abonne le site au webhook « commande payée » (conversions, dossiers de retouche, recommander). */
async function ensureWebhook(origin: string): Promise<string> {
  const uri = `${origin}/api/shopify/webhook`;
  const list = await admin<{ webhookSubscriptions: { nodes: { id: string; topic: string; uri?: string }[] } }>(
    `{ webhookSubscriptions(first: 50) { nodes { id topic uri } } }`, {});
  if (list.webhookSubscriptions.nodes.some((w) => w.topic === 'ORDERS_PAID' && w.uri === uri)) return `déjà actif (${uri})`;
  const r = await admin<{ webhookSubscriptionCreate: { userErrors: UserError[] } }>(
    `mutation($s: WebhookSubscriptionInput!) { webhookSubscriptionCreate(topic: ORDERS_PAID, webhookSubscription: $s) { userErrors { field message } } }`,
    { s: { uri, format: 'JSON' } },
  );
  const e = r.webhookSubscriptionCreate.userErrors;
  return e.length ? `erreur : ${e.map((x) => x.message).join(', ')}` : `créé (${uri})`;
}

export async function POST(req: Request) {
  const key = process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY;
  if (!safeEqual(req.headers.get('x-sync-key'), key)) return new Response('Non autorisé', { status: 401 });
  if (!adminEnabled()) return NextResponse.json({ ok: false, error: 'Identifiants Admin Shopify manquants' });
  const dry = new URL(req.url).searchParams.has('dry');
  try {
    const pubs = dry ? [] : await publications();
    const marquages = [];
    for (const { handle, zone } of markingProducts()) marquages.push(await upsertMarking(handle, zone, pubs, dry));
    marquages.push(await upsertSimple(REWORK_HANDLE, 'Retouche du logo par notre graphiste', REWORK_FEE,
      '<p>Le logo est retravaillé (fond, netteté, vectorisation) puis la maquette est renvoyée au client avant impression. Forfait par logo.</p>', 'Service', pubs, dry));
    marquages.push(await upsertSimple(DESIGN_HANDLE, 'Création design (par pièce)', DESIGN_FEE,
      '<p>Design prêt à personnaliser pour les particuliers (EVJF, anniversaire, famille…).</p>', 'Service', pubs, dry));
    marquages.push(await upsertSimple(NAME_HANDLE, 'Marquage prénom (par pièce)', NAME_FEE,
      '<p>Prénom de chaque personne imprimé sous le logo, au-delà de 20 pièces.</p>', 'Marquage', pubs, dry));
    for (const [, fee] of EXPRESS_FEES) marquages.push(await upsertSimple(expressHandle(fee), `Production express (${fee} €)`, fee,
      '<p>Production express en 4 jours ouvrés. Forfait selon le nombre de pièces de la commande.</p>', 'Service', pubs, dry));
    const vetements = [];
    for (const p of PRODUCTS) vetements.push(await syncGarment(p.slug, p.price, dry, pubs));
    const webhook = dry ? 'non modifié (simulation)' : await ensureWebhook(publicOrigin(req));
    return NextResponse.json({ ok: true, dry, marquages, vetements, webhook });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message).slice(0, 500) }, { status: 502 });
  }
}

/** Diagnostic : droits réellement accordés à l'application sur la boutique. */
export async function GET(req: Request) {
  const key = process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY;
  if (!safeEqual(req.headers.get('x-sync-key'), key)) return new Response('Non autorisé', { status: 401 });
  try {
    const d = await admin<{ currentAppInstallation: { accessScopes: { handle: string }[] } }>(`{ currentAppInstallation { accessScopes { handle } } }`, {});
    return NextResponse.json({ ok: true, scopes: d.currentAppInstallation.accessScopes.map((s) => s.handle) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message).slice(0, 300) }, { status: 502 });
  }
}
