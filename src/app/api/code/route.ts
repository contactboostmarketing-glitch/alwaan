import { NextResponse } from 'next/server';
import { PROMO_CODES } from '@/lib/catalog';
import { lookupCode } from '@/lib/vouchers';

/** Vérifie un code saisi dans le panier : code promo, code parrain ou bon d'achat. */
export async function GET(req: Request) {
  const c = (new URL(req.url).searchParams.get('c') || '').trim().toUpperCase().slice(0, 20);
  if (PROMO_CODES[c]) return NextResponse.json({ ok: true, kind: 'promo', code: c, rate: PROMO_CODES[c] });
  const v = await lookupCode(c);
  if (!v) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, kind: v.kind, code: c, amount: v.amount, min: v.min });
}
