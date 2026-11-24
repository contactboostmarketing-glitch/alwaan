// Contenu SEO en plus de catalog.ts pour certaines pages catégories (version française) :
// balise title, H1, chapeau, sections visibles, exemples de prix et questions fréquentes.
// Les mots-clés visés viennent de l'analyse Semrush (docs/seo-calendrier.md).
// Aucun prix saisi à la main : tout est calculé depuis le catalogue, comme au panier.
import { COLOR_NAMES, FREE_SHIPPING_HT, RELAY_HT, SHIPPING_HT, TIERS, getProduct } from './catalog';
import { EXPRESS_DAYS, PRODUCTION_DAYS } from './delivery';
import { eur, unitAt } from './pricing';

/** Une ligne du tableau d'exemples de prix : un vêtement, ses emplacements imprimés. */
export type PriceRow = { slug: string; zones: string[]; label: string };
export type SeoSection = { h2: string; p: string[]; prices?: PriceRow[]; links?: [string, string][] };
export type CategorySeo = { title: string; h1: string; description: string; lead: string; sections: SeoSection[]; faq: [string, string][] };

/** Prix unitaire HT pour q pièces au même logo, formaté (« 27,00 € »). */
export const unitEur = (slug: string, zones: string[], q: number) => eur(unitAt({ slug, zones }, q));
const name = (slug: string) => getProduct(slug)!.name;
const sizes = (slug: string) => getProduct(slug)!.sizes.split('–');
const colors = (slug: string) => getProduct(slug)!.colors.map((c) => COLOR_NAMES[c].toLowerCase()).join(' et ');
/** « -15 % dès 5 pièces, -20 % dès 10 pièces, -40 % dès 30 pièces » */
export const tiersFr = TIERS.filter(([, d]) => d > 0).map(([m, d]) => `-${Math.round(d * 100)} % dès ${m} pièces`).join(', ');

const BETA = 'gilet-hv-beta', PERSEI = 'veste-hv-persei', EPSILON = 'parka-hv-epsilon';

export const CATEGORY_SEO: Record<string, CategorySeo> = {
  // Cible : gilet de sécurité personnalisé (720), gilet jaune personnalisé (590), personnaliser gilet jaune (390),
  // gilet fluo personnalisé (320), gilet haute visibilité personnalisé (260), gilet personnalisé association (140).
  'haute-visibilite-personnalisee': {
    title: 'Gilet de sécurité et gilet jaune personnalisés',
    h1: 'Gilets de sécurité et vêtements haute visibilité personnalisés',
    description: 'Gilet jaune ou orange fluo, veste et parka haute visibilité EN ISO 20471 à votre logo, dès 1 pièce. Maquette et prix en direct, imprimé dans le Nord.',
    lead: `Gilets de sécurité jaune fluo ou orange fluo, vestes et parkas haute visibilité conformes EN ISO 20471, imprimés à votre logo dès 1 pièce. Le ${name(BETA)} avec un logo au cœur coûte ${unitEur(BETA, ['heart'], 1)} HT à l'unité. Pour le BTP, la logistique, la voirie, les associations et les événements.`,
    sections: [
      { h2: 'Gilet jaune ou orange fluo ?', p: [
        `Le ${name(BETA)} existe en ${colors(BETA)}, en classe 2 EN ISO 20471, du ${sizes(BETA)[0]} au ${sizes(BETA)[1]}. Le jaune fluo est le plus courant : c'est le « gilet jaune » que tout le monde reconnaît. L'orange fluo permet de se distinguer d'un décor déjà jaune ou d'une autre équipe présente sur le même site.`,
        'Si votre client, votre chantier ou votre règlement intérieur impose une couleur, suivez sa consigne. Une seule couleur pour toute l\'équipe simplifie aussi la commande et le réassort.',
      ] },
      { h2: 'Où placer le logo sur un gilet de sécurité ?', p: [
        'Le logo se place au cœur ou à l\'anti-cœur pour un marquage discret, et en grand au dos pour être lu de loin. La nuque peut recevoir un petit texte.',
        'Nous plaçons le marquage sans recouvrir les bandes rétroréfléchissantes et sans réduire la surface fluorescente sous le minimum de la classe : le gilet reste conforme à la norme.',
        'Pas de logo ? Un simple texte suffit : le nom de l\'entreprise ou de l\'association, « Bénévole », « Organisation » ou « Staff ».',
      ], links: [['Norme EN ISO 20471 : le guide', '/guides/norme-en-iso-20471-haute-visibilite'], ['Préparer son logo pour l\'impression', '/guides/preparer-logo-impression']] },
      { h2: 'Combien coûte un gilet de sécurité personnalisé ?', p: [
        `Prix par pièce, logo compris, sans frais de préparation. Le marquage baisse avec la quantité (hors grand devant) : ${tiersFr}, en cumulant toutes les pièces au même logo.`,
        `Production en ${PRODUCTION_DAYS} jours ouvrés après la commande, ${EXPRESS_DAYS} en express. Livraison offerte dès ${FREE_SHIPPING_HT} € HT d'articles, sinon ${eur(SHIPPING_HT)} HT à domicile ou ${eur(RELAY_HT)} HT en point relais, en France et en Belgique.`,
      ], prices: [
        { slug: BETA, zones: ['heart'], label: `${name(BETA)}, logo au cœur` },
        { slug: BETA, zones: ['heart', 'back'], label: `${name(BETA)}, cœur et dos` },
        { slug: PERSEI, zones: ['heart'], label: `${name(PERSEI)}, logo au cœur` },
        { slug: EPSILON, zones: ['heart'], label: `${name(EPSILON)}, logo au cœur` },
      ] },
      { h2: 'Gilet personnalisé pour une association ou un événement', p: [
        'Course, randonnée, brocante, fête de village, sortie scolaire : un gilet jaune au nom de l\'association rend les bénévoles et l\'équipe d\'organisation faciles à repérer.',
        'Vous commandez dès 1 pièce. Pour équiper tous les bénévoles, le lien d\'équipe permet à chacun d\'indiquer son nom et sa taille : votre panier se remplit seul.',
      ], links: [['Clubs et associations', '/clubs-associations'], ['Lien d\'équipe', '/lien-equipe'], ['Tenues pour vos événements', '/metiers/evenementiel-associations']] },
      { h2: 'Gilet, veste ou parka : quelle classe choisir ?', p: [
        `Le ${name(BETA)} et la ${name(EPSILON)} sont en classe 2, la ${name(PERSEI)} en classe 3. La classe 2 couvre la plupart des usages courants ; la classe 3 s'impose pour les interventions les plus exposées, sur voie rapide ou de nuit.`,
        `C'est l'évaluation des risques de votre activité qui fixe la classe nécessaire. Pour l'hiver, la ${name(PERSEI)} est doublée et la ${name(EPSILON)} imperméable, avec capuche.`,
      ], links: [['Vêtements de chantier personnalisés', '/metiers/btp-logistique'], ['Tous nos vêtements de travail', '/vetements-de-travail-personnalises']] },
    ],
    faq: [
      ['Combien coûte un gilet jaune personnalisé ?', `Le ${name(BETA)} avec votre logo au cœur coûte ${unitEur(BETA, ['heart'], 1)} HT à l'unité, ${unitEur(BETA, ['heart'], 10)} HT dès 10 pièces et ${unitEur(BETA, ['heart'], 30)} HT dès 30 pièces, sans frais de préparation. Avec un grand logo au dos en plus : ${unitEur(BETA, ['heart', 'back'], 1)} HT à l'unité, ${unitEur(BETA, ['heart', 'back'], 30)} HT dès 30 pièces.`],
      ['Gilet jaune ou orange fluo : lequel choisir ?', 'Le jaune fluo est le plus courant. L\'orange fluo aide à se distinguer d\'un décor jaune ou d\'une autre équipe. Si votre client ou votre site impose une couleur, suivez sa consigne.'],
      ['Peut-on imprimer « Bénévole » ou le nom de l\'association sans logo ?', 'Oui. Sans logo, vous pouvez imprimer un texte d\'une ou deux lignes : le nom de l\'association, « Bénévole », « Organisation » ou « Staff ».'],
    ],
  },
};
