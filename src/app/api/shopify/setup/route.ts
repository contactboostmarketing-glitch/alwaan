import { NextResponse } from 'next/server';
import { PRODUCTS, ZONES, zonesFor, type Zone } from '@/lib/catalog';
import { markHandle } from '@/lib/shopify';
import { admin, adminEnabled } from '@/lib/shopifyAdmin';

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
  for (const p of PRODUCTS) for (const z of zonesFor(p)) seen.set(markHandle(z), z);
  return [...seen].map(([handle, zone]) => ({ handle, zone }));
}

async function publications(): Promise<string[]> {
  const d = await admin<{ publications: { nodes: { id: string }[] } }>(`{ publications(first: 20) { nodes { id } } }`, {});
  return d.publications.nodes.map((n) => n.id);
}

async function productByHandle(handle: string) {
  const d = await admin<{ productByIdentifier: { id: string; variants: { nodes: { id: string; price: string; selectedOptions: { name: string; value: string }[] }[] } } | null }>(
    `query($h: String!) { productByIdentifier(identifier: { handle: $h }) { id variants(first: 250) { nodes { id price selectedOptions { name value } } } } }`,
    { h: handle },
  );
  return d.productByIdentifier;
}

async function upsertMarking(handle: string, z: Zone, pubs: string[], dry: boolean) {
  const price = z.price.toFixed(2);
  const existing = await productByHandle(handle);
  if (existing) {
    const v = existing.variants.nodes[0];
    if (v && v.price === price) return { handle, action: 'déjà au bon prix', price };
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
      title: `Marquage ${z.name} (${z.size})${handle.endsWith('-premium') ? ' · textile > 25 €' : ''}`,
      status: 'ACTIVE',
      productType: 'Marquage',
      vendor: 'alwaan',
      descriptionHtml: `<p>Impression DTF ${z.name.toLowerCase()}, logo inscrit dans un gabarit de ${z.size}. Facturé par pièce marquée.</p>`,
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

async function syncGarment(slug: string, price: number, dry: boolean) {
  const p = await productByHandle(slug);
  if (!p) return { handle: slug, action: 'absent de Shopify' };
  const target = price.toFixed(2);
  const wrong = p.variants.nodes.filter((v) => v.price !== target);
  if (!wrong.length) return { handle: slug, action: 'déjà au bon prix', price: target };
  if (dry) return { handle: slug, action: `${wrong.length} variante(s) ${[...new Set(wrong.map((v) => v.price))].join('/')} → ${target}` };
  const r = await admin<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(
    `mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $p, variants: $v) { userErrors { field message } } }`,
    { p: p.id, v: wrong.map((v) => ({ id: v.id, price: target })) },
  );
  const e = r.productVariantsBulkUpdate.userErrors;
  return { handle: slug, action: e.length ? 'erreur' : `${wrong.length} variante(s) mises à ${target}`, errors: e };
}

export async function POST(req: Request) {
  const key = process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY;
  if (!key || req.headers.get('x-sync-key') !== key) return new Response('Non autorisé', { status: 401 });
  if (!adminEnabled()) return NextResponse.json({ ok: false, error: 'Identifiants Admin Shopify manquants' });
  const dry = new URL(req.url).searchParams.has('dry');
  try {
    const pubs = dry ? [] : await publications();
    const marquages = [];
    for (const { handle, zone } of markingProducts()) marquages.push(await upsertMarking(handle, zone, pubs, dry));
    const vetements = [];
    for (const p of PRODUCTS) vetements.push(await syncGarment(p.slug, p.price, dry));
    return NextResponse.json({ ok: true, dry, marquages, vetements });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message).slice(0, 500) }, { status: 502 });
  }
}
