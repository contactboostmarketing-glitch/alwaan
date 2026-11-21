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
  details?: string[]; // texte de la page catégorie (SEO)
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
  cost: number; // prix d'achat HT fournisseur (Roly), provisoire tant que les tarifs ne sont pas reçus
  price: number; // prix de vente HT du vêtement nu = sellPrice(cost), hors marquage
  shape: Shape;
  colors: string[];
  composition: string;
  bestseller?: boolean;
  photos?: Record<string, string>; // vraies photos par coloris (#hex → URL), prioritaires sur le dessin (Google Shopping, pages)
};

export const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'Blanc', '#f2d33b': 'Jaune', '#e8892b': 'Orange', '#c8302f': 'Rouge', '#8b1e2d': 'Bordeaux',
  '#d43f8d': 'Fuchsia', '#3a5bd0': 'Royal', '#1d2a5c': 'Marine', '#2fb3d6': 'Turquoise', '#2f8a4d': 'Vert',
  '#9aa0a6': 'Gris chiné', '#151a2d': 'Noir', '#b8a98d': 'Sable', '#d7f22c': 'Jaune fluo', '#ff7a1a': 'Orange fluo',
};
const ALL = ['#ffffff', '#f2d33b', '#e8892b', '#c8302f', '#8b1e2d', '#d43f8d', '#3a5bd0', '#1d2a5c', '#2fb3d6', '#2f8a4d', '#9aa0a6', '#151a2d'];

export const GENERAL_FAQ: [string, string][] = [
  ['Y a-t-il un minimum de commande ?', 'Non, vous pouvez commander dès 1 pièce. Le marquage baisse automatiquement : -15 % dès 5 pièces, -20 % dès 10 et -40 % dès 30 (hors grand devant, à prix fixe). Les pièces qui portent le même logo se cumulent, même sur des vêtements différents.'],
  ['Quand vais-je recevoir ma commande ?', 'Délai indicatif : 7 jours ouvrés de production après votre commande, plus la livraison. En option, la production express passe à 4 jours ouvrés (15 € jusqu\'à 10 pièces, 20 € jusqu\'à 20, 30 € jusqu\'à 30, 60 € au-delà). La date estimée s\'affiche sur la page produit et dans le panier.'],
  ['Quel fichier de logo envoyer ?', 'Un PNG à fond transparent ou un SVG, le plus grand possible (au moins 800 pixels de large). Le site vous prévient si votre logo est en petite définition. Pas de logo ? Vous pouvez imprimer un simple texte.'],
  ['Puis-je retourner un vêtement personnalisé ?', 'Les articles marqués à votre logo sont fabriqués sur mesure et ne bénéficient pas du droit de rétractation (article L221-28 3° du Code de la consommation). Un défaut d\'impression ou une erreur de notre part est refait à nos frais.'],
];

export const CATEGORIES: Category[] = [
  { slug: 'polos-personnalises', name: 'Polos', singular: 'polo', shape: 'polo', title: 'Polos personnalisés imprimés à votre logo',
    intro: 'Polos imprimés à votre logo pour la restauration, l\'accueil et les équipes terrain. Coton piqué, manches courtes ou longues, du S au 5XL.',
    faq: [['Quel grammage choisir pour un polo de travail ?', '180 à 220 g/m² pour un usage quotidien en salle ou en boutique. Au-delà, le polo est plus épais et tient mieux les lavages fréquents.'],
      ['Qu\'est-ce que l\'impression DTF ?', 'Le DTF (Direct To Film) imprime votre logo sur un film puis le transfère à chaud sur le textile. Il reproduit toutes les couleurs, les dégradés et les petits détails, sur coton comme sur polyester, dès 1 pièce, et résiste aux lavages.']] },
  { slug: 't-shirts-personnalises', name: 'T-shirts', singular: 't-shirt', shape: 'tee', title: 'T-shirts personnalisés dès 1 pièce',
    intro: 'T-shirts personnalisés pour événements, associations, clubs et équipes. Coton bio ou classique, plus de 12 coloris, dès 1 pièce.',
    faq: [['Quel t-shirt pour un événement d\'un jour ?', 'Un 150 g/m² comme l\'Atomic 150 suffit et reste le plus économique en grande quantité.'],
      ['Peut-on imprimer une photo sur un t-shirt ?', 'Oui, l\'impression DTF reproduit les photos et les dégradés sur textile clair ou foncé.']] },
  { slug: 'chemises-personnalisees', name: 'Chemises', singular: 'chemise', shape: 'shirt', title: 'Chemises personnalisées à votre logo',
    intro: 'Chemises à votre logo pour l\'hôtellerie, la réception et les métiers de l\'accueil. Coupes homme et femme, repassage facile.',
    faq: [['Où placer le logo sur une chemise ?', 'Le plus courant est la poitrine côté cœur, avec un logo de 6 à 9 cm de large.']] },
  { slug: 'tabliers-personnalises', name: 'Tabliers', singular: 'tablier', shape: 'apron', title: 'Tabliers personnalisés pour restaurants',
    intro: 'Tabliers bavette, mi-longs et denim à votre logo pour restaurants, bars, boulangeries et cafés.',
    faq: [['Quelle taille de logo sur un tablier ?', 'Entre 8 et 12 cm de large sur la bavette pour rester lisible de loin.']] },
  { slug: 'casquettes-personnalisees', name: 'Casquettes', singular: 'casquette', shape: 'cap', title: 'Casquettes personnalisées à votre logo',
    intro: 'Casquettes 6 pans, trucker et techniques à votre logo, imprimées en DTF. Taille réglable, idéales en cuisine, sur les salons et en extérieur.',
    faq: [['Les casquettes sont-elles réglables ?', 'Oui, tous nos modèles ont une fermeture réglable : une seule taille convient à toute l\'équipe.']] },
  { slug: 'haute-visibilite-personnalisee', name: 'Haute visibilité', singular: 'vêtement haute visibilité', shape: 'hv', title: 'Vêtements haute visibilité personnalisés EN ISO 20471',
    intro: 'Gilets, vestes et parkas haute visibilité conformes EN ISO 20471, marqués à votre logo pour le BTP, la logistique et la voirie.',
    faq: [['Le marquage annule-t-il la norme EN ISO 20471 ?', 'Non, tant que le logo ne recouvre pas les bandes rétroréfléchissantes ni la surface fluorescente minimale exigée. Nous plaçons le marquage en conséquence.']] },
];

export const SECTORS: Sector[] = [
  { slug: 'restauration', name: 'Restauration', sub: 'Polos, tabliers, casquettes', h1: 'Tenues de restaurant personnalisées',
    intro: 'Polos, tabliers et casquettes à votre logo pour la salle, le comptoir et la cuisine.', categories: ['polos-personnalises', 'tabliers-personnalises', 'casquettes-personnalisees'] },
  { slug: 'hotellerie', name: 'Hôtellerie', sub: 'Chemises, polos, tabliers', h1: 'Tenues d\'hôtellerie à votre logo',
    intro: 'Chemises et polos à votre logo pour la réception, le service et l\'entretien.', categories: ['chemises-personnalisees', 'polos-personnalises', 'tabliers-personnalises'] },
  { slug: 'btp-logistique', name: 'BTP & logistique', sub: 'Haute visibilité, t-shirts', h1: 'Vêtements de chantier personnalisés',
    intro: 'Haute visibilité normée, t-shirts et casquettes à votre logo pour vos équipes terrain.', categories: ['haute-visibilite-personnalisee', 't-shirts-personnalises', 'casquettes-personnalisees'] },
  { slug: 'evenementiel-associations', name: 'Événementiel & associations', sub: 'T-shirts, casquettes', h1: 'T-shirts et casquettes pour vos événements',
    intro: 'T-shirts, casquettes et polos personnalisés pour salons, clubs, associations et fêtes.', categories: ['t-shirts-personnalises', 'casquettes-personnalisees', 'polos-personnalises'] },
];

/** Prix de vente HT du vêtement nu : prix d'achat × 2. */
export const COEF = 2;
export const sellPrice = (cost: number) => Math.round(cost * COEF * 100) / 100;

const p = (slug: string, category: string, name: string, type: string, sizes: string, cost: number, shape: Shape, colors: string[], composition: string, bestseller = false): Product =>
  ({ slug, category, name, type, sizes, cost, price: sellPrice(cost), shape, colors, composition, bestseller });

export const PRODUCTS: Product[] = [
  p('polo-pegaso', 'polos-personnalises', 'Polo Pegaso', 'Polo piqué premium', 'S–5XL', 9.9, 'polo', ALL, '65 % polyester, 35 % coton · 210 g/m²', true),
  p('polo-montreal', 'polos-personnalises', 'Polo Montreal', 'Polo bords contrastés', 'S–XXL', 12.5, 'polo', ['#151a2d', '#1d2a5c', '#ffffff', '#c8302f'], '100 % coton piqué · 220 g/m²'),
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

/** Zones de marquage DTF. size = gabarit maximal (le logo y est inscrit) ; fixed = prix fixe, sans remise de quantité. */
export type Zone = { id: string; name: string; view: 'front' | 'back'; x: number; y: number; w: number; size: string; price: number; fixed?: boolean };
export const ZONES: Zone[] = [
  { id: 'heart', name: 'Cœur', view: 'front', x: 62, y: 36, w: 16, size: '10 × 10 cm', price: 4 },
  { id: 'antiheart', name: 'Anti-cœur', view: 'front', x: 38, y: 36, w: 16, size: '10 × 10 cm', price: 4 },
  { id: 'chest', name: 'Grand devant', view: 'front', x: 50, y: 50, w: 42, size: '28 × 30 cm', price: 8, fixed: true },
  { id: 'shoulder-right', name: 'Épaule droite', view: 'front', x: 19, y: 32, w: 9, size: '8 × 8 cm', price: 2.5 },
  { id: 'shoulder-left', name: 'Épaule gauche', view: 'front', x: 81, y: 32, w: 9, size: '8 × 8 cm', price: 2.5 },
  { id: 'back', name: 'Dos', view: 'back', x: 50, y: 44, w: 46, size: '26 × 26 cm', price: 6 },
  { id: 'neck', name: 'Nuque', view: 'back', x: 50, y: 22, w: 14, size: '8 × 4 cm', price: 2.5 },
  // Tabliers uniquement : logo sur la poche (même gabarit et même prix que le cœur, à confirmer).
  { id: 'pocket', name: 'Poche', view: 'front', x: 50, y: 74, w: 22, size: '10 × 10 cm', price: 4 },
];
/** Au-delà de ce prix de vente HT du textile, le marquage cœur et le marquage dos passent à un prix unique. */
export const PREMIUM_PRICE = 25, PREMIUM_MARK = 5, PREMIUM_ZONES = ['heart', 'back'];
/** Zones qui se recouvrent : en choisir une retire les autres. */
export const CLASH: Record<string, string[]> = { chest: ['heart', 'antiheart', 'pocket'], heart: ['chest'], antiheart: ['chest'], pocket: ['chest'] };

/** Remise sur le marquage uniquement : [pièces minimum, remise]. Le vêtement n'a pas de remise. */
export const TIERS: [number, number][] = [[1, 0], [5, 0.15], [10, 0.2], [30, 0.4]];
export const MAX_DISCOUNT = TIERS[TIERS.length - 1][1];
export const FREE_SHIPPING_HT = 150;
export const SHIPPING_HT = 9.9;
export const VAT = 0.2;
export const PROMO_CODES: Record<string, number> = { BIENVENUE: 0.1 };
/** Relance panier abandonné : code à usage unique RETOUR-XXXXXX (vérifié côté serveur), -10 %. */
export const RELANCE_RATE = 0.1;
export const RELANCE_CODE = /^RETOUR-[A-Z0-9]{6}$/;
export const promoRate = (code?: string | null) => { const c = (code || '').trim().toUpperCase(); return PROMO_CODES[c] ?? (RELANCE_CODE.test(c) ? RELANCE_RATE : 0); };
/** Logo retravaillé par notre graphiste (fond, netteté, vectorisation) : forfait HT, une fois par logo. */
export const REWORK_FEE = 4;
/** Remise des revendeurs validés (Kbis vérifié) : sur tout, hors livraison. */
export const RESELLER_RATE = 0.1;
/** Prénom imprimé sur chaque pièce (sous le logo) : prix HT par pièce, proposé au-delà de NAMES_MIN pièces. */
export const NAME_FEE = 2, NAMES_MIN = 20;
/** Échantillon avant série : 1 pièce imprimée envoyée pour validation, offerte dès SAMPLE_MIN pièces. */
export const SAMPLE_MIN = 150, SAMPLE_EXTRA_DAYS = 5;
/** Boutique club / entreprise : commission reversée au club sur les ventes HT de sa boutique (en bons d'achat). */
export const SHOP_COMMISSION = 0.1;
/** Particuliers : supplément « création design » par pièce (designs prêts à personnaliser), HT. */
export const DESIGN_FEE = 5;
/** Production express : forfait HT selon le nombre total de pièces de la commande. */
export const EXPRESS_FEES: [number, number][] = [[10, 15], [20, 20], [30, 30], [Infinity, 60]];
export const expressFee = (pieces: number) => EXPRESS_FEES.find(([max]) => pieces <= max)![1];

// Textes détaillés des pages catégories (page mère du cocon sémantique).
const DETAILS: Record<string, string[]> = {
 "polos-personnalises": [
  "Le polo est la tenue professionnelle la plus polyvalente : plus habillé qu'un t-shirt, plus pratique qu'une chemise. Il convient à la restauration, à l'accueil, au commerce, aux artisans et aux équipes terrain.",
  "Pour un usage quotidien, visez un piqué de 200 à 220 g/m² : il garde sa forme et résiste aux lavages fréquents. Les mélanges polyester-coton sèchent plus vite et boulochent moins que le 100 % coton.",
  "Le logo se place le plus souvent au cœur, complété d'un grand marquage au dos pour être visible de loin. Les coupes femme, plus ajustées, permettent d'habiller toute l'équipe avec le même modèle."
 ],
 "t-shirts-personnalises": [
  "Le t-shirt personnalisé est la solution la plus économique pour habiller une équipe, un club ou les participants d'un événement. Il se décline en coton classique, en coton bio ou en tissu technique respirant pour le sport.",
  "Le grammage fait la différence : 150 g/m² pour un événement ponctuel, 180 g/m² et plus pour un t-shirt porté toute l'année. Les modèles sans couture latérale tombent mieux et restent plus confortables.",
  "L'impression DTF permet d'imprimer un logo en couleurs, une photo ou un visuel d'événement, dès 1 pièce et sans frais de préparation."
 ],
 "chemises-personnalisees": [
  "La chemise personnalisée apporte une image soignée aux métiers de l'accueil, de l'hôtellerie, de la réception et du conseil. Un logo discret au cœur suffit à identifier votre équipe.",
  "Privilégiez un tissu avec un peu d'élasthanne et un traitement facile à repasser : la chemise reste confortable sur une journée entière et garde un aspect net après lavage.",
  "Les coupes homme et femme existent dans le même coloris, pour une tenue cohérente."
 ],
 "tabliers-personnalises": [
  "Le tablier est souvent la pièce la plus visible d'une tenue de restaurant, de boulangerie, de bar ou de café. Il protège la tenue et porte votre logo en grand, à hauteur des yeux du client.",
  "Le tablier bavette convient à la cuisine et au comptoir, le tablier mi-long au service en salle, le tablier en denim aux établissements au style plus tendance.",
  "Tous nos tabliers sont en taille unique avec des liens réglables : une seule référence pour toute l'équipe."
 ],
 "casquettes-personnalisees": [
  "La casquette personnalisée est un support de visibilité simple et économique : en cuisine, en vente à emporter, sur un salon, un chantier ou un événement en extérieur.",
  "Toutes nos casquettes sont réglables : une seule taille convient à toute l'équipe, ce qui simplifie la commande.",
  "Le logo se place sur l'avant, la zone la plus visible. Les modèles techniques légers conviennent au sport et à l'été, les modèles en coton à un usage quotidien."
 ],
 "haute-visibilite-personnalisee": [
  "Les vêtements haute visibilité protègent les personnes exposées à la circulation ou aux engins : BTP, voirie, logistique, entrepôts, sécurité. Ils doivent être conformes à la norme EN ISO 20471.",
  "La norme définit trois classes selon la surface de matière fluorescente et de bandes rétroréfléchissantes. Un gilet de classe 2 couvre la plupart des usages ; la classe 3 s'impose pour les interventions les plus exposées.",
  "Votre logo peut être ajouté sans perdre la conformité, à condition de ne pas recouvrir les bandes et de respecter la surface fluorescente minimale : nous plaçons le marquage en conséquence."
 ]
};
for (const c of CATEGORIES) c.details = DETAILS[c.slug];

export const getProduct = (slug: string) => PRODUCTS.find((x) => x.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((x) => x.slug === slug);
export const getSector = (slug: string) => SECTORS.find((x) => x.slug === slug);
export const productsIn = (cat: string) => PRODUCTS.filter((x) => x.category === cat);
export const defaultColor = (prod: Product) => (prod.colors.includes('#1d2a5c') ? '#1d2a5c' : prod.colors[0]);

/** Zones proposées pour un vêtement, au prix de ce vêtement. */
export function zonesFor(prod: Product): Zone[] {
  const priced = (z: Zone): Zone => prod.price > PREMIUM_PRICE && PREMIUM_ZONES.includes(z.id) ? { ...z, price: PREMIUM_MARK } : z;
  const shoulders = ['shoulder-right', 'shoulder-left'];
  let list: Zone[];
  const notApron = ZONES.filter((z) => z.id !== 'pocket');
  if (prod.shape === 'cap') list = [{ ...ZONES[0], name: 'Face', x: 50, y: 45, w: 30 }];
  // Tablier : poche ou grand devant, l'un ou l'autre (la poche en premier : c'est le prix « dès »).
  else if (prod.shape === 'apron') list = ['pocket', 'chest'].map((id) => ZONES.find((z) => z.id === id)!);
  else if (prod.shape === 'hv') list = notApron.filter((z) => !shoulders.includes(z.id)); // gilet sans manches
  else if (prod.shape === 'shirt') list = notApron.filter((z) => z.id !== 'chest'); // chemise : pas de grand devant (boutonnage)
  else list = notApron;
  return list.map(priced);
}
/** Emplacement proposé par défaut (cœur, face de casquette, poche de tablier). */
export const defaultZone = (prod: Product) => zonesFor(prod)[0].id;

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
/** Prix le plus bas affiché (« dès ») : vêtement + marquage cœur au meilleur palier. */
export const fromPrice = (prod: Product) => { const z = zonesFor(prod)[0]; return prod.price + z.price * (z.fixed ? 1 : 1 - MAX_DISCOUNT); };
/** Prix le plus haut : vêtement + toutes les zones compatibles, sans remise. */
export const topPrice = (prod: Product) => prod.price + zonesFor(prod).filter((z) => z.id !== 'chest').reduce((a, z) => a + z.price, 0);

/** Upsell « Complétez la tenue » selon la catégorie du premier article. */
export const COMPLETE_THE_LOOK: Record<string, string[]> = {
  'polos-personnalises': ['tablier-benoit', 'casquette-mercury'],
  't-shirts-personnalises': ['casquette-mercury', 'polo-pegaso'],
  'chemises-personnalisees': ['tablier-benoit', 'polo-pegaso'],
  'tabliers-personnalises': ['polo-pegaso', 'casquette-mercury'],
  'casquettes-personnalisees': ['t-shirt-dogo', 'polo-pegaso'],
  'haute-visibilite-personnalisee': ['t-shirt-dogo', 'casquette-mercury'],
};
