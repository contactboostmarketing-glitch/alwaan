// Import planifié Google Ads : https://alwaan.fr/feeds/conversions/<clé>.csv (clé donnée par GET /api/ads/conversions?url).
import { conversionsCsv, token } from '@/lib/adsConversions';
import { safeEqual } from '@/lib/secure';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const k = file.replace(/\.csv$/, '');
  if (!(process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY) || !safeEqual(k, token())) return new Response('Non autorisé', { status: 401 });
  return conversionsCsv();
}
