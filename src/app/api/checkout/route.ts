import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { COLOR_NAMES, PROMO_CODES, ZONES, getProduct, sizesFor, zonesFor } from '@/lib/catalog';
import { cartTotals, qtyOf, unitPrice, type LineConfig } from '@/lib/pricing';
import { SITE_URL } from '@/lib/site';
import { createShopifyCheckout, shopifyEnabled } from '@/lib/shopify';

type InLine = Omit<LineConfig, 'logo'> & { hasLogoPreview?: boolean };

/** Revalide le panier côté serveur (produits, couleurs, zones, tailles) puis recalcule tous les prix. */
function sanitize(raw: unknown): LineConfig[] | null {
  if (!Array.isArray(raw) || !raw.length || raw.length > 50) return null;
  const out: LineConfig[] = [];
  for (const l of raw as InLine[]) {
    const p = getProduct(l?.slug);
    if (!p || !p.colors.includes(l.color)) return null;
    const zones = (l.zones || []).filter((z) => zonesFor(p).some((x) => x.id === z));
    const sizes = sizesFor(p);
    const qty = Object.fromEntries(Object.entries(l.qty || {}).filter(([s]) => sizes.includes(s) || s === 'Total').map(([s, v]) => [s, Math.max(0, Math.min(5000, Math.floor(Number(v)) || 0))]));
    if (!zones.length || !qtyOf({ qty })) return null;
    out.push({ slug: p.slug, color: l.color, zones, qty, text: String(l.text || '').slice(0, 24), logoStatus: l.logoStatus, logoName: l.logoName, pack: !!l.pack });
  }
  return out;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lines = sanitize(body?.lines);
  if (!lines) return NextResponse.json({ error: 'Panier invalide. Rechargez la page.' }, { status: 400 });
  const promo = body?.promo && PROMO_CODES[String(body.promo).toUpperCase()] ? String(body.promo).toUpperCase() : null;

  // Shopify en priorité : panier, paiement et commandes gérés dans le back office.
  if (shopifyEnabled()) {
    try {
      const url = await createShopifyCheckout(lines, { promo, note: body?.pro ? 'Client professionnel' : 'Client particulier' });
      return NextResponse.json({ url });
    } catch (e) {
      console.error('[checkout shopify]', e);
      return NextResponse.json({ error: 'Le paiement est momentanément indisponible. Réessayez dans un instant.' }, { status: 502 });
    }
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: 'Paiement en cours de configuration.' }, { status: 503 });
  const stripe = new Stripe(key);
  const t = cartTotals(lines, promo);
  const cents = (n: number) => Math.round(n * 100);

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l) => {
    const p = getProduct(l.slug)!;
    const sizes = Object.entries(l.qty).filter(([, v]) => v).map(([s, v]) => `${s}×${v}`).join(', ');
    const zones = l.zones.map((z) => ZONES.find((x) => x.id === z)?.name).join(' + ');
    return {
      quantity: qtyOf(l),
      price_data: {
        currency: 'eur', tax_behavior: 'exclusive', unit_amount: cents(unitPrice(l)),
        product_data: { name: `${p.name} · ${COLOR_NAMES[l.color]}`, description: `${zones} · ${sizes}${l.pack ? ' · pack -10 %' : ''}`.slice(0, 500) },
      },
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'fr',
    line_items,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === 'true' },
    ...(promo ? { discounts: [{ coupon: await coupon(stripe, promo) }] } : {}),
    shipping_address_collection: { allowed_countries: ['FR', 'BE', 'LU', 'CH', 'MC'] },
    shipping_options: [{ shipping_rate_data: { display_name: t.shipping ? 'Livraison standard' : 'Livraison offerte', type: 'fixed_amount', fixed_amount: { amount: cents(t.shipping), currency: 'eur' }, tax_behavior: 'exclusive' } }],
    tax_id_collection: { enabled: true },
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    consent_collection: { terms_of_service: 'required' },
    custom_text: { terms_of_service_acceptance: { message: `J'accepte les [CGV](${SITE_URL}/cgv). Les articles personnalisés ne bénéficient pas du droit de rétractation.` } },
    metadata: { order: JSON.stringify(lines.map((l) => ({ s: l.slug, c: l.color, z: l.zones, q: l.qty, t: l.text, logo: l.logoStatus, f: l.logoName }))).slice(0, 500) },
    success_url: `${SITE_URL}/merci?session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/panier`,
  });
  return NextResponse.json({ url: session.url });
}

async function coupon(stripe: Stripe, code: string) {
  const id = `alwaan-${code.toLowerCase()}`;
  try { await stripe.coupons.retrieve(id); } catch {
    await stripe.coupons.create({ id, percent_off: PROMO_CODES[code] * 100, duration: 'once', name: code });
  }
  return id;
}
