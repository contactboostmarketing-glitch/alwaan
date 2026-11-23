// Conversions « Achat » côté serveur pour Google Ads (import planifié de conversions hors ligne, par clic).
// Chaque commande payée (carte, virement pro reçu…) qui porte un gclid est listée ; les commandes annulées sont retirées
// du suivi par le webhook orders/cancelled et disparaissent donc du fichier.
// Google Ads > Objectifs > Conversions > Importer > Importations planifiées > HTTPS : coller l'URL donnée par
// GET /api/ads/conversions?url (en-tête x-sync-key). Nom de l'action de conversion : ADS_CONVERSION_NAME (défaut « Achat (serveur) »).
import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';
import { getJSON, listKeys } from '@/lib/blobStore';
import { safeEqual } from '@/lib/secure';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Rec = { name?: string; value?: number; createdAt?: string; paidAt?: string; ads?: { gclid?: string } };

const sync = () => process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY || '';
const token = () => createHmac('sha256', sync()).update('ads-conversions').digest('hex').slice(0, 32);

/** Date au format attendu par Google Ads (heure de Paris, déclarée dans l'en-tête du fichier). */
function paris(iso: string) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
  const g = (t: string) => f.find((x) => x.type === t)?.value || '00';
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
}
const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export async function GET(req: Request) {
  const u = new URL(req.url);
  if (!sync()) return new Response('Non configuré', { status: 503 });
  // Adresse à coller dans Google Ads (atelier, clé de synchro).
  if (u.searchParams.has('url')) {
    if (!safeEqual(req.headers.get('x-sync-key'), sync())) return new Response('Non autorisé', { status: 401 });
    return NextResponse.json({ url: `${SITE_URL}/api/ads/conversions?k=${token()}` });
  }
  if (!safeEqual(u.searchParams.get('k'), token())) return new Response('Non autorisé', { status: 401 });

  const name = process.env.ADS_CONVERSION_NAME || 'Achat (serveur)';
  const since = Date.now() - 90 * 864e5; // Google Ads n'accepte pas les clics de plus de 90 jours
  const rows: string[] = [];
  for (const k of await listKeys('commandes')) {
    const o = await getJSON<Rec>('commandes', k);
    const gclid = o?.ads?.gclid;
    const at = o?.paidAt || o?.createdAt;
    if (!o || !gclid || !at || new Date(at).getTime() < since) continue;
    rows.push([gclid, name, paris(at), (o.value || 0).toFixed(2), 'EUR', o.name || k].map(cell).join(','));
  }
  const csv = ['Parameters:TimeZone=Europe/Paris', 'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID', ...rows].join('\n');
  return new Response(csv + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store' } });
}
