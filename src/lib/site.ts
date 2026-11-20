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
    'Production en 7 jours ouvrés après la commande, 4 jours en express. Livraison en France et en Belgique.',
    'Livraison offerte dès 150 € HT d\'articles, sinon 9,90 € HT. Suivi par email.'] },
  retours: { title: 'Retours et rétractation', body: [
    'Articles marqués à votre logo : fabriqués sur mesure, ils ne bénéficient pas du droit de rétractation. Un défaut ou une erreur de notre part est refait ou remboursé.',
    'La maquette validée sur le site vaut bon à tirer : l\'impression la reproduit fidèlement (emplacement, couleurs, texte). Une impression non conforme à la maquette validée est refaite à nos frais.'] },
};
