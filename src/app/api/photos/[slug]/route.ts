import { NextResponse } from 'next/server';
import { ROLY_PHOTOS } from '@/lib/rolyPhotos';

/** Photos du vêtement (Roly, figées dans src/lib/rolyPhotos.ts) pour les vignettes de la fiche produit. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const p = ROLY_PHOTOS[(await params).slug];
  return NextResponse.json(p || { model: [], colors: [] }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
}
