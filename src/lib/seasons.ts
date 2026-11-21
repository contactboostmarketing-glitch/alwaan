// Saisons commerciales : l'accueil change d'ambiance et de produits mis en avant selon la date.
// Forcer une saison (test, opération spéciale) : variable SEASON=noel dans Netlify.
import { addBusinessDays, PRODUCTION_DAYS, TRANSIT_DAYS } from './delivery';
import { PRODUCTS, type Product } from './catalog';

export type Season = {
  id: string;
  from: [number, number]; to: [number, number]; // [mois, jour] inclus
  icon: string; accent: string; soft: string;
  fr: { kicker: string; title: string; text: string; cta: string };
  en: { kicker: string; title: string; text: string; cta: string };
  featured: string[]; // produits mis en avant
  categories: string[]; // familles à mettre en avant, dans l'ordre (une famille absente du catalogue est ignorée)
  deadline?: [number, number]; // date limite de réception (ex. Noël) : on affiche « commandez avant le… »
};

export const SEASONS: Season[] = [
  { id: 'janvier', from: [12, 26], to: [2, 15], icon: 'snow', accent: '#2b63d9', soft: '#eaf1ff',
    fr: { kicker: 'Nouvelle année', title: 'Nouvelles tenues pour bien démarrer l\'année', text: 'Équipez les nouveaux arrivants et renouvelez les tenues usées.', cta: 'Équiper mon équipe' },
    en: { kicker: 'New year', title: 'New outfits to start the year right', text: 'Equip new starters and replace worn-out uniforms.', cta: 'Equip my team' },
    featured: ['parka-hv-epsilon', 'veste-hv-persei', 'polo-estrella', 'chemise-moscu-homme'], categories: ['sweats-personnalises', 'haute-visibilite-personnalisee', 'polos-personnalises', 'chemises-personnalisees'] },
  { id: 'printemps', from: [2, 16], to: [6, 15], icon: 'leaf', accent: '#2f8a4d', soft: '#e8f6ee',
    fr: { kicker: 'Ouverture des terrasses', title: 'Vos équipes de salle prêtes pour la saison', text: 'Polos, tabliers et casquettes à votre logo, livrés avant le rush.', cta: 'Préparer la saison' },
    en: { kicker: 'Terrace season', title: 'Your front-of-house team ready for the season', text: 'Polos, aprons and caps with your logo, delivered before the rush.', cta: 'Get ready' },
    featured: ['polo-pegaso', 'tablier-benoit', 'casquette-mercury', 'tablier-mini'], categories: ['vestes-sans-manches-personnalisees', 'polos-personnalises', 'tabliers-personnalises', 'casquettes-personnalisees'] },
  { id: 'ete', from: [6, 16], to: [8, 19], icon: 'sun', accent: '#e8892b', soft: '#fff2e3',
    fr: { kicker: 'Événements et festivals', title: 'T-shirts et casquettes pour vos événements d\'été', text: 'Bénévoles, staff, clubs : tout le monde aux couleurs de l\'événement.', cta: 'Habiller mon événement' },
    en: { kicker: 'Events and festivals', title: 'T-shirts and caps for your summer events', text: 'Volunteers, staff, clubs: everyone in the event’s colours.', cta: 'Dress my event' },
    featured: ['t-shirt-atomic-150', 't-shirt-dogo', 'casquette-wizer', 'casquette-barny'], categories: ['t-shirts-personnalises', 'casquettes-personnalisees', 'polos-personnalises', 'tabliers-personnalises'] },
  { id: 'rentree', from: [8, 20], to: [9, 30], icon: 'briefcase', accent: '#2b63d9', soft: '#eaf1ff',
    fr: { kicker: 'C\'est la rentrée', title: 'Équipez vos équipes pour la rentrée', text: 'Nouvelles recrues, clubs et associations : tout le monde à votre logo.', cta: 'Préparer la rentrée' },
    en: { kicker: 'Back to work', title: 'Equip your teams for September', text: 'New hires, clubs and associations: everyone with your logo.', cta: 'Get ready for September' },
    featured: ['polo-pegaso', 't-shirt-dogo', 'gilet-hv-beta', 'casquette-mercury'], categories: ['polos-personnalises', 't-shirts-personnalises', 'vestes-sans-manches-personnalisees', 'haute-visibilite-personnalisee'] },
  { id: 'halloween', from: [10, 1], to: [10, 31], icon: 'moon', accent: '#ff7a1a', soft: '#fff1e6',
    fr: { kicker: 'Halloween', title: 'Soirées, menus spéciaux, événements : à vos couleurs', text: 'T-shirts noirs et orange, tabliers et casquettes pour vos soirées d\'Halloween.', cta: 'Créer ma tenue Halloween' },
    en: { kicker: 'Halloween', title: 'Parties, special menus, events: in your colours', text: 'Black and orange t-shirts, aprons and caps for your Halloween nights.', cta: 'Create my Halloween outfit' },
    featured: ['t-shirt-dogo', 'tablier-benoit', 'casquette-mercury', 't-shirt-atomic-150'], categories: ['sweats-personnalises', 'vestes-sans-manches-personnalisees', 't-shirts-personnalises', 'haute-visibilite-personnalisee'] },
  { id: 'noel', from: [11, 1], to: [12, 25], icon: 'tree', accent: '#c8302f', soft: '#fdecec', deadline: [12, 24],
    fr: { kicker: 'Noël', title: 'Tenues de fêtes et cadeaux d\'équipe à votre logo', text: 'Marchés de Noël, service des fêtes, cadeaux pour vos salariés et clients.', cta: 'Préparer les fêtes' },
    en: { kicker: 'Christmas', title: 'Festive uniforms and team gifts with your logo', text: 'Christmas markets, holiday service, gifts for your staff and clients.', cta: 'Get ready for the holidays' },
    featured: ['t-shirt-fox', 'casquette-mercury', 'tablier-batali', 'polo-pegaso'], categories: ['sweats-personnalises', 't-shirts-personnalises', 'casquettes-personnalisees', 'tabliers-personnalises'] },
];

const md = (d: Date) => (d.getMonth() + 1) * 100 + d.getDate();
export function currentSeason(now = new Date()): Season {
  const forced = process.env.SEASON && SEASONS.find((s) => s.id === process.env.SEASON);
  if (forced) return forced;
  const x = md(now);
  return SEASONS.find((s) => { const a = s.from[0] * 100 + s.from[1], b = s.to[0] * 100 + s.to[1]; return a <= b ? x >= a && x <= b : x >= a || x <= b; }) ?? SEASONS[1];
}

/** Dernier jour pour commander et être livré avant la date limite de la saison (ex. Noël). */
export function orderBy(s: Season, now = new Date()): Date | null {
  if (!s.deadline) return null;
  const target = new Date(now.getFullYear(), s.deadline[0] - 1, s.deadline[1]);
  let d = new Date(now); d.setHours(10, 0, 0, 0);
  if (addBusinessDays(d, PRODUCTION_DAYS + TRANSIT_DAYS) > target) return null;
  while (addBusinessDays(new Date(d.getTime() + 864e5), PRODUCTION_DAYS + TRANSIT_DAYS) <= target) d = new Date(d.getTime() + 864e5);
  return d;
}

/** Trie une liste selon les familles mises en avant par la saison (les autres gardent leur ordre, après). */
export function seasonalSort<T>(list: T[], catOf: (x: T) => string, season = currentSeason()): T[] {
  const rank = (x: T) => { const i = season.categories.indexOf(catOf(x)); return i < 0 ? 99 : i; };
  return list.map((x, i) => [x, i] as const).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([x]) => x);
}

/** Produits mis en avant : le produit phare de chaque famille de saison d'abord, puis la sélection manuelle. */
export function seasonFeatured(season = currentSeason(), n = 4): Product[] {
  const lead = season.categories.flatMap((c) => { const l = PRODUCTS.filter((p) => p.category === c); const x = l.find((p) => p.bestseller) ?? l[0]; return x ? [x] : []; });
  const manual = season.featured.flatMap((slug) => PRODUCTS.filter((p) => p.slug === slug));
  return [...new Map([...lead, ...manual].map((p) => [p.slug, p])).values()].slice(0, n);
}
