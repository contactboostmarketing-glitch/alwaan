import { NextResponse } from 'next/server';
import { OAUTH, customerEnabled, discovery, pkce } from '@/lib/customer';
import { seal, setCookie } from '@/lib/session';
import { publicOrigin } from '@/lib/site';
import { randomBytes } from 'crypto';

/** Redirige vers la page de connexion Shopify (code reçu par email). */
export async function GET(req: Request) {
  const origin = publicOrigin(req);
  const url = new URL(req.url), lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr';
  if (!customerEnabled()) return NextResponse.redirect(`${origin}${lang === 'en' ? '/en' : ''}/compte?erreur=config`);
  const d = await discovery();
  const { verifier, challenge } = pkce();
  const state = randomBytes(16).toString('hex'), nonce = randomBytes(16).toString('hex');
  const auth = new URL(d.authorization_endpoint);
  auth.search = new URLSearchParams({
    client_id: process.env.SHOPIFY_CUSTOMER_CLIENT_ID!, response_type: 'code', redirect_uri: `${origin}/api/compte/callback`,
    scope: 'openid email customer-account-api:full', state, nonce, code_challenge: challenge, code_challenge_method: 'S256', locale: lang,
  }).toString();
  const res = NextResponse.redirect(auth.toString());
  res.headers.append('Set-Cookie', setCookie(OAUTH, seal({ state, verifier, lang }), 600));
  return res;
}
