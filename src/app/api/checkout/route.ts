import { limited, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { COLOR_NAMES, PROMO_CODES, getProduct, sizesFor, zonesFor, SAMPLE_MIN, promoRate } from '@/lib/catalog';
import { validRelanceCode } from '@/lib/relance';
import { cartTotals, keptAdvantages, logoKey, pools, qtyOf, unitPrice, type LineConfig } from '@/lib/pricing';
import { createRework } from '@/lib/rework';
import { saveCart } from '@/lib/savedCart';
import { sessionEmail } from '@/lib/customer';
import { isReseller } from '@/lib/reseller';
import { lookupCode } from '@/lib/vouchers';
import { COMPANY, SITE_URL, publicOrigin } from '@/lib/site';
import { sanitize } from '@/lib/cartSanitize';
import { createShopifyCheckout, createTransferOrder, shopifyEnabled } from '@/lib/shopify';
import { getStock } from '@/lib/stock';
import { expressOk } from '@/lib/stockTypes';

export async function POST(req: Request) {
  if (await limited(req, 'paiement', 30, 600)) return tooMany();
  const body = await req.json().catch(() => null);
  const lines = sanitize(body?.lines);
  if (!lines) return NextResponse.json({ error: 'Un article n\'a pas de maquette validée. Ouvrez-le avec « Modifier », vérifiez le logo et validez la maquette.' }, { status: 400 });
  // Retouche du logo : un dossier par logo, joint à la commande pour l'atelier.
  const byLogo = new Map<string, LineConfig[]>();
  for (const l of lines) if (l.logoRework) byLogo.set(logoKey(l), [...(byLogo.get(logoKey(l)) || []), l]);
  for (const group of byLogo.values()) {
    const id = await createRework(group.map((l) => ({ slug: l.slug, color: l.color, zones: l.zones, text: l.text, logoId: l.logoId, logoSourceId: l.logoSourceId, mockupId: l.mockupId, pieces: qtyOf(l) })));
    for (const l of group) l.reworkId = id;
  }
  const express = body?.express === true;
  // Express (4 jours ouvrés) : seulement si tout le panier est en stock à l'atelier ; le fournisseur met 5 jours.
  if (express && !expressOk(await getStock().catch(() => null), lines)) {
    return NextResponse.json({ error: body?.lang === 'en'
      ? 'Express production is only available when every item is in stock. Untick express to continue.'
      : 'La production express n\'est possible que si tous les articles sont en stock. Décochez l\'express pour continuer.' }, { status: 409 });
  }
  // Remise revendeur : vérifiée côté serveur (compte connecté + statut validé), jamais sur parole du navigateur.
  const customerEmail = await sessionEmail(req, publicOrigin(req));
  const resellerOk = await isReseller(customerEmail);
  // Code parrain (pas pour soi-même) ou bon d'achat non utilisé, vérifiés ici.
  const code = typeof body?.voucher === 'string' ? await lookupCode(body.voucher) : null;
  const voucherOk = code && !(code.kind === 'parrain' && customerEmail && code.email === customerEmail.toLowerCase()) ? code : null;
  // Code promo : codes fixes, ou code à usage unique RETOUR- / AVIS- / BIENV- (vérifié ici).
  const rawPromo = typeof body?.promo === 'string' ? body.promo.trim().toUpperCase() : '';
  const promoOk = rawPromo && (PROMO_CODES[rawPromo] || (await validRelanceCode(rawPromo))) ? rawPromo : null;
  // Un seul avantage par commande (CGV) : on garde le plus intéressant, les autres codes ne sont ni appliqués ni consommés.
  const kept = keptAdvantages(lines, promoOk, express, resellerOk, voucherOk ? { amount: voucherOk.amount, min: voucherOk.min } : null);
  const { promo, reseller, voucher } = kept;

  // Shopify en priorité : panier, paiement et commandes gérés dans le back office.
  if (shopifyEnabled()) {
    try {
      // Attributs cachés (préfixe _) : source de la visite pour attribuer la vente, lien « Recommander ».
      const origin = publicOrigin(req);
      const saved = await saveCart({ kind: 'commande', lines, promo }).catch(() => null);
      const attr: Record<string, string> = {};
      const a = body?.attribution && typeof body.attribution === 'object' ? body.attribution : {};
      for (const k of ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'landing', 'ga_cid', 'fbp', 'fbc']) if (typeof a[k] === 'string' && a[k]) attr[`_${k}`] = a[k].slice(0, 250);
      const ip = (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
      if (ip) attr._ip = ip.slice(0, 64);
      const ua = req.headers.get('user-agent'); if (ua) attr._ua = ua.slice(0, 250);
      if (saved) { attr._panier = saved.id; attr._recommander = `${origin}/recommander/${saved.id}`; }
      const lang = body?.lang === 'en' ? 'en' : 'fr';
      if (lang === 'en') attr._langue = 'en';
      if (express) attr._express = 'oui';
      if (promo) attr._promo = promo;
      if (typeof body?.relance === 'string' && /^[a-f0-9]{24}$/.test(body.relance)) attr._relance = body.relance;
      // Échantillon avant série (dès 150 pièces) : l'atelier envoie 1 pièce et attend la validation du client.
      if (body?.sample === true && lines.reduce((a, l) => a + qtyOf(l), 0) >= SAMPLE_MIN) attr._echantillon = 'oui';
      if (reseller) attr._revendeur = 'oui';
      const shopSlug = lines.find((l) => l.shop)?.shop; if (shopSlug) attr._boutique = shopSlug;
      if (voucherOk && voucher) attr[voucherOk.kind === 'parrain' ? '_parrain' : '_bon'] = String(body.voucher).trim().toUpperCase();
      // Virement : réservé aux pros connectés à leur compte.
      if (body?.payment === 'virement') {
        if (!customerEmail || !body?.pro) return NextResponse.json({ error: 'Le virement est réservé aux professionnels connectés à leur compte.' }, { status: 403 });
        const o = await createTransferOrder(lines, { email: customerEmail, promo, note: 'Client professionnel', origin, attributes: attr, express, reseller, voucher, iban: `${COMPANY.iban} (BIC ${COMPANY.bic})` });
        return NextResponse.json({ transfer: { ...o, iban: COMPANY.iban, bic: COMPANY.bic, holder: COMPANY.name } });
      }
      const url = await createShopifyCheckout(lines, { promo, note: (body?.pro ? 'Client professionnel' : 'Client particulier') + (lang === 'en' ? ' · anglophone' : ''), origin, attributes: attr, lang, express, reseller, voucher });
      return NextResponse.json({ url });
    } catch (e) {
      console.error('[checkout shopify]', e);
      // Code de diagnostic sans donnée sensible (aucun identifiant ni montant interne).
      const m = String((e as Error)?.message || '');
      const code = m.includes('identifiants Admin') ? 'ADMIN_NON_CONFIGURE'
        : m.includes('Jeton Admin') ? 'ADMIN_REFUSE'
        : m.includes('Shopify Admin') ? 'ADMIN_API'
        : m.includes('Création de la remise') ? 'REMISE_REFUSEE'
        : m.includes('pas été acceptée') ? 'REMISE_NON_APPLIQUEE'
        : m.includes('Écart de prix') ? 'ECART_PRIX'
        : 'PANIER';
      const detail = code === 'ADMIN_REFUSE' ? (m.match(/\((\d{3}[^)]*)\)/)?.[1] ?? '')
        : ['ADMIN_API', 'REMISE_REFUSEE', 'REMISE_NON_APPLIQUEE'].includes(code) ? m.replace(/gid:\/\/\S+/g, '').slice(0, 300) : undefined;
      return NextResponse.json({ error: 'Le paiement est momentanément indisponible. Réessayez dans un instant.', code, ...(detail ? { detail } : {}) }, { status: 502 });
    }
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: 'Paiement en cours de configuration.' }, { status: 503 });
  const stripe = new Stripe(key);
  const t = cartTotals(lines, promo, express, reseller, voucher);
  const cents = (n: number) => Math.round(n * 100);

  const pool = pools(lines);
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l, i) => {
    const p = getProduct(l.slug)!;
    const sizes = Object.entries(l.qty).filter(([, v]) => v).map(([s, v]) => `${s}×${v}`).join(', ');
    const zones = zonesFor(p).filter((z) => l.zones.includes(z.id)).map((z) => `${z.name} ${z.size}`).join(' + ');
    return {
      quantity: qtyOf(l),
      price_data: {
        currency: 'eur', tax_behavior: 'exclusive', unit_amount: cents(unitPrice(l, pool[i]) * (reseller ? 0.9 : 1)),
        product_data: { name: `${p.name} · ${COLOR_NAMES[l.color]}`, description: `${zones} · ${sizes}`.slice(0, 500) },
      },
    };
  });

  if (t.express) line_items.push({ quantity: 1, price_data: { currency: 'eur', tax_behavior: 'exclusive', unit_amount: cents(t.express * (reseller ? 0.9 : 1)), product_data: { name: 'Production express' } } });
  if (t.rework) line_items.push({ quantity: 1, price_data: { currency: 'eur', tax_behavior: 'exclusive', unit_amount: cents(t.rework * (reseller ? 0.9 : 1)), product_data: { name: 'Retouche du logo par notre graphiste' } } });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: body?.lang === 'en' ? 'en' : 'fr',
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
    await stripe.coupons.create({ id, percent_off: promoRate(code) * 100, duration: 'once', name: code });
  }
  return id;
}
