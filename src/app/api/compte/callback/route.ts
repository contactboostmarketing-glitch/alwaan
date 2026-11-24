import { NextResponse } from 'next/server';
import { OAUTH, SESSION, exchangeCode } from '@/lib/customer';
import { cookieOf, seal, setCookie, unseal } from '@/lib/session';
import { publicOrigin } from '@/lib/site';

/** Retour de Shopify après connexion : échange du code contre la session du client. */
export async function GET(req: Request) {
  const origin = publicOrigin(req);
  const url = new URL(req.url);
  const o = unseal<{ state: string; verifier: string; lang: 'fr' | 'en' }>(cookieOf(req, OAUTH));
  const base = `${origin}${o?.lang === 'en' ? '/en' : ''}/compte`;
  if (!o || url.searchParams.get('state') !== o.state || !url.searchParams.get('code')) return NextResponse.redirect(`${base}?erreur=connexion`);
  try {
    const s = await exchangeCode(url.searchParams.get('code')!, o.verifier, `${origin}/api/compte/callback`, origin);
    const res = NextResponse.redirect(base);
    res.headers.append('Set-Cookie', setCookie(SESSION, seal(s), 30 * 86400));
    res.headers.append('Set-Cookie', setCookie(OAUTH, '', 0));
    return res;
  } catch (e) {
    console.error('[compte]', e);
    return NextResponse.redirect(`${base}?erreur=connexion`);
  }
}
