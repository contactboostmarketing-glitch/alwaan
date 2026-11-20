import { ImageResponse } from 'next/og';
import { defaultZone, getProduct } from '@/lib/catalog';
import { Garment } from '@/components/Garment';

/**
 * Image PNG d'un vêtement (Google Shopping, partages) : /images/produits/<slug>-<couleur hex>.png
 * Le vêtement est dessiné avec un logo d'exemple au cœur. À remplacer par les photos Roly quand elles seront branchées.
 */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const m = (await params).file.match(/^([a-z0-9-]+?)(?:-([0-9a-f]{6}))?\.png$/);
  const p = m && getProduct(m[1]);
  if (!p) return new Response('Introuvable', { status: 404 });
  const color = m[2] && p.colors.includes(`#${m[2]}`) ? `#${m[2]}` : p.colors[0];
  // Vraie photo disponible (Roly) : elle remplace le dessin.
  if (p.photos?.[color]) return Response.redirect(p.photos[color], 302);
  return new ImageResponse(
    (<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6fb' }}>
      <div style={{ display: 'flex', width: 1040, height: 1000 }}><Garment slug={p.slug} color={color} zones={[defaultZone(p)]} width={1040} height={1000} /></div>
    </div>),
    { width: 1200, height: 1200, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
  );
}
