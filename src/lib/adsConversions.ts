// Conversions « Achat » pour Google Ads (import planifié de conversions hors ligne, par clic).
import { createHmac } from 'crypto';
import { getJSON, listKeys } from './blobStore';

type Rec = { name?: string; value?: number; createdAt?: string; paidAt?: string; ads?: { gclid?: string } };

export const adsSync = () => process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY || '';
export const token = () => createHmac('sha256', adsSync()).update('ads-conversions').digest('hex').slice(0, 32);

/** Date au format attendu par Google Ads (heure de Paris, déclarée dans l'en-tête du fichier). */
function paris(iso: string) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
  const g = (t: string) => f.find((x) => x.type === t)?.value || '00';
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
}
const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/** Fichier CSV des conversions (Google Ads exige une adresse se terminant par .csv : /feeds/conversions/<clé>.csv). */
export async function conversionsCsv() {
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
