import { NextResponse } from 'next/server';
import { getCart } from '@/lib/savedCart';

/** Panier enregistré (commande passée ou devis) pour le remettre dans le panier du client. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCart((await params).id);
  if (!c) return NextResponse.json({ error: 'Lien introuvable ou expiré.' }, { status: 404 });
  return NextResponse.json({ kind: c.kind, createdAt: c.createdAt, lines: c.lines, promo: c.promo, quote: c.quote && { number: c.quote.number, validUntil: c.quote.validUntil } });
}
