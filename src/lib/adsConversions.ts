// Conversions « Achat » pour Google Ads (import planifié de conversions hors ligne, par clic).
import { createHmac } from 'crypto';
import { getJSON, listKeys } from './blobStore';

type Rec = { name?: string; value?: number; createdAt?: string; paidAt?: string; ads?: { gclid?: string } };

export const adsSync = () => process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY || '';
export const token = () => createHmac('sha256', adsSync()).update('ads-conversions').digest('hex').slice(0, 32);

/** Date ISO 8601 à l'heure de Paris avec son décalage (ex. 2026-11-23T15:00:41+01:00) : lisible par le Gestionnaire de données Google. */
function paris(iso: string) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
  const g = (x: string) => f.find((p) => p.type === x)?.value || '00';
  const local = Date.UTC(+g('year'), +g('month') - 1, +g('day'), +g('hour') % 24, +g('minute'), +g('second'));
  const off = Math.round((local - Math.floor(d.getTime() / 1000) * 1000) / 60000);
  const sign = off >= 0 ? '+' : '-', h = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0'), m = String(Math.abs(off) % 60).padStart(2, '0');
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}:${g('second')}${sign}${h}:${m}`;
}
const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/** Fichier CSV des conversions (Google Ads exige une adresse se terminant par .csv : /feeds/conversions/<clé>.csv). */
export async function conversionsCsv() {
  const since = Date.now() - 90 * 864e5; // Google Ads n'accepte pas les clics de plus de 90 jours
  const rows: string[] = [];
  for (const k of await listKeys('commandes')) {
    const o = await getJSON<Rec>('commandes', k);
    const gclid = o?.ads?.gclid;
    const at = o?.paidAt || o?.createdAt;
    if (!o || !gclid || !at || new Date(at).getTime() < since) continue;
    rows.push([gclid, paris(at), (o.value || 0).toFixed(2), 'EUR', o.name || k].map(cell).join(','));
  }
  // Première ligne = titres des colonnes (le Gestionnaire de données de Google les propose à la correspondance).
  const csv = ['Google Click ID,Conversion Time,Conversion Value,Conversion Currency,Order ID', ...rows].join('\n');
  return new Response(csv + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store' } });
}
