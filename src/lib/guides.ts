// Guides du cocon sémantique : chaque guide répond à une recherche précise et renvoie vers
// sa page mère (catégorie ou métier) et vers 2-3 guides voisins.
import { TIERS } from './catalog';

export type Guide = {
  slug: string;
  title: string; // H1 et balise title
  description: string;
  categories: string[]; // pages mères (slugs de catégories)
  sectors?: string[];
  related: string[]; // guides voisins
  intro: string;
  sections: { h2: string; p: string[] }[];
  faq: [string, string][];
};

const tiersText = `sur le marquage (hors grand devant, à prix fixe), ${TIERS.filter(([, d]) => d > 0).map(([m, d]) => `-${Math.round(d * 100)} % dès ${m} pièces`).join(', ')} (les pièces au même logo se cumulent, tous vêtements confondus)`;

export const GUIDES: Guide[] = [
  {
    slug: 'impression-dtf-avantages',
    title: 'Impression DTF : comment ça marche et pourquoi la choisir',
    description: 'Le DTF (Direct To Film) imprime votre logo en couleurs sur tous les textiles, dès 1 pièce. Fonctionnement, durabilité, entretien et limites.',
    categories: ['polos-personnalises', 't-shirts-personnalises', 'casquettes-personnalisees'],
    related: ['dtf-ou-broderie', 'preparer-logo-impression', 'prix-vetement-personnalise-quantite'],
    intro: 'Le DTF, pour « Direct To Film », est la technique que nous utilisons pour tous nos marquages. Elle permet d\'imprimer un logo en couleurs, avec des dégradés et des détails fins, sur presque tous les textiles, et sans minimum de commande.',
    sections: [
      { h2: 'Comment fonctionne l\'impression DTF', p: [
        'Votre logo est d\'abord imprimé à l\'envers sur un film transparent, avec des encres pigmentées et une couche de blanc qui garantit des couleurs vives même sur un textile foncé. Une poudre adhésive est ensuite déposée sur l\'encre encore humide, puis cuite.',
        'Le film est enfin pressé à chaud sur le vêtement : l\'encre se fixe dans les fibres et le film est retiré. Le résultat est un marquage souple, net et durable.',
      ] },
      { h2: 'Les avantages du DTF', p: [
        'Toutes les couleurs et les dégradés sont possibles, sans surcoût par couleur, contrairement à la sérigraphie.',
        'Il fonctionne sur le coton, le polyester, les mélanges, le denim ou le nylon, sur les vêtements clairs comme foncés.',
        'Il est rentable dès 1 pièce : pas d\'écran ni de programme de broderie à préparer.',
      ] },
      { h2: 'Durabilité et entretien', p: [
        'Un marquage DTF bien posé résiste aux lavages répétés. Pour le faire durer, lavez le vêtement sur l\'envers à 40 °C maximum, évitez le sèche-linge et ne repassez jamais directement sur le marquage.',
      ] },
      { h2: 'Les limites à connaître', p: [
        'Sur de très grandes surfaces, le DTF forme une couche un peu plus sensible au toucher qu\'une broderie. Pour un logo de cœur ou un dos de taille classique, la différence est minime.',
      ] },
    ],
    faq: [
      ['Le DTF craque-t-il au lavage ?', 'Non, si l\'entretien est respecté : lavage sur l\'envers à 40 °C maximum et pas de sèche-linge.'],
      ['Peut-on imprimer une photo en DTF ?', 'Oui, le DTF reproduit les photos et les dégradés.'],
    ],
  },
  {
    slug: 'dtf-ou-broderie',
    title: 'DTF ou broderie : quelle technique pour vos vêtements de travail ?',
    description: 'Comparatif DTF et broderie : rendu, durabilité, prix, délais et quantité minimum, pour choisir le bon marquage selon votre logo et votre budget.',
    categories: ['polos-personnalises', 'casquettes-personnalisees', 'chemises-personnalisees'],
    related: ['impression-dtf-avantages', 'grammage-polo-travail', 'preparer-logo-impression'],
    intro: 'La broderie et l\'impression DTF sont les deux techniques les plus courantes pour marquer une tenue professionnelle. Elles ne répondent pas aux mêmes besoins.',
    sections: [
      { h2: 'Le rendu', p: [
        'La broderie donne un relief et un aspect haut de gamme, mais elle simplifie le logo : les dégradés, les petits textes et les détails fins ne passent pas. Le DTF reproduit fidèlement le logo, couleurs et détails compris.',
      ] },
      { h2: 'Le prix et les quantités', p: [
        'La broderie demande de préparer un programme de points pour chaque logo : c\'est un coût fixe qui pénalise les petites séries. Le DTF n\'a pas de coût de préparation, il est donc avantageux dès 1 pièce et pour les commandes variées.',
      ] },
      { h2: 'Notre choix', p: [
        'Nous avons choisi le DTF pour toutes nos commandes : vous voyez votre logo exact sur la maquette en ligne, sans simplification, et vous pouvez commander une seule pièce comme cinq cents.',
      ] },
    ],
    faq: [['Le DTF tient-il aussi bien qu\'une broderie ?', 'Sur un usage professionnel courant, oui, avec un entretien adapté (lavage sur l\'envers, 40 °C maximum).']],
  },
  {
    slug: 'grammage-polo-travail',
    title: 'Quel grammage choisir pour un polo de travail ?',
    description: 'Grammage, matière et coupe : comment choisir un polo de travail confortable et résistant aux lavages fréquents.',
    categories: ['polos-personnalises'],
    sectors: ['restauration', 'hotellerie'],
    related: ['dtf-ou-broderie', 'taille-vetement-equipe', 'tenue-restaurant-personnalisee'],
    intro: 'Le grammage, exprimé en grammes par mètre carré, indique l\'épaisseur du tissu. Il influence le confort, la tenue dans le temps et le prix.',
    sections: [
      { h2: 'Les repères de grammage', p: [
        'Entre 160 et 180 g/m², le polo est léger : adapté à l\'été, aux événements ou aux usages ponctuels.',
        'Entre 200 et 220 g/m², c\'est le bon compromis pour un usage quotidien en salle, en boutique ou à l\'accueil : le tissu garde sa forme et résiste aux lavages fréquents.',
        'Au-delà, le polo est plus épais et plus chaud, utile en extérieur ou en atelier.',
      ] },
      { h2: 'Coton ou polyester ?', p: [
        'Le coton est doux et respirant. Un mélange polyester et coton sèche plus vite, se froisse moins et limite le boulochage : c\'est souvent le meilleur choix pour une tenue portée tous les jours.',
      ] },
    ],
    faq: [['Quel polo pour la restauration ?', 'Un piqué de 200 à 220 g/m² en polyester-coton, comme le Polo Pegaso Premium, résiste aux lavages fréquents.']],
  },
  {
    slug: 'preparer-logo-impression',
    title: 'Préparer son logo pour l\'impression sur vêtement',
    description: 'Format, taille, fond transparent : les bons réflexes pour un logo net sur vos vêtements personnalisés.',
    categories: ['polos-personnalises', 't-shirts-personnalises', 'tabliers-personnalises'],
    related: ['impression-dtf-avantages', 'dtf-ou-broderie', 'prix-vetement-personnalise-quantite'],
    intro: 'La netteté de l\'impression dépend directement de la qualité du fichier que vous envoyez. Quelques réflexes suffisent.',
    sections: [
      { h2: 'Le bon format', p: [
        'Le SVG est idéal : c\'est un format vectoriel qui reste net à toutes les tailles. À défaut, un PNG à fond transparent fonctionne très bien.',
        'Évitez les captures d\'écran et les images récupérées sur les réseaux sociaux, souvent trop petites et compressées.',
      ] },
      { h2: 'La bonne taille', p: [
        'Envoyez l\'image la plus grande possible : au moins 800 pixels sur le plus grand côté, idéalement plus de 2 000 pour un grand marquage au dos. Le site vous prévient si votre logo est en petite définition.',
      ] },
      { h2: 'Pas de logo ?', p: [
        'Vous pouvez imprimer un simple texte : le nom de votre entreprise, de votre association ou un slogan.',
      ] },
    ],
    faq: [['Mon logo est un JPG avec un fond blanc, est-ce un problème ?', 'Le fond blanc sera imprimé. Sur un vêtement blanc ce n\'est pas visible ; sur un vêtement de couleur, préférez un PNG à fond transparent.']],
  },
  {
    slug: 'norme-en-iso-20471-haute-visibilite',
    title: 'Norme EN ISO 20471 : tout comprendre sur les vêtements haute visibilité',
    description: 'Classes 1, 2 et 3, surfaces minimales, marquage du logo : ce que dit la norme EN ISO 20471 pour les vêtements de signalisation.',
    categories: ['haute-visibilite-personnalisee'],
    sectors: ['btp-logistique'],
    related: ['preparer-logo-impression', 'taille-vetement-equipe', 'prix-vetement-personnalise-quantite'],
    intro: 'La norme EN ISO 20471 définit les exigences des vêtements haute visibilité portés par les personnes exposées à un risque de collision : chantiers, voirie, entrepôts, logistique.',
    sections: [
      { h2: 'Les trois classes', p: [
        'La norme classe les vêtements selon la surface minimale de matière fluorescente (le fond jaune ou orange) et de bandes rétroréfléchissantes. La classe 3 offre le niveau de visibilité le plus élevé, la classe 1 le plus faible.',
        'À titre indicatif, la classe 2 exige au moins 0,50 m² de matière fluorescente et 0,13 m² de bandes, la classe 3 au moins 0,80 m² et 0,20 m². La classe d\'un vêtement est indiquée sur son étiquette.',
      ] },
      { h2: 'Peut-on ajouter un logo ?', p: [
        'Oui, à condition de ne pas couvrir les bandes rétroréfléchissantes et de ne pas faire descendre la surface fluorescente sous le minimum de la classe. Nous plaçons le marquage en conséquence.',
      ] },
      { h2: 'Choisir sa classe', p: [
        'C\'est l\'évaluation des risques de votre activité qui détermine la classe nécessaire. Un gilet de classe 2 couvre la plupart des usages courants ; la classe 3 s\'impose pour les interventions sur voies rapides ou de nuit.',
      ] },
    ],
    faq: [['Le logo fait-il perdre la certification ?', 'Non, tant qu\'il ne recouvre pas les bandes et que la surface fluorescente minimale est respectée.']],
  },
  {
    slug: 'tenue-restaurant-personnalisee',
    title: 'Tenue de restaurant personnalisée : composer la tenue de votre équipe',
    description: 'Polos, tabliers, casquettes : comment composer une tenue de restaurant à votre logo, pratique, cohérente et facile à entretenir.',
    categories: ['tabliers-personnalises', 'polos-personnalises', 'casquettes-personnalisees'],
    sectors: ['restauration'],
    related: ['grammage-polo-travail', 'tablier-personnalise-quel-modele', 'taille-vetement-equipe'],
    intro: 'Une tenue cohérente rend votre équipe identifiable par les clients et renforce l\'image de votre établissement. Trois pièces suffisent souvent.',
    sections: [
      { h2: 'La base : un polo ou un t-shirt', p: [
        'Le polo donne une image soignée en salle ; le t-shirt est plus économique et adapté à la restauration rapide. Choisissez une couleur qui rappelle votre identité et sur laquelle votre logo ressort bien.',
      ] },
      { h2: 'Le tablier, pièce signature', p: [
        'Bavette pour la cuisine et le comptoir, mi-long pour le service en salle, denim pour un style plus tendance : le tablier porte souvent le logo le plus visible.',
      ] },
      { h2: 'La casquette, pour la cuisine et la vente à emporter', p: [
        'Réglable, elle convient à toute l\'équipe avec une seule taille.',
      ] },
    ],
    faq: [['Combien de tenues prévoir par personne ?', 'Au moins deux à trois par salarié pour assurer la rotation avec les lavages.']],
  },
  {
    slug: 'tablier-personnalise-quel-modele',
    title: 'Tablier personnalisé : quel modèle choisir ?',
    description: 'Bavette, mi-long ou denim : choisir le bon tablier personnalisé selon votre métier, et où placer le logo.',
    categories: ['tabliers-personnalises'],
    sectors: ['restauration', 'hotellerie'],
    related: ['tenue-restaurant-personnalisee', 'preparer-logo-impression', 'prix-vetement-personnalise-quantite'],
    intro: 'Le tablier est l\'une des pièces les plus visibles de votre tenue. Le bon modèle dépend du poste.',
    sections: [
      { h2: 'Le tablier bavette', p: ['Il protège le buste et les jambes : idéal en cuisine, en boulangerie et au comptoir. Le logo se place sur la bavette, entre 8 et 12 cm de large.'] },
      { h2: 'Le tablier mi-long', p: ['Noué à la taille, il laisse le buste libre pour le service en salle. Le logo se place sur la poche ou en bas du tablier.'] },
      { h2: 'Le tablier en denim', p: ['Résistant et tendance, il convient aux bars, cafés, barbiers et ateliers.'] },
    ],
    faq: [['Les tabliers sont-ils réglables ?', 'Oui, nos modèles ont une taille unique avec des liens réglables.']],
  },
  {
    slug: 't-shirt-personnalise-association-evenement',
    title: 'T-shirts personnalisés pour une association ou un événement',
    description: 'Choisir le bon t-shirt pour un club, une association, un salon ou un EVJF : modèle, couleurs, budget et délais.',
    categories: ['t-shirts-personnalises', 'casquettes-personnalisees'],
    sectors: ['evenementiel-associations'],
    related: ['prix-vetement-personnalise-quantite', 'taille-vetement-equipe', 'preparer-logo-impression'],
    intro: 'Pour un événement, le t-shirt personnalisé fédère votre groupe et le rend visible. Trois questions guident le choix.',
    sections: [
      { h2: 'Usage unique ou durable ?', p: ['Pour un événement d\'un jour, un 150 g/m² suffit et reste le plus économique. Pour un club qui portera ses t-shirts toute la saison, préférez 180 g/m² ou plus.'] },
      { h2: 'Le budget par personne', p: [`Le marquage baisse automatiquement avec la quantité : ${tiersText}. Commander toutes les tailles ensemble permet d\'atteindre plus vite un palier.`] },
      { h2: 'Le délai', p: ['Comptez 7 jours ouvrés de production (4 en express) après validation de la maquette, puis 1 à 3 jours ouvrés de transport : anticipez d\'au moins deux semaines avant votre événement.'] },
    ],
    faq: [['Peut-on mélanger les tailles ?', 'Oui, toutes les tailles d\'un même modèle comptent ensemble pour le prix dégressif.']],
  },
  {
    slug: 'prix-vetement-personnalise-quantite',
    title: 'Prix d\'un vêtement personnalisé : ce qui le fait varier',
    description: 'Modèle, nombre d\'emplacements, quantité : comprendre le prix d\'un vêtement personnalisé et comment le réduire.',
    categories: ['polos-personnalises', 't-shirts-personnalises'],
    related: ['impression-dtf-avantages', 't-shirt-personnalise-association-evenement', 'taille-vetement-equipe'],
    intro: 'Le prix d\'un vêtement personnalisé dépend de trois éléments : le vêtement, le marquage et la quantité commandée.',
    sections: [
      { h2: 'Le vêtement', p: ['Le grammage, la matière et la coupe font varier le prix de base : un t-shirt 150 g/m² coûte moins cher qu\'une veste softshell.'] },
      { h2: 'Le marquage', p: ['Chaque emplacement imprimé s\'ajoute au prix du vêtement : cœur ou anti-cœur (logo jusqu\'à 10 × 10 cm) 4 € HT, dos (jusqu\'à 27 × 27 cm) 6 € HT, grand devant (jusqu\'à 27 × 27 cm) 8 € HT à prix fixe, nuque ou épaule 2,50 € HT. Sur les textiles vendus plus de 25 € HT, le cœur et le dos sont à 5 € HT. Un logo au cœur et un grand logo au dos est la combinaison la plus courante pour une équipe.'] },
      { h2: 'La quantité', p: [`Plus vous commandez, plus le marquage baisse : ${tiersText}. Le site vous indique combien de pièces il manque pour atteindre le palier suivant.`] },
    ],
    faq: [['Y a-t-il des frais de préparation ?', 'Non. Avec l\'impression DTF, il n\'y a ni frais de création d\'écran ni frais de programme.']],
  },
  {
    slug: 'taille-vetement-equipe',
    title: 'Commander les bonnes tailles pour toute une équipe',
    description: 'Répartition type des tailles, guide de mesure et astuces pour commander les vêtements de toute votre équipe sans erreur.',
    categories: ['polos-personnalises', 't-shirts-personnalises', 'haute-visibilite-personnalisee'],
    related: ['grammage-polo-travail', 'tenue-restaurant-personnalisee', 'prix-vetement-personnalise-quantite'],
    intro: 'Les tailles sont la première source d\'erreur dans une commande d\'équipe. Quelques règles simples évitent les mauvaises surprises.',
    sections: [
      { h2: 'Demander plutôt que deviner', p: ['Le plus fiable est de demander à chacun sa taille habituelle dans un vêtement du même type. À défaut, mesurez à plat un vêtement qui lui va, d\'une aisselle à l\'autre, et comparez au tableau du modèle.'] },
      { h2: 'Une répartition type', p: ['Pour une équipe mixte sans information, une répartition courante est d\'environ 10 % de S, 30 % de M, 30 % de L, 20 % de XL et 10 % de XXL. Notre assistant la propose automatiquement, à ajuster ensuite.'] },
      { h2: 'Prévoir une marge', p: ['Ajoutez une ou deux pièces dans les tailles centrales pour les nouveaux arrivants : vous profitez du même prix et du même rendu.'] },
    ],
    faq: [['Les coupes femme taillent-elles plus petit ?', 'Elles sont ajustées : prenez souvent une taille au-dessus de votre taille habituelle unisexe.']],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guidesFor = (category: string) => GUIDES.filter((g) => g.categories.includes(category));
export const guidesForSector = (sector: string) => GUIDES.filter((g) => g.sectors?.includes(sector));
