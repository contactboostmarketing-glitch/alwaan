import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { getJSON, putJSON } from '@/lib/blobStore';
import { sendGA4, sendMeta, type Sale } from '@/lib/conversions';
import { getRework, saveRework } from '@/lib/rework';
import { tagOrder } from '@/lib/reworkOrders';
import { SITE_URL } from '@/lib/site';
import { admin } from '@/lib/shopifyAdmin';
import { REFERRAL_REWARD, issueBon, lookupCode, markBonUsed } from '@/lib/vouchers';
import { getShop, saveShop } from '@/lib/shops';
import { RELANCE_CODE, SHOP_COMMISSION } from '@/lib/catalog';
import { decrementStock } from '@/lib/stock';
import { closeRelance, useRelanceCode } from '@/lib/relance';

/**
 * Webhook Shopify « commande payée » (enregistré par /api/shopify/setup).
 * 1. envoie la vente à Google (GA4) et Meta côté serveur, avec la source de la visite ;
 * 2. rattache les dossiers de retouche du logo à la commande ;
 * 3. garde une fiche commande (lien « Recommander », suivi).
 * Signature vérifiée avec le secret de l'application (SHOPIFY_CLIENT_SECRET ou SHOPIFY_WEBHOOK_SECRET).
 */
type Prop = { name: string; value: string };
type ShopOrder = {
  id: number; admin_graphql_api_id: string; name: string; email?: string; phone?: string; created_at: string; currency: string;
  current_subtotal_price?: string; subtotal_price?: string; browser_ip?: string; client_details?: { user_agent?: string };
  customer?: { email?: string; phone?: string }; note_attributes?: Prop[];
  line_items: { title: string; quantity: number; price: string; product_id?: number; sku?: string; properties?: Prop[] }[];
};

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET || '';
  const sig = req.headers.get('x-shopify-hmac-sha256') || '';
  const calc = createHmac('sha256', secret.trim()).update(raw, 'utf8').digest('base64');
  if (!secret || sig.length !== calc.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(calc))) return new Response('Signature invalide', { status: 401 });
  if (req.headers.get('x-shopify-topic') !== 'orders/paid') return NextResponse.json({ ignored: true });

  const o = JSON.parse(raw) as ShopOrder;
  const key = String(o.id);
  if (await getJSON('commandes', key)) return NextResponse.json({ duplicate: true }); // Shopify peut renvoyer le même webhook

  const attr = Object.fromEntries((o.note_attributes || []).filter((a) => a.name.startsWith('_')).map((a) => [a.name.slice(1), String(a.value)]));
  const items = o.line_items.map((l) => ({ id: l.sku || String(l.product_id || l.title), name: l.title, quantity: l.quantity, price: Number(l.price) }));
  const sale: Sale = {
    orderId: key, name: o.name, currency: o.currency || 'EUR', createdAt: o.created_at,
    value: Number(o.current_subtotal_price ?? o.subtotal_price ?? 0), // HT, remises déduites, hors livraison
    email: o.email || o.customer?.email, phone: o.phone || o.customer?.phone,
    ip: attr.ip || o.browser_ip, ua: attr.ua || o.client_details?.user_agent, attr, items,
  };
  const [ga, meta] = await Promise.all([sendGA4(sale).catch((e) => `GA4 erreur ${e.message}`), sendMeta(sale, SITE_URL).catch((e) => `Meta erreur ${e.message}`)]);

  // Dossiers de retouche présents dans la commande.
  const reworkIds = new Set<string>();
  for (const l of o.line_items) for (const p of l.properties || []) {
    const m = p.name === 'Dossier retouche (atelier)' && String(p.value).match(/retouche\/([a-f0-9]{32})/);
    if (m) reworkIds.add(m[1]);
  }
  for (const id of reworkIds) {
    const r = await getRework(id);
    if (r && !r.order) {
      r.order = { id: o.admin_graphql_api_id, name: o.name, email: sale.email, createdAt: o.created_at };
      r.history.push({ at: new Date().toISOString(), event: `Commande ${o.name} payée` });
      await saveRework(r); await tagOrder(r);
    }
  }

  // Relance panier : code -10 % utilisé, relance arrêtée.
  try {
    if (attr.promo && RELANCE_CODE.test(attr.promo)) await useRelanceCode(attr.promo, o.name);
    if (attr.relance) await closeRelance(attr.relance, 'commande');
  } catch (e) { console.error('[relance]', e); }

  // Stock atelier : déduction des pièces prises en stock.
  let stock = '';
  try {
    const take = o.line_items.flatMap((l) => (l.properties || []).filter((p) => p.name === '_stock').map((p) => ({ key: String(p.value), quantity: l.quantity })));
    stock = await decrementStock(take);
  } catch (e) { stock = `erreur ${(e as Error).message}`; }

  // Parrainage : bon utilisé → marqué ; code parrain → bon de 20 € au parrain si c'est la 1re commande du filleul.
  let parrainage = '';
  try {
    if (attr.bon) await markBonUsed(attr.bon, o.name);
    if (attr.parrain) {
      const p = await lookupCode(attr.parrain);
      const d = await admin<{ order: { customer: { numberOfOrders: string } | null } | null }>(`query($id: ID!) { order(id: $id) { customer { numberOfOrders } } }`, { id: o.admin_graphql_api_id });
      const first = Number(d.order?.customer?.numberOfOrders ?? 1) <= 1;
      if (p?.kind === 'parrain' && first && p.email !== (sale.email || '').toLowerCase()) parrainage = (await issueBon(p.email, REFERRAL_REWARD, o.name)).code;
      else parrainage = first ? 'refusé (même client)' : 'refusé (pas une 1re commande)';
    }
  } catch (e) { parrainage = `erreur ${(e as Error).message}`; }

  // Boutique club : commission sur les ventes HT, versée en bons d'achat au club dès 20 € cumulés.
  let boutique = '';
  try {
    const shop = attr.boutique ? await getShop(attr.boutique) : null;
    if (shop) {
      const c = Math.round(sale.value * SHOP_COMMISSION * 100) / 100;
      shop.stats.orders += 1; shop.stats.revenueHT = Math.round((shop.stats.revenueHT + sale.value) * 100) / 100;
      shop.stats.pending = Math.round((shop.stats.pending + c) * 100) / 100;
      if (shop.stats.pending >= 20) { await issueBon(shop.ownerEmail, shop.stats.pending, `Boutique ${shop.name}`); shop.stats.commission += shop.stats.pending; shop.stats.pending = 0; }
      await saveShop(shop); boutique = `${shop.slug} +${c} €`;
    }
  } catch (e) { boutique = `erreur ${(e as Error).message}`; }

  await putJSON('commandes', key, {
    id: key, gid: o.admin_graphql_api_id, name: o.name, createdAt: o.created_at, value: sale.value, email: sale.email,
    panier: attr.panier, source: attr.utm_source, campaign: attr.utm_campaign, gclid: !!attr.gclid, fbclid: !!attr.fbclid,
    retouches: [...reworkIds], conversions: [ga, meta], parrainage, boutique, stock,
    // Pour les emails après achat (bienvenue, avis, renouvellement) : produits commandés et langue.
    slugs: [...new Set(o.line_items.flatMap((l) => (l.properties || []).filter((p) => p.name === '_stock').map((p) => String(p.value).split('|')[0])))],
    lang: attr.langue === 'en' ? 'en' : 'fr', recommander: attr.recommander,
  });
  return NextResponse.json({ ok: true });
}
