import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { limited, tooMany } from '@/lib/rateLimit';
import { getOrder, submitReview } from '@/lib/reviews';
import { checkSig } from '@/lib/secure';

/** Lien d'avis reçu par email (commande + signature). */
export async function GET(req: Request) {
  const u = new URL(req.url), o = u.searchParams.get('o') || '';
  if (!checkSig('avis', o, u.searchParams.get('sig'))) return NextResponse.json({ error: 'Lien invalide.' }, { status: 403 });
  const order = await getOrder(o);
  if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  return NextResponse.json({ name: order.name, done: !!order.avisId, products: (order.slugs || []).map((s) => ({ slug: s, name: getProduct(s)?.name || s })) });
}
export async function POST(req: Request) {
  if (await limited(req, 'avis', 10, 3600)) return tooMany();
  const b = await req.json().catch(() => null);
  const o = String(b?.o || '');
  if (!checkSig('avis', o, b?.sig)) return NextResponse.json({ error: 'Lien invalide.' }, { status: 403 });
  const r = await submitReview(o, b || {});
  return r.error ? NextResponse.json(r, { status: 400 }) : NextResponse.json(r);
}
