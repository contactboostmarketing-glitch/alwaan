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
  email: process.env.COMPANY_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_PHONE || '',
  iban: process.env.COMPANY_IBAN || '',
};
export const TAGLINE = 'Tenues professionnelles personnalisées';

export const LEGAL_PAGES: Record<string, { title: string; body: string[] }> = {
  cgv: { title: 'Conditions générales de vente', body: [
    'Identité du vendeur, caractéristiques des produits, prix TTC et HT, frais de livraison, modalités de paiement et délais.',
    'Garanties légales de conformité (art. L217-3 et suivants du Code de la consommation) et des vices cachés (art. 1641 du Code civil).',
    'Exclusion du droit de rétractation pour les articles personnalisés (art. L221-28 3°), droit de rétractation de 14 jours pour les articles non personnalisés.',
    'Logos et visuels : le client garantit détenir les droits (marque, droit d\'auteur, droit à l\'image) sur les logos, textes et visuels qu\'il transmet, et garantit alwaan contre toute réclamation à ce sujet. alwaan peut refuser d\'imprimer un visuel qui porte manifestement atteinte aux droits d\'un tiers, à la loi ou aux bonnes mœurs ; la commande est alors annulée et remboursée.',
    'Service après-vente : voir la page « Retours, SAV et garanties ».',
    'Règlement des litiges et coordonnées du médiateur de la consommation.'] },
  'mentions-legales': { title: 'Mentions légales', body: [
    `Le site alwaan.fr est édité par ${COMPANY.name}, ${COMPANY.legalForm}${COMPANY.capital ? ` au capital de ${COMPANY.capital}` : ''}, dont le siège est situé ${COMPANY.address}. SIRET ${COMPANY.siret}, ${COMPANY.rcs}, TVA intracommunautaire ${COMPANY.vat}.`,
    `Directeur de la publication : le président de ${COMPANY.name}.${COMPANY.email ? ` Contact : ${COMPANY.email}.` : ''}${COMPANY.phone ? ` Téléphone : ${COMPANY.phone}.` : ''}`,
    'Hébergement : Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis. Boutique et paiement : Shopify International Ltd., Victoria Buildings, 1-2 Haddington Road, Dublin 4, Irlande.'] },
  confidentialite: { title: 'Politique de confidentialité', body: [
    'Données collectées, finalités, base légale, durées de conservation.',
    'Destinataires : transporteur, prestataire de paiement (Stripe), régies publicitaires si consentement (Google, Meta). Transferts hors UE et garanties.',
    'Email laissé dans l\'assistant : conservé pour renvoyer la maquette et rappeler la demande (intérêt légitime), lien de désinscription dans chaque email ; offres commerciales seulement avec accord explicite.',
    'Droits d\'accès, de rectification, d\'effacement, d\'opposition et de portabilité, contact et recours auprès de la CNIL.'] },
  cookies: { title: 'Cookies', body: [
    'Liste des cookies : nécessaires, mesure d\'audience, publicité (Google Ads, Meta Pixel).',
    'Aucun cookie publicitaire n\'est déposé sans votre accord. Refuser est aussi simple qu\'accepter. Votre choix est conservé 6 mois.'] },
  mediation: { title: 'Médiation de la consommation', body: [
    'Nom et coordonnées du médiateur auquel le client particulier peut recourir gratuitement en cas de litige non résolu.'] },
  livraison: { title: 'Livraison et délais', body: [
    'Délais indicatifs : production en 7 jours ouvrés après la commande, ou 4 jours ouvrés en production express (option payante : 15 € jusqu\'à 10 pièces, 20 € jusqu\'à 20, 30 € jusqu\'à 30, 60 € au-delà). Livraison en France et en Belgique.',
    'Livraison offerte dès 150 € HT d\'articles, sinon 9,90 € HT. Suivi par email.'] },
  retours: { title: 'Retours, SAV et garanties', body: [
    'Articles personnalisés : fabriqués à votre logo, ils ne bénéficient pas du droit de rétractation (art. L221-28 3° du Code de la consommation). Les garanties légales de conformité et des vices cachés s\'appliquent toujours.',
    'Votre maquette validée sur le site vaut bon à tirer. Nous imprimons ce que vous avez validé : emplacement, couleurs, texte et orthographe.',
    'Défaut de notre part (impression non conforme à la maquette validée, défaut du vêtement, erreur d\'article ou de quantité) : signalez-le sous 7 jours après réception, avec une photo, par email, WhatsApp ou depuis votre espace client. Nous réimprimons gratuitement les pièces concernées en production express, ou nous les remboursons, et le retour est à nos frais.',
    'Ce qui ne donne pas lieu à reprise : une erreur présente sur la maquette validée (faute de frappe, taille commandée, emplacement choisi), un logo fourni en petite définition malgré l\'avertissement affiché, ou une différence de rendu entre l\'écran et le textile dans les tolérances habituelles (placement à ±1 cm, taille du logo à ±5 %, légère variation de teinte).',
    'Avant chaque expédition, nous photographions une pièce de votre commande : la photo de contrôle est visible dans votre espace client.',
    'Colis abîmé ou perdu : indiquez des réserves au transporteur et prévenez-nous, nous renvoyons la commande.',
    'Délais indicatifs. Si une production express n\'est pas expédiée dans le délai annoncé, les frais d\'express sont remboursés.'] },
};
