export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alwaan.fr').replace(/\/$/, '');
export const SITE_NAME = 'alwaan';
export const TAGLINE = 'Tenues professionnelles personnalisées';

export const LEGAL_PAGES: Record<string, { title: string; body: string[] }> = {
  cgv: { title: 'Conditions générales de vente', body: [
    'Identité du vendeur, caractéristiques des produits, prix TTC et HT, frais de livraison, modalités de paiement et délais.',
    'Garanties légales de conformité (art. L217-3 et suivants du Code de la consommation) et des vices cachés (art. 1641 du Code civil).',
    'Exclusion du droit de rétractation pour les articles personnalisés (art. L221-28 3°), droit de rétractation de 14 jours pour les articles non personnalisés.',
    'Règlement des litiges et coordonnées du médiateur de la consommation.'] },
  'mentions-legales': { title: 'Mentions légales', body: [
    'Raison sociale, forme juridique, capital, adresse du siège, SIREN/SIRET, RCS, numéro de TVA intracommunautaire.',
    'Directeur de la publication, hébergeur (Netlify) et ses coordonnées, contact.'] },
  confidentialite: { title: 'Politique de confidentialité', body: [
    'Données collectées, finalités, base légale, durées de conservation.',
    'Destinataires : transporteur, prestataire de paiement (Stripe), régies publicitaires si consentement (Google, Meta). Transferts hors UE et garanties.',
    'Droits d\'accès, de rectification, d\'effacement, d\'opposition et de portabilité, contact et recours auprès de la CNIL.'] },
  cookies: { title: 'Cookies', body: [
    'Liste des cookies : nécessaires, mesure d\'audience, publicité (Google Ads, Meta Pixel).',
    'Aucun cookie publicitaire n\'est déposé sans votre accord. Refuser est aussi simple qu\'accepter. Votre choix est conservé 6 mois.'] },
  mediation: { title: 'Médiation de la consommation', body: [
    'Nom et coordonnées du médiateur auquel le client particulier peut recourir gratuitement en cas de litige non résolu.'] },
  livraison: { title: 'Livraison et délais', body: [
    'Production en 7 jours ouvrés après validation du visuel, 4 jours en express.',
    'Livraison offerte dès 150 € HT d\'articles, sinon 9,90 € HT. Suivi par email.'] },
  retours: { title: 'Retours et rétractation', body: [
    'Articles marqués à votre logo : fabriqués sur mesure, ils ne bénéficient pas du droit de rétractation. Un défaut ou une erreur de notre part est refait ou remboursé.',
    'Si le visuel (BAT) ne vous convient pas, vous êtes remboursé intégralement avant toute production.'] },
};
