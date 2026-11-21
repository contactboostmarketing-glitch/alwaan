// Date de réception estimée : production en jours ouvrés + transport (hors jours fériés).
export const PRODUCTION_DAYS = 7, EXPRESS_DAYS = 4, TRANSIT_DAYS = 2, BLANK_DAYS = 2; // textile vierge : préparation seule

export function addBusinessDays(d: Date, n: number): Date {
  const r = new Date(d);
  // Commande après 14 h : la production démarre le jour ouvré suivant.
  if (r.getHours() >= 14) n += 1;
  while (n > 0) { r.setDate(r.getDate() + 1); const w = r.getDay(); if (w !== 0 && w !== 6) n--; }
  return r;
}
import { ON_ORDER_DAYS } from './stockTypes';
/** Date de réception indicative (production standard ou express + transport, + réception fournisseur si sur commande). */
export const deliveryDate = (from = new Date(), express = false, onOrder = false, blankOnly = false) =>
  addBusinessDays(from, (blankOnly ? BLANK_DAYS : express ? EXPRESS_DAYS : PRODUCTION_DAYS) + TRANSIT_DAYS + (onOrder ? ON_ORDER_DAYS : 0));
export const fmtDay = (d: Date, lang: 'fr' | 'en' = 'fr') => d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
