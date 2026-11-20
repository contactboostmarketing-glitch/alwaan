// Accès Admin Shopify, côté serveur uniquement : sert à créer la remise exacte de chaque panier.
//
// Variables d'environnement (jamais dans le code ni dans le dépôt) :
//   SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET   identifiants de l'application « Site alwaan »
//                                               (étendues : write_discounts, read_discounts)
//   ou SHOPIFY_ADMIN_TOKEN                      jeton Admin direct, si vous en avez un
import { randomBytes } from 'crypto';

const ADMIN_VERSION = '2025-10';
let cached: { token: string; expires: number } | null = null;

export const adminEnabled = () =>
  !!(process.env.SHOPIFY_STORE_DOMAIN && (process.env.SHOPIFY_ADMIN_TOKEN || (process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET)));

/** Jeton Admin : direct, ou obtenu avec les identifiants de l'application (gardé en mémoire jusqu'à expiration). */
async function adminToken(): Promise<string> {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const r = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.SHOPIFY_CLIENT_ID, client_secret: process.env.SHOPIFY_CLIENT_SECRET, grant_type: 'client_credentials' }),
    cache: 'no-store',
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Jeton Admin Shopify refusé (${r.status} ${String(j.error || '').slice(0, 60)})`);
  cached = { token: j.access_token, expires: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return cached.token;
}

async function admin<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const r = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${ADMIN_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await adminToken() },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(`Shopify Admin : ${JSON.stringify(j.errors || r.status)}`);
  return j.data as T;
}

/**
 * Crée un code à usage unique, valable 48 h, du montant exact de l'écart entre
 * le prix Shopify (prix catalogue) et le prix affiché sur le site (paliers, pack, code promo).
 */
export async function createExactDiscount(amount: number, label: string): Promise<string> {
  const code = `ALW-${randomBytes(5).toString('hex').toUpperCase()}`;
  const now = new Date();
  const d = await admin<{ discountCodeBasicCreate: { userErrors: { field: string[]; message: string }[] } }>(
    `mutation($d: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $d) { userErrors { field message } } }`,
    {
      d: {
        title: label,
        code,
        startsAt: new Date(now.getTime() - 60_000).toISOString(),
        endsAt: new Date(now.getTime() + 48 * 3600_000).toISOString(),
        usageLimit: 1,
        appliesOncePerCustomer: false,
        context: { all: 'ALL' },
        customerGets: { value: { discountAmount: { amount: amount.toFixed(2), appliesOnEachItem: false } }, items: { all: true } },
        combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
        tags: ['site-alwaan', 'remise-exacte'],
      },
    },
  );
  const errs = d.discountCodeBasicCreate.userErrors;
  if (errs.length) throw new Error(`Création de la remise impossible : ${errs.map((e) => e.message).join(', ')}`);
  return code;
}
