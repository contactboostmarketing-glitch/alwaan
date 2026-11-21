# À traiter à la fin

Liste des actions en attente (à faire par l'équipe alwaan, ou des informations à fournir).

## Comptes et sécurité
- [ ] Changer `ROLY_SYNC_KEY` dans Netlify et créer une `STAFF_KEY` distincte (clé atelier).
- [ ] Activer la double authentification : Shopify, Netlify, GitHub, boîte contact@alwaan.fr.

## Variables Netlify à renseigner
- [ ] `RESEND_API_KEY` : compte resend.com + domaine alwaan.fr vérifié (DNS). Sert à la relance panier et à l'alerte réassort.
- [ ] `GOOGLE_SITE_VERIFICATION` : code de la balise HTML de la Search Console.
- [ ] Identifiants GA4 (`G-…`) et pixel Meta.
- [ ] Vérifier que `ANTHROPIC_API_KEY` est bien présente (assistant de commande + conseiller en ligne).
- [ ] Optionnel : `STOCK_ALERT` (seuil de réassort, 5 par défaut), `ATELIER_EMAIL` (destinataire des alertes).

## Google
- [ ] Search Console : propriété alwaan.fr, validation, envoi de `https://alwaan.fr/sitemap.xml`.
- [ ] Merchant Center : flux planifié quotidien `https://alwaan.fr/feeds/google.xml`.
- [ ] Remplacer les illustrations par les vraies photos produits dès qu'elles sont prêtes.

## Comptabilité
- [ ] Pennylane : Paramètres > Connexions > Shopify.

## Atelier
- [ ] Saisir le stock dans /atelier/stock.
- [ ] Confirmer les délais : textile vierge 2 j ouvrés, « sur commande » +5 j ouvrés.

## Catalogue (saisonnalité)
- [ ] Sweat, pull, veste sans manches : référence Roly, prix d'achat HT, couleurs, tailles.

## Légal
- [ ] Choisir un médiateur de la consommation (CM2C, Medicys…) et compléter la page Médiation.
- [ ] Faire relire CGV, confidentialité, cookies par un juriste.

## Tests en réel
- [ ] Commande payée par carte.
- [ ] Commande par virement (pro connecté).
- [ ] Mon profil : nom, adresse, facture avec société et SIRET.
- [ ] Panier envoyé par email, puis relance -10 % après 24 h.
- [ ] Conseiller en ligne : une vraie question, puis le passage à WhatsApp.
