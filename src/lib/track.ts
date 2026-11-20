'use client';
// Mesure : Google (GA4 / Google Ads, Consent Mode v2) et Meta. Les cookies publicitaires
// ne sont déposés qu'après accord (bandeau cookies). La vente elle-même est envoyée côté serveur
// (webhook Shopify → GA4 Measurement Protocol + Meta Conversions API), donc mesurée même sans cookie tiers.

declare global { interface Window { fbq?: (...a: unknown[]) => void; _fbq?: unknown } }

const ATTR = 'alwaan-attr-v1';
export type Attribution = Partial<Record<'gclid' | 'gbraid' | 'wbraid' | 'fbclid' | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content' | 'landing' | 'at', string>>;

/** Mémorise la source de la visite (90 jours, dernier clic payant prioritaire). */
export function captureAttribution() {
  try {
    const u = new URL(window.location.href);
    const keys = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
    const found: Attribution = {};
    for (const k of keys) { const v = u.searchParams.get(k); if (v) found[k] = v.slice(0, 200); }
    const old: Attribution = JSON.parse(localStorage.getItem(ATTR) || '{}');
    const fresh = old.at && Date.now() - Date.parse(old.at) < 90 * 864e5 ? old : {};
    if (Object.keys(found).length) localStorage.setItem(ATTR, JSON.stringify({ ...found, landing: u.pathname.slice(0, 200), at: new Date().toISOString() }));
    else if (!fresh.at) localStorage.setItem(ATTR, JSON.stringify({ landing: u.pathname.slice(0, 200), at: new Date().toISOString(), utm_source: document.referrer ? new URL(document.referrer).hostname.slice(0, 100) : 'direct' }));
    // Cookie _fbc attendu par Meta quand on arrive d'une publicité Facebook / Instagram.
    if (found.fbclid) document.cookie = `_fbc=fb.1.${Date.now()}.${found.fbclid}; path=/; max-age=${90 * 86400}; SameSite=Lax`;
  } catch {}
}

const cookie = (n: string) => document.cookie.split('; ').find((c) => c.startsWith(n + '='))?.split('=').slice(1).join('=');

/** Données jointes au panier Shopify pour attribuer la vente (sans donnée personnelle). */
export function attributionForCheckout(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const a: Attribution = JSON.parse(localStorage.getItem(ATTR) || '{}');
    for (const [k, v] of Object.entries(a)) if (v) out[k] = String(v);
    const ga = cookie('_ga'); if (ga) out.ga_cid = ga.split('.').slice(-2).join('.');
    const fbp = cookie('_fbp'); if (fbp) out.fbp = fbp;
    const fbc = cookie('_fbc'); if (fbc) out.fbc = fbc;
  } catch {}
  return out;
}

type Item = { item_id: string; item_name: string; price?: number; quantity?: number };
/** Événement de parcours : GA4/Ads via gtag, Meta via fbq (si le visiteur a accepté). */
export function track(event: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'generate_lead', p: { value?: number; items?: Item[] } = {}) {
  try {
    window.gtag?.('event', event, { currency: 'EUR', value: p.value, items: p.items });
    const meta: Record<string, string> = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', generate_lead: 'Lead' };
    window.fbq?.('track', meta[event], { currency: 'EUR', value: p.value, content_ids: p.items?.map((i) => i.item_id), content_type: 'product' });
  } catch {}
}
