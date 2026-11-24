/** Domaine principal sans www (www.alwaan.fr redirige vers alwaan.fr). */
const normalize = (u: string) => u.replace(/\/$/, '').replace('://www.alwaan.fr', '://alwaan.fr');
export const SITE_URL = normalize(process.env.NEXT_PUBLIC_SITE_URL || 'https://alwaan.fr');
/** Adresse publique pour les liens envoyés (emails, commandes) : réglage, sinon adresse principale Netlify, sinon celle de la requête. */
export const publicOrigin = (req: Request) =>
  normalize(process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || new URL(req.url).origin);

/** Indexation par les moteurs : ouverte depuis le lancement. SITE_INDEXABLE=false dans Netlify la referme (site de test, maintenance). */
export const INDEXABLE = process.env.SITE_INDEXABLE !== 'false';

export const SITE_NAME = 'alwaan';

/** Société éditrice (source : annuaire officiel des entreprises, INSEE ; capital et RCS confirmés par le dirigeant). */
export const COMPANY = {
  name: process.env.COMPANY_NAME || 'YCOM',
  brand: 'alwaan',
  legalForm: 'SAS',
  address: process.env.COMPANY_ADDRESS || '121 rue Léon Gambetta, 59320 Haubourdin, France',
  siren: '990 444 291',
  siret: process.env.COMPANY_SIRET || '990 444 291 00019',
  vat: process.env.COMPANY_VAT || 'FR76 990444291',
  rcs: process.env.COMPANY_RCS || 'RCS Lille 990 444 291',
  capital: process.env.COMPANY_CAPITAL || '1 000 €',
  email: process.env.COMPANY_EMAIL || 'contact@alwaan.fr',
  phone: process.env.NEXT_PUBLIC_PHONE || '+33 6 08 89 72 82',
  /** Horaires d'ouverture (téléphone et atelier). */
  hours: { fr: 'du lundi au vendredi, 9 h 30 – 18 h', en: 'Monday to Friday, 9:30 am – 6 pm', schema: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:30', closes: '18:00' } },
  // Coordonnées bancaires (Qonto), affichées pour les virements et sur les devis.
  iban: process.env.COMPANY_IBAN || 'FR76 1695 8000 0194 8869 7526 491',
  bic: process.env.COMPANY_BIC || 'QNTOFRP1XXX',
};
const MEDIATOR = { name: process.env.MEDIATEUR_NOM || '', address: process.env.MEDIATEUR_ADRESSE || '', site: process.env.MEDIATEUR_SITE || '' };
export const TAGLINE = 'Tenues professionnelles personnalisées';

/** final : texte rédigé (CGV, confidentialité : voir legalTexts.ts) ; sinon page encore à compléter. */
export const LEGAL_PAGES: Record<string, { title: string; body: string[]; final?: boolean }> = {
  cgv: { title: 'Conditions générales de vente', body: [], final: true },
  'mentions-legales': { title: 'Mentions légales', final: true, body: [
    `Le site alwaan.fr est édité par ${COMPANY.name}, ${COMPANY.legalForm}${COMPANY.capital ? ` au capital de ${COMPANY.capital}` : ''}, dont le siège est situé ${COMPANY.address}. SIRET ${COMPANY.siret}, ${COMPANY.rcs}, TVA intracommunautaire ${COMPANY.vat}.`,
    `Directeur de la publication : le président de ${COMPANY.name}.${COMPANY.email ? ` Contact : ${COMPANY.email}.` : ''}${COMPANY.phone ? ` Téléphone : ${COMPANY.phone}.` : ''}`,
    'Hébergement : Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis. Boutique et paiement : Shopify International Ltd., Victoria Buildings, 1-2 Haddington Road, Dublin 4, Irlande.'] },
  confidentialite: { title: 'Politique de confidentialité', body: [], final: true },
  cookies: { title: 'Cookies', final: true, body: [
    'Liste des cookies : nécessaires, mesure d\'audience, publicité (Google Ads, Meta Pixel).',
    'Aucun cookie publicitaire n\'est déposé sans votre accord. Refuser est aussi simple qu\'accepter. Votre choix est conservé 6 mois.'] },
  // Médiateur : variables Netlify MEDIATEUR_NOM, MEDIATEUR_ADRESSE, MEDIATEUR_SITE une fois l'adhésion signée.
  mediation: { title: 'Médiation de la consommation', final: true, body: [
    `Avant toute médiation, adressez votre réclamation par écrit à alwaan${COMPANY.email ? ` (${COMPANY.email})` : ''} ou depuis votre espace client : nous répondons sous 7 jours.`,
    ...(MEDIATOR.name
      ? [`Conformément aux articles L611-1 et suivants du Code de la consommation, le client particulier peut recourir gratuitement au médiateur de la consommation dont relève alwaan : ${MEDIATOR.name}${MEDIATOR.address ? `, ${MEDIATOR.address}` : ''}${MEDIATOR.site ? `, ${MEDIATOR.site}` : ''}.`,
        'La saisine du médiateur est possible si votre réclamation écrite n\'a pas abouti, dans un délai d\'un an à compter de celle-ci. Le médiateur ne peut pas être saisi pour un litige entre professionnels.']
      : ['Notre adhésion à un médiateur de la consommation est en cours : ses coordonnées seront indiquées ici dès sa signature.',
        'D\'ici là, si votre réclamation écrite n\'a pas abouti, vous pouvez saisir gratuitement un conciliateur de justice (conciliateurs.fr).']),
  ] },
  livraison: { title: 'Livraison et délais', final: true, body: [
    'Délais indicatifs : production en 7 jours ouvrés après la commande, ou 4 jours ouvrés en production express pour les articles en stock à l\'atelier (option payante : 15 € jusqu\'à 10 pièces, 20 € jusqu\'à 20, 30 € jusqu\'à 30, 60 € au-delà). Livraison en France et en Belgique.',
    'Livraison offerte dès 120 € HT d\'articles. Sinon : 9,90 € HT à domicile ou en entreprise (Colissimo), ou 4,90 € HT en point relais Mondial Relay (point choisi juste après le paiement). Suivi par email.'] },
  retours: { title: 'Retours, SAV et garanties', final: true, body: [
    'Articles personnalisés : fabriqués à votre logo, ils ne bénéficient pas du droit de rétractation (art. L221-28 3° du Code de la consommation). Les garanties légales de conformité et des vices cachés s\'appliquent toujours.',
    'Textile vierge (vendu sans aucun marquage) : les particuliers disposent d\'un délai de rétractation de 14 jours à compter de la réception, sans avoir à se justifier. Prévenez-nous par email à ' + COMPANY.email + ' (ou avec le formulaire ci-dessous), puis renvoyez les articles neufs, non portés, non lavés et dans leur emballage d\'origine, sous 14 jours. Les frais de retour sont à votre charge. Nous vous remboursons sous 14 jours après réception du retour, frais de livraison initiaux compris (au tarif standard), par le même moyen de paiement. Cette possibilité ne concerne pas les clients professionnels ni les articles personnalisés.',
    'Formulaire de rétractation (textile vierge, à envoyer à ' + COMPANY.name + ', ' + COMPANY.address + ', ' + COMPANY.email + ') : « Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous : commandé le … / reçu le … ; numéro de commande ; nom ; adresse ; date ; signature (en cas d\'envoi papier). »',
    'Votre maquette validée sur le site vaut bon à tirer. Nous imprimons ce que vous avez validé : emplacement, couleurs, texte et orthographe.',
    'Défaut de notre part (impression non conforme à la maquette validée, défaut du vêtement, erreur d\'article ou de quantité) : signalez-le sous 7 jours après réception, avec une photo, par email, WhatsApp ou depuis votre espace client. Nous réimprimons gratuitement les pièces concernées en production express, ou nous les remboursons, et le retour est à nos frais.',
    'Ce qui ne donne pas lieu à reprise : une erreur présente sur la maquette validée (faute de frappe, taille commandée, emplacement choisi), un logo fourni en petite définition malgré l\'avertissement affiché, ou une différence de rendu entre l\'écran et le textile dans les tolérances habituelles (placement à ±1 cm, taille du logo à ±5 %, légère variation de teinte).',
    'Avant chaque expédition, nous photographions une pièce de votre commande : la photo de contrôle est visible dans votre espace client.',
    'Colis abîmé ou perdu : indiquez des réserves au transporteur et prévenez-nous, nous renvoyons la commande.',
    'Délais indicatifs. Si une production express n\'est pas expédiée dans le délai annoncé, les frais d\'express sont remboursés.'] },
};
