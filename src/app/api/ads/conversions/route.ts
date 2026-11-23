// Conversions « Achat » côté serveur pour Google Ads (import planifié de conversions hors ligne, par clic).
// Chaque commande payée (carte, virement pro reçu…) qui porte un gclid est listée ; les commandes annulées sont retirées
// du suivi par le webhook orders/cancelled et disparaissent donc du fichier.
// Google Ads > Objectifs > Conversions > Importer > Importations planifiées > HTTPS : coller l'URL donnée par
// GET /api/ads/conversions?url (en-tête x-sync-key). Nom de l'action de conversion : ADS_CONVERSION_NAME (défaut « Achat (serveur) »).
import { NextResponse } from 'next/server';
import { adsSync as sync, conversionsCsv, token } from '@/lib/adsConversions';
import { safeEqual } from '@/lib/secure';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const u = new URL(req.url);
  if (!sync()) return new Response('Non configuré', { status: 503 });
  // Adresse à coller dans Google Ads (atelier, clé de synchro).
  if (u.searchParams.has('url')) {
    if (!safeEqual(req.headers.get('x-sync-key'), sync())) return new Response('Non autorisé', { status: 401 });
    return NextResponse.json({ url: `${SITE_URL}/feeds/conversions/${token()}.csv` });
  }
  if (!safeEqual(u.searchParams.get('k'), token())) return new Response('Non autorisé', { status: 401 });
  return conversionsCsv();
}

