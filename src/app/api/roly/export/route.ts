import { NextResponse } from 'next/server';
import { ROLY_MODEL } from '@/lib/catalog';
import { rolyCatalog, rolyEnabled } from '@/lib/roly';
import { safeEqual } from '@/lib/secure';

/** Export des données Roly des modèles vendus (couleurs, tailles, mesures, composition, photos), pour figer src/lib/rolyData.ts. Clé de synchro. */
export const maxDuration = 60;
const urls = (s?: string) => (s || '').split(/[\s;,|]+/).filter((u) => /^https:\/\//.test(u));
export async function GET(req: Request) {
  const key = req.headers.get('x-sync-key');
  if (![process.env.SYNC_KEY, process.env.ROLY_SYNC_KEY].some((k) => k && safeEqual(key, k))) return new Response('Non autorisé', { status: 401 });
  if (!rolyEnabled()) return NextResponse.json({ error: 'Roly non configuré' }, { status: 503 });
  const out: Record<string, unknown> = {};
  for (const [slug, model] of Object.entries(ROLY_MODEL)) {
    try {
      const items = await rolyCatalog([model]);
      const colors = new Map<string, { code: string; name: string; hex?: string; images: string[] }>();
      const sizes = new Map<string, string>();
      const modelImgs = new Set<string>();
      for (const it of items) {
        if (it.measures && !sizes.has(it.sizename)) sizes.set(it.sizename, it.measures);
        urls(it.modelimage).forEach((u) => modelImgs.add(u));
        const c = colors.get(it.colorcode) || { code: it.colorcode, name: it.colorname, hex: it.colordata?.hexcode, images: [] };
        for (const u of [...urls(it.productimage), ...urls(it.viewsimages), ...urls(it.detailsimages)]) if (!c.images.includes(u) && c.images.length < 6) c.images.push(u);
        colors.set(it.colorcode, c);
      }
      const first = items[0];
      out[slug] = { model, name: first?.modelname, description: first?.description, composition: first?.composition, observations: first?.observations,
        sizes: Object.fromEntries(sizes), colors: [...colors.values()], modelImages: [...modelImgs].slice(0, 4) };
    } catch (e) { out[slug] = { error: String((e as Error).message).slice(0, 200) }; }
  }
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
