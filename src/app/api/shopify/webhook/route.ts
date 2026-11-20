import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { getJSON, putJSON } from '@/lib/blobStore';
import { sendGA4, sendMeta, type Sale } from '@/lib/conversions';
import { getRework, saveRework } from '@/lib/rework';
import { tagOrder } from '@/lib/reworkOrders';
import { SITE_URL } from '@/lib/site';

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

  await putJSON('commandes', key, {
    id: key, gid: o.admin_graphql_api_id, name: o.name, createdAt: o.created_at, value: sale.value, email: sale.email,
    panier: attr.panier, source: attr.utm_source, campaign: attr.utm_campaign, gclid: !!attr.gclid, fbclid: !!attr.fbclid,
    retouches: [...reworkIds], conversions: [ga, meta],
  });
  return NextResponse.json({ ok: true });
}
