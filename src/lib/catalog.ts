// Catalogue, zones de marquage et grille de prix.
// Source unique : utilisée par les pages, le configurateur ET le calcul serveur du paiement.

export type Shape = 'tee' | 'polo' | 'polols' | 'shirt' | 'hv' | 'hvjacket' | 'apron' | 'cap';

export type Category = {
  slug: string;
  name: string;
  singular: string;
  shape: Shape;
  title: string; // balise <title>
  intro: string;
  faq: [string, string][];
};

export type Sector = {
  slug: string;
  name: string;
  sub: string;
  h1: string;
  intro: string;
  categories: string[];
};

export type Product = {
  slug: string;
  category: string;
  name: string;
  type: string;
  sizes: string; // "S–5XL" ou "TU"
  price: number; // prix HT de base, hors marquage
  shape: Shape;
  colors: string[];
  composition: string;
  bestseller?: boolean;
};

export const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'Blanc', '#f2d33b': 'Jaune', '#e8892b': 'Orange', '#c8302f': 'Rouge', '#8b1e2d': 'Bordeaux',
  '#d43f8d': 'Fuchsia', '#3a5bd0': 'Royal', '#1d2a5c': 'Marine', '#2fb3d6': 'Turquoise', '#2f8a4d': 'Vert',
  '#9aa0a6': 'Gris chiné', '#151a2d': 'Noir', '#b8a98d': 'Sable', '#d7f22c': 'Jaune fluo', '#ff7a1a': 'Orange fluo',
};
const ALL = ['#ffffff', '#f2d33b', '#e8892b', '#c8302f', '#8b1e2d', '#d43f8d', '#3a5bd0', '#1d2a5c', '#2fb3d6', '#2f8a4d', '#9aa0a6', '#151a2d'];

export const GENERAL_FAQ: [string, string][] = [
  ['Y a-t-il un minimum de commande ?', 'Non, vous pouvez commander dès 1 pièce. Le prix unitaire baisse automatiquement à partir de 10, 25, 50, 100 et 250 pièces.'],
  ['Quand vais-je recevoir ma commande ?', '7 jours ouvrés après validation de votre visuel, 4 jours en express. La date estimée s\'affiche dans le panier.'],
  ['Je n\'ai pas de logo en haute définition.', 'Envoyez ce que vous avez : photo, PDF, capture. Notre graphiste le redessine gratuitement et vous le montre avant impression.'],
  ['Puis-je retourner un vêtement personnalisé ?', 'Les articles marqués à votre logo sont fabriqués sur mesure et ne bénéficient pas du droit de rétractation (article L221-28 3° du Code de la consommation). Un défaut d\'impression ou une erreur de notre part est refait à nos frais.'],
];

export const CATEGORIES: Category[] = [
  { slug: 'polos-personnalises', name: 'Polos', singular: 'polo', shape: 'polo', title: 'Polos personnalisés brodés ou imprimés',
    intro: 'Polos brodés ou imprimés à votre logo pour la restauration, l\'accueil et les équipes terrain. Coton piqué, manches courtes ou longues, du S au 5XL.',
    faq: [['Quel grammage choisir pour un polo de travail ?', '180 à 220 g/m² pour un usage quotidien en salle ou en boutique. Au-delà, le polo est plus épais et tient mieux les lavages fréquents.'],
      ['Broderie ou impression pour un polo ?', 'La broderie donne un rendu haut de gamme sur un logo simple. L\'impression DTF reproduit les dégradés et les petits détails, sans minimum.']] },
  { slug: 't-shirts-personnalises', name: 'T-shirts', singular: 't-shirt', shape: 'tee', title: 'T-shirts personnalisés dès 1 pièce',
    intro: 'T-shirts personnalisés pour événements, associations, clubs et équipes. Coton bio ou classique, plus de 12 coloris, dès 1 pièce.',
    faq: [['Quel t-shirt pour un événement d\'un jour ?', 'Un 150 g/m² comme l\'Atomic 150 suffit et reste le plus économique en grande quantité.'],
      ['Peut-on imprimer une photo sur un t-shirt ?', 'Oui, l\'impression DTF reproduit les photos et les dégradés sur textile clair ou foncé.']] },
  { slug: 'chemises-personnalisees', name: 'Chemises', singular: 'chemise', shape: 'shirt', title: 'Chemises brodées personnalisées',
    intro: 'Chemises brodées pour l\'hôtellerie, la réception et les métiers de l\'accueil. Coupes homme et femme, repassage facile.',
    faq: [['Où placer le logo sur une chemise ?', 'Le plus courant est la poitrine côté cœur, en broderie de 6 à 9 cm de large.']] },
  { slug: 'tabliers-personnalises', name: 'Tabliers', singular: 'tablier', shape: 'apron', title: 'Tabliers personnalisés pour restaurants',
    intro: 'Tabliers bavette, mi-longs et denim à votre logo pour restaurants, bars, boulangeries et cafés.',
    faq: [['Quelle taille de logo sur un tablier ?', 'Entre 8 et 12 cm de large sur la bavette pour rester lisible de loin.']] },
  { slug: 'casquettes-personnalisees', name: 'Casquettes', singular: 'casquette', shape: 'cap', title: 'Casquettes personnalisées brodées',
    intro: 'Casquettes 6 pans, trucker et techniques brodées à votre logo. Taille réglable, idéales en cuisine, sur les salons et en extérieur.',
    faq: [['Les casquettes sont-elles réglables ?', 'Oui, tous nos modèles ont une fermeture réglable : une seule taille convient à toute l\'équipe.']] },
  { slug: 'haute-visibilite-personnalisee', name: 'Haute visibilité', singular: 'vêtement haute visibilité', shape: 'hv', title: 'Vêtements haute visibilité personnalisés EN ISO 20471',
    intro: 'Gilets, vestes et parkas haute visibilité conformes EN ISO 20471, marqués à votre logo pour le BTP, la logistique et la voirie.',
    faq: [['Le marquage annule-t-il la norme EN ISO 20471 ?', 'Non, tant que le logo ne recouvre pas les bandes rétroréfléchissantes ni la surface fluorescente minimale exigée. Nous plaçons le marquage en conséquence.']] },
];

export const SECTORS: Sector[] = [
  { slug: 'restauration', name: 'Restauration', sub: 'Polos, tabliers, casquettes', h1: 'Tenues de restaurant personnalisées',
    intro: 'Polos, tabliers et casquettes à votre logo pour la salle, le comptoir et la cuisine.', categories: ['polos-personnalises', 'tabliers-personnalises', 'casquettes-personnalisees'] },
  { slug: 'hotellerie', name: 'Hôtellerie', sub: 'Chemises, polos, tabliers', h1: 'Tenues d\'hôtellerie à votre logo',
    intro: 'Chemises et polos brodés pour la réception, le service et l\'entretien.', categories: ['chemises-personnalisees', 'polos-personnalises', 'tabliers-personnalises'] },
  { slug: 'btp-logistique', name: 'BTP & logistique', sub: 'Haute visibilité, t-shirts', h1: 'Vêtements de chantier personnalisés',
    intro: 'Haute visibilité normée, t-shirts et casquettes à votre logo pour vos équipes terrain.', categories: ['haute-visibilite-personnalisee', 't-shirts-personnalises', 'casquettes-personnalisees'] },
  { slug: 'evenementiel-associations', name: 'Événementiel & associations', sub: 'T-shirts, casquettes', h1: 'T-shirts et casquettes pour vos événements',
    intro: 'T-shirts, casquettes et polos personnalisés pour salons, clubs, associations et fêtes.', categories: ['t-shirts-personnalises', 'casquettes-personnalisees', 'polos-personnalises'] },
];

const p = (slug: string, category: string, name: string, type: string, sizes: string, price: number, shape: Shape, colors: string[], composition: string, bestseller = false): Product =>
  ({ slug, category, name, type, sizes, price, shape, colors, composition, bestseller });

export const PRODUCTS: Product[] = [
  p('polo-pegaso', 'polos-personnalises', 'Polo Pegaso', 'Polo piqué premium', 'S–5XL', 9.9, 'polo', ALL, '65 % polyester, 35 % coton · 210 g/m²', true),
  p('polo-montreal', 'polos-personnalises', 'Polo Montreal', 'Polo bords contrastés', 'S–2XL', 12.5, 'polo', ['#151a2d', '#1d2a5c', '#ffffff', '#c8302f'], '100 % coton piqué · 220 g/m²'),
  p('polo-estrella', 'polos-personnalises', 'Polo Estrella', 'Manches longues', 'S–4XL', 13.9, 'polols', ['#3a5bd0', '#151a2d', '#c8302f', '#ffffff', '#2f8a4d'], '100 % coton · 210 g/m²'),
  p('t-shirt-dogo', 't-shirts-personnalises', 'T-shirt Dogo', 'Coton premium col rond', 'S–5XL', 4.9, 'tee', ALL, '100 % coton peigné · 180 g/m²', true),
  p('t-shirt-atomic-150', 't-shirts-personnalises', 'T-shirt Atomic 150', 'Le plus économique', 'S–5XL', 3.6, 'tee', ['#ffffff', '#f2d33b', '#c8302f', '#3a5bd0', '#2f8a4d', '#151a2d'], '100 % coton · 150 g/m²'),
  p('t-shirt-fox', 't-shirts-personnalises', 'T-shirt Fox', 'Coton bio chiné', 'S–3XL', 6.4, 'tee', ['#9aa0a6', '#1d2a5c', '#c8302f', '#2f8a4d'], '85 % coton bio, 15 % viscose · 160 g/m²'),
  p('chemise-moscu-homme', 'chemises-personnalisees', 'Chemise Moscu homme', 'Manches longues', 'S–3XL', 16.5, 'shirt', ['#ffffff', '#151a2d'], '97 % coton, 3 % élasthanne', true),
  p('chemise-moscu-femme', 'chemises-personnalisees', 'Chemise Moscu femme', 'Coupe cintrée', 'S–3XL', 16.5, 'shirt', ['#ffffff', '#151a2d'], '97 % coton, 3 % élasthanne'),
  p('tablier-benoit', 'tabliers-personnalises', 'Tablier Benoit', 'Bavette réglable', 'TU', 8.5, 'apron', ['#151a2d', '#8b1e2d', '#1d2a5c', '#b8a98d', '#ffffff'], '65 % polyester, 35 % coton · 210 g/m²', true),
  p('tablier-mini', 'tabliers-personnalises', 'Tablier Mini', 'Mi-long de service', 'TU', 5.9, 'apron', ['#151a2d'], '65 % polyester, 35 % coton'),
  p('tablier-batali', 'tabliers-personnalises', 'Tablier Batali', 'Denim, poche centrale', 'TU', 14.9, 'apron', ['#1d2a5c', '#151a2d'], '100 % coton denim · 250 g/m²'),
  p('casquette-mercury', 'casquettes-personnalisees', 'Casquette Mercury', '6 pans technique', 'TU', 4.2, 'cap', ['#151a2d', '#1d2a5c', '#ffffff', '#c8302f', '#2f8a4d'], '90 % polyester, 10 % élasthanne', true),
  p('casquette-wizer', 'casquettes-personnalisees', 'Casquette Wizer', 'Micro-fibre légère', 'TU', 5.1, 'cap', ['#ffffff', '#f2d33b', '#c8302f', '#3a5bd0'], '100 % polyester'),
  p('casquette-barny', 'casquettes-personnalisees', 'Casquette Barny', 'Trucker filet', 'TU', 3.9, 'cap', ['#c8302f', '#1d2a5c', '#151a2d', '#2f8a4d', '#3a5bd0'], 'Polyester, filet arrière'),
  p('gilet-hv-beta', 'haute-visibilite-personnalisee', 'Gilet HV Beta', 'Multipoches, EN ISO 20471 classe 2', 'S–3XL', 12.9, 'hv', ['#d7f22c', '#ff7a1a'], '100 % polyester', true),
  p('veste-hv-persei', 'haute-visibilite-personnalisee', 'Veste HV Persei', 'Réversible, doublée, classe 3', 'S–4XL', 34.9, 'hvjacket', ['#d7f22c', '#ff7a1a'], '100 % polyester'),
  p('parka-hv-epsilon', 'haute-visibilite-personnalisee', 'Parka HV Epsilon', 'Imperméable, capuche, classe 3', 'S–4XL', 42.9, 'hvjacket', ['#d7f22c', '#ff7a1a'], 'Polyester enduit PU'),
];

export type Zone = { id: string; name: string; view: 'front' | 'back'; x: number; y: number; w: number; price: number };
export const ZONES: Zone[] = [
  { id: 'heart', name: 'Cœur', view: 'front', x: 62, y: 36, w: 16, price: 2.5 },
  { id: 'chest', name: 'Poitrine', view: 'front', x: 50, y: 44, w: 34, price: 3.9 },
  { id: 'back', name: 'Grand dos', view: 'back', x: 50, y: 44, w: 46, price: 4.9 },
  { id: 'neck', name: 'Nuque', view: 'back', x: 50, y: 22, w: 16, price: 1.9 },
];

/** [quantité minimale, remise] */
export const TIERS: [number, number][] = [[1, 0], [10, 0.1], [25, 0.18], [50, 0.25], [100, 0.32], [250, 0.38]];
export const MAX_DISCOUNT = 0.38;
export const PACK_DISCOUNT = 0.1;
export const FREE_SHIPPING_HT = 150;
export const SHIPPING_HT = 9.9;
export const VAT = 0.2;
export const PROMO_CODES: Record<string, number> = { BIENVENUE: 0.1 };

export const getProduct = (slug: string) => PRODUCTS.find((x) => x.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((x) => x.slug === slug);
export const getSector = (slug: string) => SECTORS.find((x) => x.slug === slug);
export const productsIn = (cat: string) => PRODUCTS.filter((x) => x.category === cat);
export const defaultColor = (prod: Product) => (prod.colors.includes('#1d2a5c') ? '#1d2a5c' : prod.colors[0]);

export function zonesFor(prod: Product): Zone[] {
  if (prod.shape === 'cap') return [{ ...ZONES[1], name: 'Face', y: 45, w: 30 }];
  if (prod.shape === 'apron') return ZONES.filter((z) => z.view === 'front');
  return ZONES;
}
export function sizesFor(prod: Product): string[] {
  if (prod.sizes === 'TU') return ['Taille unique'];
  const all = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
  return all.slice(0, all.indexOf(prod.sizes.split('–')[1]) + 1);
}
export function tierFor(q: number): [number, number] {
  let t = TIERS[0];
  for (const x of TIERS) if (q >= x[0]) t = x;
  return t;
}
export const nextTier = (q: number) => TIERS.find((x) => x[0] > q);
export const fromPrice = (prod: Product) => (prod.price + zonesFor(prod)[0].price) * (1 - MAX_DISCOUNT);

/** Upsell « Complétez la tenue » selon la catégorie du premier article. */
export const COMPLETE_THE_LOOK: Record<string, string[]> = {
  'polos-personnalises': ['tablier-benoit', 'casquette-mercury'],
  't-shirts-personnalises': ['casquette-mercury', 'polo-pegaso'],
  'chemises-personnalisees': ['tablier-benoit', 'polo-pegaso'],
  'tabliers-personnalises': ['polo-pegaso', 'casquette-mercury'],
  'casquettes-personnalisees': ['t-shirt-dogo', 'polo-pegaso'],
  'haute-visibilite-personnalisee': ['t-shirt-dogo', 'casquette-mercury'],
};
