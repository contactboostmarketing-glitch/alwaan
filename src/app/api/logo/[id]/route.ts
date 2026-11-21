import { LOGO_ID, readLogo } from '@/lib/logoStore';

/** Téléchargement du logo pour l'atelier (lien joint à chaque ligne de commande Shopify). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!LOGO_ID.test(id)) return new Response('Introuvable', { status: 404 });
  const f = await readLogo(id);
  if (!f) return new Response('Introuvable', { status: 404 });
  const ext = id.split('.').pop()!;
  // Aperçu dans la page pour les images simples (jamais SVG ni PDF, qui peuvent contenir du code).
  if (new URL(req.url).searchParams.has('apercu') && ['png', 'jpg', 'webp', 'gif'].includes(ext)) {
    return new Response(f.data, { headers: { 'Content-Type': ext === 'jpg' ? 'image/jpeg' : `image/${ext}`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=31536000, immutable', 'X-Robots-Tag': 'noindex' } });
  }
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
