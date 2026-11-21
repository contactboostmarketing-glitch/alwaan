// Espace client : connexion via Shopify (Customer Account API, code envoyé par email, sans mot de passe).
// Réglages : SHOPIFY_CUSTOMER_CLIENT_ID (+ SHOPIFY_CUSTOMER_CLIENT_SECRET si client « confidentiel »).
import { createHash, randomBytes } from 'crypto';
import { cookieOf, seal, setCookie, unseal } from './session';

export const SESSION = 'alw_compte', OAUTH = 'alw_oauth';
export type Session = { access: string; refresh: string; idToken?: string; exp: number };
type Discovery = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint: string; graphql_api: string };

export const customerEnabled = () => !!(process.env.SHOPIFY_CUSTOMER_CLIENT_ID && process.env.SHOPIFY_STORE_DOMAIN);

let disc: Discovery | null = null;
export async function discovery(): Promise<Discovery> {
  if (disc) return disc;
  const shop = `https://${process.env.SHOPIFY_STORE_DOMAIN}`;
  const [a, b] = await Promise.all([
    fetch(`${shop}/.well-known/openid-configuration`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${shop}/.well-known/customer-account-api`, { cache: 'no-store' }).then((r) => r.json()),
  ]);
  disc = { authorization_endpoint: a.authorization_endpoint, token_endpoint: a.token_endpoint, end_session_endpoint: a.end_session_endpoint, graphql_api: b.graphql_api };
  return disc;
}

const b64url = (b: Buffer) => b.toString('base64url');
export function pkce() {
  const verifier = b64url(randomBytes(32));
  return { verifier, challenge: b64url(createHash('sha256').update(verifier).digest()) };
}

async function tokenRequest(params: Record<string, string>, origin: string) {
  const d = await discovery();
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const id = process.env.SHOPIFY_CUSTOMER_CLIENT_ID!, secret = process.env.SHOPIFY_CUSTOMER_CLIENT_SECRET;
  if (secret) headers.Authorization = `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
  else headers.Origin = origin; // client public : l'origine doit être déclarée dans Shopify
  const r = await fetch(d.token_endpoint, { method: 'POST', headers, body: new URLSearchParams({ client_id: id, ...params }), cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Connexion refusée par Shopify (${r.status} ${j.error || ''})`);
  return { access: j.access_token as string, refresh: j.refresh_token as string, idToken: j.id_token as string | undefined, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
}
export const exchangeCode = (code: string, verifier: string, redirect: string, origin: string) =>
  tokenRequest({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirect }, origin);

/** Session du client (renouvelée si besoin). setCookieHeader est à renvoyer quand la session a été renouvelée. */
export async function getSession(req: Request, origin: string): Promise<{ s: Session | null; setCookieHeader?: string }> {
  const s = unseal<Session>(cookieOf(req, SESSION));
  if (!s) return { s: null };
  if (s.exp > Date.now() + 60_000) return { s };
  try {
    const n = await tokenRequest({ grant_type: 'refresh_token', refresh_token: s.refresh }, origin);
    const fresh = { ...n, idToken: n.idToken || s.idToken };
    return { s: fresh, setCookieHeader: setCookie(SESSION, seal(fresh), 30 * 86400) };
  } catch { return { s: null }; }
}

/** Email du client connecté (ou null). */
export async function sessionEmail(req: Request, origin: string): Promise<string | null> {
  const { s } = await getSession(req, origin);
  if (!s) return null;
  try { return (await customerQuery<{ customer: { emailAddress?: { emailAddress: string } } }>(s, '{ customer { emailAddress { emailAddress } } }')).customer.emailAddress?.emailAddress || null; }
  catch { return null; }
}

export async function customerQuery<T>(s: Session, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const d = await discovery();
  const r = await fetch(d.graphql_api, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: s.access }, body: JSON.stringify({ query, variables }), cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.errors) throw new Error(`Espace client Shopify : ${JSON.stringify(j.errors || r.status).slice(0, 200)}`);
  return j.data as T;
}
