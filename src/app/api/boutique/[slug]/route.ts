import { NextResponse } from 'next/server';
import { getShop } from '@/lib/shops';

/** Boutique publique (sans l'email du propriétaire ni ses statistiques). */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const s = await getShop((await params).slug);
  if (!s || !s.active) return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 });
  return NextResponse.json({ slug: s.slug, name: s.name, logoId: s.logoId, items: s.items });
}
