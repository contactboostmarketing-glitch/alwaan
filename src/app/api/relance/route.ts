import { NextResponse } from 'next/server';
import { sanitize } from '@/lib/cartSanitize';
import { RELANCE_CODE, promoRate } from '@/lib/catalog';
import { limited, tooMany } from '@/lib/rateLimit';
import { closeRelance, createRelance, touchRelance } from '@/lib/relance';
import { checkSig } from '@/lib/secure';
import { unsubscribeOrders } from '@/lib/postPurchase';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

/** « Recevoir mon panier par email » (crée la relance) et retour du client sur son panier (activité). */
export async function POST(req: Request) {
  if (await limited(req, 'relance', 10, 3600)) return tooMany();
  const b = await req.json().catch(() => null);
  if (b?.action === 'activite' && typeof b.id === 'string') { await touchRelance(b.id); return NextResponse.json({ ok: true }); }
  const email = String(b?.email || '').trim();
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  const lines = sanitize(b?.lines);
  if (!lines) return NextResponse.json({ error: 'Panier incomplet.' }, { status: 400 });
  const promo = b?.promo && promoRate(String(b.promo)) && !RELANCE_CODE.test(String(b.promo).toUpperCase()) ? String(b.promo).toUpperCase() : null;
  const r = await createRelance(email, lines, { promo, express: b?.express === true, lang: b?.lang });
  return NextResponse.json({ id: r.id, sent: r.log[0] });
}

/** Lien de désinscription présent dans chaque email. */
export async function GET(req: Request) {
  const u = new URL(req.url), id = u.searchParams.get('stop') || '', cmd = u.searchParams.get('stopc') || '';
  if (cmd && checkSig('cmd', cmd, u.searchParams.get('sig'))) await unsubscribeOrders(cmd);
  else if (checkSig('relance', id, u.searchParams.get('sig'))) await closeRelance(id, 'desinscrit');
  else return new Response('Lien invalide.', { status: 403 });
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:Arial;padding:40px;text-align:center"><h1>C\'est noté</h1><p>Vous ne recevrez plus ces emails.</p><p><a href="/">Retour sur alwaan</a></p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
