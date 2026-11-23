// Correspondance entre une couleur du site et un coloris Roly : par le nom d'abord, puis par la teinte la plus proche.
import { COLOR_NAMES } from './catalog';

const NAMES: Record<string, string[]> = {
  Blanc: ['BLANC', 'BLANC PERLE'], Jaune: ['JAUNE'], Orange: ['ORANGE', 'ORANGE (FEU)'], Rouge: ['ROUGE', 'ROUGE/BLANC'], Bordeaux: ['GRENAT', 'GRENAT CHINÉ'],
  Royal: ['BLEU ROYAL', 'BLEU ROYAL/BLANC', 'BLEU ÉLECTRIQUE'], Marine: ['MARINE', 'MARINE/BLANC', 'DENIM CHINÉ'], Turquoise: ['TURQUOISE', 'TURQUOISE CHINÉ'],
  Vert: ['VERT BOUTEILLE', 'VERT KELLY', 'VERT BOUTEILLE CHINÉ', 'VERT FOUGÈRE'], 'Gris chiné': ['GRIS CHINÉ'], Noir: ['NOIR', 'NOIR/BLANC', 'NOIR CHINÉ'],
  Sable: ['SABLE', 'SABLE FONCÉ'], 'Jaune fluo': ['JAUNE FLUO', 'MARINE/JAUNE FLUO'], 'Orange fluo': ['ORANGE FLUO', 'MARINE/ORANGE FLUO'],
  Kaki: ['VERT MILITAIRE', 'VERT MILITAIRE FONCÉ'], Anthracite: ['PLOMB FONCÉ', 'ÉBÈNE', 'PLOMB'], Fuchsia: ['FUCHSIA'],
};
const dist = (a: string, b?: string) => {
  if (!b) return 1e9;
  const x = parseInt(a.slice(1), 16), y = parseInt(b.replace('#', ''), 16);
  return Math.abs((x >> 16) - (y >> 16)) + Math.abs(((x >> 8) & 255) - ((y >> 8) & 255)) + Math.abs((x & 255) - (y & 255));
};
export function rolyColor<T extends { name: string; hex?: string }>(colors: T[], siteHex: string): T | undefined {
  if (!colors.length) return undefined;
  for (const n of NAMES[COLOR_NAMES[siteHex]] || []) { const c = colors.find((x) => x.name.trim() === n); if (c) return c; }
  return [...colors].sort((a, b) => dist(siteHex, a.hex) - dist(siteHex, b.hex))[0];
}
