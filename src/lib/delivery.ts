// Date de réception estimée : production en jours ouvrés + transport (hors jours fériés).
export const PRODUCTION_DAYS = 7, TRANSIT_DAYS = 2;

export function addBusinessDays(d: Date, n: number): Date {
  const r = new Date(d);
  // Commande après 14 h : la production démarre le jour ouvré suivant.
  if (r.getHours() >= 14) n += 1;
  while (n > 0) { r.setDate(r.getDate() + 1); const w = r.getDay(); if (w !== 0 && w !== 6) n--; }
  return r;
}
export const deliveryDate = (from = new Date()) => addBusinessDays(from, PRODUCTION_DAYS + TRANSIT_DAYS);
export const fmtDay = (d: Date, lang: 'fr' | 'en' = 'fr') => d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
