import { NextResponse } from 'next/server';
import { ROLY_MODEL } from '@/lib/catalog';
import { rolyCatalog, rolyEnabled } from '@/lib/roly';

/**
 * Photos du vêtement (fournies par Roly) pour les vignettes de la fiche produit :
 * photos du modèle porté, puis photos par coloris (face, dos, détails). Mises en cache 1 jour sur le CDN.
 */
const urls = (s?: string) => (s || '').split(/[\s;,|]+/).filter((u) => /^https:\/\//.test(u));
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const model = ROLY_MODEL[(await params).slug];
  if (!model || !rolyEnabled()) return NextResponse.json({ model: [], colors: [] });
  try {
    const items = await rolyCatalog([model]);
    const colors = new Map<string, { name: string; hex?: string; images: string[] }>();
    const modelImgs = new Set<string>();
    for (const it of items) {
      urls(it.modelimage).forEach((u) => modelImgs.add(u));
      const c = colors.get(it.colorcode) || { name: it.colorname, hex: it.colordata?.hexcode, images: [] };
      for (const u of [...urls(it.productimage), ...urls(it.viewsimages), ...urls(it.detailsimages)]) if (!c.images.includes(u)) c.images.push(u);
      colors.set(it.colorcode, c);
    }
    return NextResponse.json({ model: [...modelImgs].slice(0, 6), colors: [...colors.values()].map((c) => ({ ...c, images: c.images.slice(0, 6) })) },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
  } catch (e) {
    console.error('[photos]', e);
    return NextResponse.json({ model: [], colors: [] }, { headers: { 'Cache-Control': 'public, s-maxage=600' } });
  }
}
