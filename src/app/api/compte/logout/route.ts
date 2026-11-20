import { NextResponse } from 'next/server';
import { SESSION, discovery, type Session } from '@/lib/customer';
import { cookieOf, setCookie, unseal } from '@/lib/session';
import { publicOrigin } from '@/lib/site';

export async function GET(req: Request) {
  const origin = publicOrigin(req);
  const s = unseal<Session>(cookieOf(req, SESSION));
  let to = `${origin}/compte`;
  if (s?.idToken) {
    try { const d = await discovery(); to = `${d.end_session_endpoint}?${new URLSearchParams({ id_token_hint: s.idToken, post_logout_redirect_uri: `${origin}/compte` })}`; } catch {}
  }
  const res = NextResponse.redirect(to);
  res.headers.append('Set-Cookie', setCookie(SESSION, '', 0));
  return res;
}
