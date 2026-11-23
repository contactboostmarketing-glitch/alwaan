// Date de réception estimée : production en jours ouvrés + transport (hors jours fériés).
export const PRODUCTION_DAYS = 7, EXPRESS_DAYS = 4, TRANSIT_DAYS = 2, BLANK_DAYS = 2; // textile vierge : préparation seule

/** Jours fériés français (l'atelier est dans le Nord) : fixes + dérivés de Pâques. */
const holidayCache = new Map<number, Set<string>>();
function holidays(y: number): Set<string> {
  const hit = holidayCache.get(y); if (hit) return hit;
  // Dimanche de Pâques (algorithme de Meeus / Jones / Butcher).
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  const key = (x: Date) => `${x.getMonth() + 1}-${x.getDate()}`;
  const easter = (n: number) => key(new Date(y, month - 1, day + n));
  const set = new Set(['1-1', '5-1', '5-8', '7-14', '8-15', '11-1', '11-11', '12-25', easter(1), easter(39), easter(50)]);
  holidayCache.set(y, set);
  return set;
}
export const isBusinessDay = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6 && !holidays(d.getFullYear()).has(`${d.getMonth() + 1}-${d.getDate()}`);

/** Ajoute n jours ouvrés (hors week-ends et jours fériés). cutoff : une commande après 14 h démarre le jour ouvré suivant. */
export function addBusinessDays(d: Date, n: number, cutoff = true): Date {
  const r = new Date(d);
  if (cutoff && (r.getHours() >= 14 || !isBusinessDay(r))) n += 1;
  while (n > 0) { r.setDate(r.getDate() + 1); if (isBusinessDay(r)) n--; }
  return r;
}
import { onOrderDays } from './stockTypes';
/** Date de réception indicative (production standard ou express + transport, + réception fournisseur si sur commande). */
export const deliveryDate = (from = new Date(), express = false, onOrder = false, blankOnly = false, extraDays = 0) =>
  addBusinessDays(from, (blankOnly ? BLANK_DAYS : express ? EXPRESS_DAYS : PRODUCTION_DAYS) + TRANSIT_DAYS + (onOrder ? onOrderDays(blankOnly) : 0) + extraDays);
export const fmtDay = (d: Date, lang: 'fr' | 'en' = 'fr') => d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
