import { ROLY_INFO } from '@/lib/rolyInfo';
// Langues du site : français (par défaut, à la racine) et anglais (/en).
// Les textes sont écrits en français dans le code ; t() renvoie la traduction anglaise du dictionnaire.
import { COLOR_NAMES, getCategory, getSector, zonesFor, type Category, type Product, type Sector, type Zone } from '@/lib/catalog';
import { CATEGORIES_EN, COLOR_EN, GENERAL_FAQ_EN, PRODUCTS_EN, SECTORS_EN, ZONE_EN } from './catalog-en';
import { EN } from './en';

export type Lang = 'fr' | 'en';
export const langOf = (path: string | null | undefined): Lang => (path === '/en' || path?.startsWith('/en/') ? 'en' : 'fr');

/** Traduction d'un texte (clé = texte français), avec variables {nom}. */
export function tr(lang: Lang, fr: string, vars?: Record<string, string | number>): string {
  let s = lang === 'en' ? EN[fr] ?? fr : fr;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

// Correspondance des adresses françaises → anglaises. Les pages non traduites (guides, CGV…) restent en français.
const MAP: [string, string][] = [['/vetements/', '/en/clothing/'], ['/produits/', '/en/products/'], ['/metiers/', '/en/industries/'], ['/panier', '/en/cart'], ['/assistant', '/en/assistant'], ['/faq', '/en/faq'], ['/devis', '/en/quote'], ['/compte', '/en/account'], ['/equipe/', '/en/team/'], ['/boutique/', '/en/shop/'], ['/lien-equipe', '/en/team-link'], ['/idees-cadeaux', '/en/gift-ideas'], ['/textile-vierge', '/en/blank-garments'], ['/notre-atelier', '/en/our-workshop'], ['/realisations', '/en/our-work'], ['/clubs-associations', '/en/clubs'], ['/recherche', '/en/search'], ['/vetements-de-travail-personnalises', '/en/custom-workwear']];
export function href(lang: Lang, fr: string): string {
  if (lang === 'fr') return fr;
  if (fr === '/') return '/en';
  for (const [a, b] of MAP) if (fr === a.replace(/\/$/, '') || fr.startsWith(a)) return b + fr.slice(a.length).replace(/^\//, a.endsWith('/') ? '' : '/');
  return fr;
}
/** Adresse française d'une page anglaise (pour le sélecteur de langue et hreflang). */
export function frPath(en: string): string {
  if (en === '/en') return '/';
  for (const [a, b] of MAP) if (en === b.replace(/\/$/, '') || en.startsWith(b)) return a + en.slice(b.length).replace(/^\//, b.endsWith('/') ? '' : '/');
  return en.replace(/^\/en/, '') || '/';
}

export const colorName = (lang: Lang, hex: string) => (lang === 'en' ? COLOR_EN[hex] : COLOR_NAMES[hex]) || hex;
// Composition Roly (en français) traduite mot à mot pour la version anglaise.
const COMP_EN: [RegExp, string][] = [[/coton peigné/g, 'combed cotton'], [/coton biologique|coton bio/g, 'organic cotton'], [/coton/g, 'cotton'], [/polyester recyclé/g, 'recycled polyester'], [/élasthanne/g, 'elastane'], [/viscose/g, 'viscose'], [/maille piquée/g, 'piqué knit'], [/maille single jersey|maille single/g, 'single jersey knit'], [/molleton gratté|molleton/g, 'fleece'], [/polaire/g, 'fleece'], [/Couleur(s)?/g, 'Colours'], [/Blanc/g, 'White'], [/gris chiné/gi, 'heather grey'], [/ et /g, ' and '], [/tissu/g, 'fabric'], [/doublure/g, 'lining']];
const compEn = (c: string) => COMP_EN.reduce((s, [r, v]) => s.replace(r, v), c);
export const productL = (lang: Lang, p: Product): Product => {
  if (lang !== 'en' || !PRODUCTS_EN[p.slug]) return p;
  const en = { ...p, ...PRODUCTS_EN[p.slug] };
  return ROLY_INFO[p.slug]?.composition ? { ...en, composition: compEn(ROLY_INFO[p.slug].composition) } : en;
};
export const categoryL = (lang: Lang, c: Category): Category => (lang === 'en' && CATEGORIES_EN[c.slug] ? { ...c, ...CATEGORIES_EN[c.slug] } : c);
export const categoryBySlug = (lang: Lang, slug: string) => { const c = getCategory(slug); return c && categoryL(lang, c); };
export const sectorL = (lang: Lang, s: Sector): Sector => (lang === 'en' && SECTORS_EN[s.slug] ? { ...s, ...SECTORS_EN[s.slug] } : s);
export const sectorBySlug = (lang: Lang, slug: string) => { const s = getSector(slug); return s && sectorL(lang, s); };
export const generalFaq = (lang: Lang, fr: [string, string][]) => (lang === 'en' ? GENERAL_FAQ_EN : fr);
/** Zones d'un vêtement avec leur nom dans la langue. */
export const zonesL = (lang: Lang, p: Product): Zone[] => zonesFor(p).map((z) => (lang === 'en' ? { ...z, name: p.shape === 'cap' && z.id === 'heart' ? ZONE_EN.face : ZONE_EN[z.id] || z.name } : z));
