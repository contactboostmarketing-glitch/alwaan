import { LOGO_ID, readLogo } from '@/lib/logoStore';

/** Téléchargement du logo pour l'atelier (lien joint à chaque ligne de commande Shopify). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!LOGO_ID.test(id)) return new Response('Introuvable', { status: 404 });
  const f = await readLogo(id);
  if (!f) return new Response('Introuvable', { status: 404 });
  return new Response(f.data, {
    headers: {
      // Toujours en téléchargement : un SVG ou un PDF ne s'exécute jamais dans le navigateur.
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${f.name.replace(/[^\w.\- ]/g, '_')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex',
    },
  });
}
