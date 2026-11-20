// Calendrier des fêtes (France) : la prochaine fête est mise en avant quelques semaines avant,
// avec ses designs et la date limite de commande pour être livré à temps.
import { addBusinessDays, PRODUCTION_DAYS, TRANSIT_DAYS } from './delivery';

export type GiftEvent = { id: string; emoji: string; date: Date; designs: string[]; occasion: string; fr: string; en: string };

const nthSunday = (y: number, m: number, n: number) => { const d = new Date(y, m, 1); d.setDate(1 + ((7 - d.getDay()) % 7) + (n - 1) * 7); return d; };
const lastSunday = (y: number, m: number) => { const d = new Date(y, m + 1, 0); d.setDate(d.getDate() - d.getDay()); return d; };
function easter(y: number) { // calcul de Pâques (algorithme de Meeus)
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}
/** Fête des mères : dernier dimanche de mai, décalée au 1er dimanche de juin si c'est la Pentecôte. */
function mothersDay(y: number) {
  const d = lastSunday(y, 4), pentecost = new Date(easter(y).getTime() + 49 * 864e5);
  return d.toDateString() === pentecost.toDateString() ? nthSunday(y, 5, 1) : d;
}

export function giftEvents(y: number): GiftEvent[] {
  return [
    { id: 'saint-valentin', emoji: '❤️', date: new Date(y, 1, 14), designs: ['love'], occasion: 'saint-valentin', fr: 'Saint-Valentin', en: 'Valentine’s Day' },
    { id: 'grands-meres', emoji: '👵', date: nthSunday(y, 2, 1), designs: ['mamie-en-or', 'super-papi'], occasion: 'papi-mamie', fr: 'Fête des grands-mères', en: 'Grandmothers’ Day' },
    { id: 'meres', emoji: '💐', date: mothersDay(y), designs: ['meilleure-maman', 'mamie-en-or'], occasion: 'famille', fr: 'Fête des mères', en: 'Mother’s Day' },
    { id: 'peres', emoji: '👔', date: nthSunday(y, 5, 3), designs: ['papa-depuis', 'chef-papa', 'super-papi'], occasion: 'famille', fr: 'Fête des pères', en: 'Father’s Day' },
    { id: 'retraites-ete', emoji: '🏖️', date: new Date(y, 5, 30), designs: ['retraite-officielle', 'retraite-mission'], occasion: 'retraite', fr: 'Départs en retraite de l’été', en: 'Summer retirements' },
    { id: 'grands-peres', emoji: '👴', date: nthSunday(y, 9, 1), designs: ['super-papi', 'papi-depuis'], occasion: 'papi-mamie', fr: 'Fête des grands-pères', en: 'Grandfathers’ Day' },
    { id: 'noel', emoji: '🎄', date: new Date(y, 11, 24), designs: ['noel-famille', 'super-papi', 'mamie-en-or'], occasion: 'famille', fr: 'Noël', en: 'Christmas' },
  ];
}

/** Dernier jour pour commander et recevoir avant la date (production standard + transport). */
export function lastOrderDay(target: Date, now = new Date()): Date | null {
  const t = new Date(target); t.setHours(0, 0, 0, 0);
  let d = new Date(now); d.setHours(10, 0, 0, 0);
  const ok = (x: Date) => addBusinessDays(x, PRODUCTION_DAYS + TRANSIT_DAYS) <= t;
  if (!ok(d)) return null;
  while (ok(new Date(d.getTime() + 864e5))) d = new Date(d.getTime() + 864e5);
  return d;
}

/** Prochaine fête dans les 60 jours (encore livrable à temps de préférence). */
export function nextGiftEvent(now = new Date()): (GiftEvent & { orderBy: Date | null }) | null {
  const all = [...giftEvents(now.getFullYear()), ...giftEvents(now.getFullYear() + 1)].filter((e) => e.date.getTime() >= now.getTime() - 864e5 && e.date.getTime() - now.getTime() <= 60 * 864e5);
  const e = all.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  return e ? { ...e, orderBy: lastOrderDay(e.date, now) } : null;
}
