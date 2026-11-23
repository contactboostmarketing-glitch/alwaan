# À traiter à la fin

Liste des actions en attente (à faire par l'équipe alwaan, ou des informations à fournir).

## Comptes et sécurité
- [ ] Changer `ROLY_SYNC_KEY` dans Netlify et créer une `STAFF_KEY` distincte (clé atelier).
- [x] `SYNC_KEY` créée dans Netlify (synchronisation Shopify : POST /api/shopify/setup, en-tête x-sync-key ; ?dry=1 pour simuler).
- [ ] Lancer la synchro Shopify après chaque changement de prix ou de produit (crée les produits manquants, aligne les prix).
- [ ] Confirmer les coloris Roly de la gamme hiver (Clasica, Urban, Montblanc, Himalaya, Nebraska, Oslo) et les prix d'achat (avec marquage) des casquettes Wizer et Barny (Mercury : 1,12 € HT).
- [x] API Roly : ROLY_USERNAME / ROLY_PASSWORD (identifiants extranet) dans Netlify, pour les photos produits, le stock et les tarifs. Diagnostic : GET /api/roly/check (en-tête x-sync-key).
- [ ] Activer la double authentification : Shopify, Netlify, GitHub, boîte contact@alwaan.fr.

## Variables Netlify à renseigner
- [x] `RESEND_API_KEY` : compte resend.com + domaine alwaan.fr vérifié (DNS). Sert à la relance panier et à l'alerte réassort.
- [ ] `GOOGLE_SITE_VERIFICATION` : code de la balise HTML de la Search Console.
- [ ] Identifiants GA4 (`G-…`) et pixel Meta.
- [ ] Vérifier que `ANTHROPIC_API_KEY` est bien présente (assistant de commande + conseiller en ligne).
- [ ] Optionnel : `STOCK_ALERT` (seuil de réassort, 5 par défaut), `ATELIER_EMAIL` (destinataire des alertes).

## Google
- [ ] Search Console : propriété alwaan.fr, validation, envoi de `https://alwaan.fr/sitemap.xml`.
- [ ] Merchant Center : flux planifié quotidien `https://alwaan.fr/feeds/google.xml`.
- [ ] Remplacer les illustrations par les vraies photos produits dès qu'elles sont prêtes.

## Marketing
- [ ] Créer la fiche Google Business Profile de l'atelier (Haubourdin) et demander les premiers avis Google.
- [ ] Vidéo de l'atelier (impression DTF) : la mettre sur YouTube puis renseigner `NEXT_PUBLIC_ATELIER_VIDEO` (lien d'intégration youtube-nocookie.com/embed/…).
- [ ] Relire et publier les avis clients dans /atelier/avis (publier aussi les avis négatifs authentiques).
- [ ] Campagnes saisonnières : Shopify Email vers les clients inscrits aux offres (tag `inscrit-site`).
- [ ] Logos de clients pour « Ils nous font confiance » (avec leur accord).
- [ ] Mis de côté : kit nuancier / échantillons de tissus pour les pros.

## Comptabilité
- [ ] Pennylane : Paramètres > Connexions > Shopify.

## Atelier
- [ ] Saisir le stock dans /atelier/stock.
- [ ] Confirmer les délais : textile vierge 2 j ouvrés, « sur commande » +5 j ouvrés.

## Catalogue (saisonnalité)
- [ ] Sweat, pull, veste sans manches : référence Roly, prix d'achat HT, couleurs, tailles.

## Légal
- [ ] Choisir un médiateur de la consommation (CM2C, Medicys…), puis renseigner dans Netlify MEDIATEUR_NOM, MEDIATEUR_ADRESSE, MEDIATEUR_SITE (la page Médiation se met à jour toute seule ; d'ici là elle oriente vers le conciliateur de justice).
- [x] Désactiver le badge « Powered by Netlify » (Project configuration → General) : il recouvre « Ajouter au panier » et « Tout accepter » sur mobile.
- [ ] Faire relire CGV, confidentialité, cookies par un juriste.

## Tests en réel
- [ ] Rembourser la commande test #1001 (annulée mais encore « Payée »).
- [ ] Sendcloud : ajouter la carte bancaire (sinon aucune étiquette) et les dimensions réelles de l'enveloppe e-commerce.
- [x] Commande payée par carte (#1001 du 23/11/2026, Shopify Payments, annulée ; les commandes annulées sortent du suivi automatiquement).
- [ ] Commande par virement (pro connecté).
- [ ] Mon profil : nom, adresse, facture avec société et SIRET.
- [ ] Panier envoyé par email, puis relance -10 % après 24 h.
- [ ] Conseiller en ligne : une vraie question, puis le passage à WhatsApp.
