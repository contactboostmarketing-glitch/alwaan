# Stratégie d'acquisition payante alwaan.fr (lancement)

Premier passage du 23/11/2026. Rien n'est activé, rien n'est dépensé : tout ce qui suit est une **proposition** à valider par écrit par le gérant.
Journal des décisions : `docs/ads-journal.md`.

## 0. En une minute

- **Il n'y a encore aucune vente réelle** (insights 90 jours vides, commande test #1001 annulée et exclue). On démarre sans historique : les deux premiers mois servent à apprendre, puis on coupe ce qui ne rapporte pas.
- **Bloquant n° 1 : la mesure des achats.** Le paiement se fait sur le checkout Shopify, pas sur alwaan.fr. La balise Google Ads du pixel Shopify n'a donc pas le clic publicitaire (gclid) et ne se déclenche qu'avec le consentement géré côté Shopify. En l'état, Google Ads risque de ne voir presque aucune vente. **Aucune dépense tant qu'un achat test n'apparaît pas dans Google Ads** (voir section 1 et demandes P0).
- **Calcul clé** : la marge sur coûts variables tourne autour de **45 % du CA HT** (hypothèses DTF et main-d'œuvre à valider). Le seuil de rentabilité est donc un **ROAS de 2,2**. La cible à 35 % de la marge donne un **ROAS de 6,3**. Sur une commande pro de 10 pièces (176 à 350 € HT), le CPA maximal va de **28 à 57 €**. Sur une commande de particulier à 1 ou 2 pièces, il est de **3 à 6 €**, ce que le Search ne peut pas tenir. **Le payant vise donc d'abord les pros et les clubs**, et les particuliers seulement via Shopping avec des enchères basses.
- **Budget proposé sur 12 semaines : 2 905 €** (décembre 630 €, janvier 1 050 €, février 1 225 €), validé mois par mois. Seule la tranche de décembre (630 €) est à valider maintenant.
- Selon le scénario médian, les 12 semaines finissent à l'équilibre (environ −115 € de marge nette après pub, 55 commandes, 6 200 € HT de CA). Le payant devient rentable à partir de janvier. Le scénario prudent déclenche les seuils d'arrêt et la perte reste plafonnée à environ 1 200 €. Le scénario ambitieux rapporte environ 5 100 € de marge nette.

---

## 1. Audit de départ

### 1.1 Données lues
| Source | Constat |
|---|---|
| `GET /api/insights?jours=90` (23/11) | Saison `noel`. 0 commande, 0 avis, 0 demande de devis, 0 question, 0 rupture. Aucune donnée client à exploiter : la stratégie repose sur des hypothèses, à corriger dès les premières ventes. |
| Flux `https://alwaan.fr/feeds/google.xml` | 95 articles (23 modèles × coloris), tous `in_stock`. Répartition : T-shirts 20, Polos 19, Sweats 16, Casquettes 14, Vestes 9, Tabliers 8, Haute visibilité 5, Chemises 4. Prix TTC au prix d'1 pièce avec logo cœur (ex. Polo Pegaso 16,32 € TTC = 13,60 € HT ; Mercury 6,60 € TTC = 5,50 € HT). `custom_label_0` = famille, `custom_label_1` = best-seller (43 articles), `return_policy_label` = personnalise. |
| `src/lib/catalog.ts`, `pricing.ts` | Vêtement = coût Roly × 2 (coûts Roly notés « provisoires »). Marquage cœur 4 €, dos 6 €, grand devant 8 € (fixe), épaule/nuque 2,50 €, textile > 25 € HT : cœur/dos 5 €. Remise marquage −15/−20/−40 % dès 5/10/30 pièces au même logo. Casquettes : prix tout compris dégressif. Livraison 9,90 € HT, offerte dès 150 € HT. Express 15 à 60 €. Un seul avantage par commande. |
| `src/lib/delivery.ts`, `seasons.ts` | Production 7 jours ouvrés (express 4) + 2 jours de transport dans le calcul. **Le site affiche « Commandez avant le jeu. 10 déc. pour être livré au plus tard le 24 décembre »** : c'est la date qui fait foi pour les annonces. |
| `src/components/Tracking.tsx`, `src/lib/track.ts` | gtag avec Consent Mode v2 (refus par défaut). GA4 seulement si `NEXT_PUBLIC_GA4_ID` est renseigné, ce qui n'est pas fait (A-FAIRE.md). Meta seulement avec consentement et si `NEXT_PUBLIC_META_PIXEL_ID` est renseigné (pas fait). gclid, gbraid, wbraid, fbclid et UTM sont mémorisés 90 jours et transmis à la commande Shopify (attributs) **seulement avec l'accord publicité**. |
| `src/lib/conversions.ts` + webhook Shopify | Envoi serveur à GA4 (Measurement Protocol) et à Meta CAPI. Les deux sont **inactifs** faute de variables. **Il n'y a pas d'envoi serveur direct vers Google Ads.** Le gclid passé en paramètre GA4 MP n'est pas utilisé par Google Ads pour attribuer. |
| `docs/shopify-pixel-google-ads.js` | Pixel « Google Ads alwaan » sur `checkout_completed`, valeur = sous-total, `transaction_id` = id de commande, permission Marketing. |
| `src/app/merci/Conversion.tsx` | Conversion Achat du paiement de secours (Stripe) envoyée **sans valeur**. |
| Pages produit (données structurées) | `AggregateOffer lowPrice 14.40` (prix à 30 pièces TTC) contre 16,32 € dans le flux. Risque d'avertissement « prix non concordant » ou de correction automatique du prix par Merchant Center. À vérifier dans le diagnostic Merchant. |

### 1.2 Mesure : ce qui marche, ce qui bloque
| Élément | État | Gravité |
|---|---|---|
| Action « Achat » AW-18590441820 / wv8oCPSexL0dENzCzqBF | Créée. Remontée de l'achat test non confirmée. | **Bloquant** |
| Pixel Shopify sur checkout_completed | Le checkout Shopify est sur un autre domaine qu'alwaan.fr (site headless) : le cookie de clic `_gcl_aw` déposé sur alwaan.fr n'y est pas lisible, donc l'achat n'est pas rattaché au clic. La permission Marketing exige aussi que le bandeau de confidentialité Shopify soit actif sur le checkout. Sinon, en Europe, le pixel ne se déclenche pas. | **Bloquant** |
| Commandes par virement (pros) | Pas de `checkout_completed` : elles sont invisibles pour Google Ads alors que c'est le B2B qui fait le panier. | **Bloquant pour le B2B** |
| Conversion serveur Google Ads | Absente. Le webhook dispose pourtant du gclid, de la valeur HT et du numéro de commande : il suffit de l'envoyer à Google Ads (import de conversions de clics). | **Bloquant** (solution P0-1) |
| GA4 | Pas d'identifiant. Pas d'analyse d'audience ni d'entonnoir, pas d'import possible. | Élevé |
| Micro-conversions | `generate_lead` déclenché par le devis PDF du panier et par l'assistant. Rien pour le formulaire `/devis`, la création d'un lien d'équipe ou d'une boutique club. | Moyen |
| Suivi avancé des conversions | Désactivé. À activer seulement après validation du gérant (e-mail haché, base légale, mention dans la politique de confidentialité). | Moyen |
| Meta Pixel / CAPI, TikTok | Non configurés. | Bloquant pour ces canaux uniquement |

### 1.3 Flux Merchant Center (5915162698)
Points corrects : identifiants stables par coloris, `item_group_id`, marque, état, catégorie Google, famille en `custom_label_0`, étiquette de retour, prix TTC cohérents avec la grille, livraison FR/BE 11,88 € TTC offerte dès 180 € TTC (= 150 € HT).

À corriger ou vérifier (demandes P1) :
1. **Concordance des prix** : données structurées `lowPrice` 14,40 € contre 16,32 € dans le flux. Il faut une `Offer` au prix exact de l'article du flux (1 pièce, cœur, coloris de l'URL).
2. **`g:size` = « S-5XL »** : c'est une plage, pas une taille. Vérifier les avertissements « taille ». Mieux : une variante par taille, ou au minimum une taille valide.
3. **Images hébergées chez le fournisseur** (static.gorfactory.es, 499 liens) : risque de coupure ou de refus. Elles montrent du textile vierge. Une image principale avec un logo d'exemple (maquette) hébergée sur alwaan.fr améliorerait le taux de clic, à condition de rester une maquette honnête.
4. **Étiquettes de pilotage manquantes** : `custom_label_2` = marge (haute/moyenne/basse), `custom_label_3` = saison, `custom_label_4` = cible (pro/particulier/mixte).
5. **Belgique** : vérifier que le flux est bien diffusé pour la BE et que le prix TTC affiché à un acheteur belge correspond (le checkout est créé en contexte pays FR).
6. Comptes : vérifier dans Merchant > Diagnostic qu'aucun article n'est refusé (pas d'accès direct ici, export à fournir par le gérant).

### 1.4 Comptes
| Compte | État | Action |
|---|---|---|
| Google Ads 251-489-2270 | Campagne « Search – Marque alwaan » en pause (5 €/j, présence, CPC max 0,50 €). Aucune autre campagne. | Proposé : réactivation à 2 €/j **après validation** et confirmation de la mesure. |
| Merchant Center 5915162698 | Lié, site revendiqué, flux en place. | Corrections du flux (P1). |
| GA4 | Inexistant. | Création par le gérant ou l'informaticien. |
| Meta Business / TikTok | Inexistants. | Ne pas créer sans accord écrit du gérant. Création proposée en janvier (Meta). |

### 1.5 Manques bloquants (ordre de résolution)
1. Achat mesuré **côté serveur** dans Google Ads avec le gclid (P0-1), commandes par virement comprises.
2. Un achat test réel (petit montant, puis remboursé) visible dans Google Ads > Conversions avec la bonne valeur HT. Il faut ensuite l'exclure ou l'ajuster.
3. GA4 opérationnel (P0-2).
4. Validation par le gérant du coût réel du marquage (hypothèses de la section 2).
5. Validation écrite du budget de décembre.

---

## 2. Marges, CPA maximal et ROAS cible

### 2.1 Hypothèses (à valider par le gérant)
| Poste | Hypothèse | Statut |
|---|---|---|
| Textile | Coût Roly de `catalog.ts` (prix « provisoires ») | À confirmer avec les tarifs Roly reçus |
| Transfert DTF (film, encre, poudre) | 0,40 € par zone 10 × 10 cm, 1,50 € par zone 27 × 27 cm | **Hypothèse, à valider** |
| Main-d'œuvre (pressage, contrôle, pliage) | 1,00 € par pièce pour la 1re zone, puis 0,40 € par zone supplémentaire (environ 2 min à 30 €/h chargé) | **Hypothèse, à valider** |
| Casquette Mercury | 1,12 € HT tout compris (donnée gérant) + 0,60 € de main-d'œuvre | Main-d'œuvre à confirmer. Wizer et Barny : coûts inconnus |
| Emballage et préparation | 1,50 € par commande | Hypothèse |
| Port réel | 7,50 € HT (petit colis) ; 11 € HT au-delà de 150 € HT (colis plus lourd, port offert) | Hypothèse, à remplacer par la grille du transporteur |
| Frais de paiement | Shopify Payments, cartes UE : 1,5 % du TTC + 0,25 € | À vérifier selon le forfait |
| Codes −10 % (BIENV, relance) | Non inclus ci-dessous. Chaque commande avec code perd 10 % du CA, soit environ −20 % de marge. | Suivre leur part |
| Part acceptable de la marge pour la pub | 35 % (cible). **Phase d'apprentissage (déc.–janv.) : jusqu'à 100 % (équilibre)** | **À valider** |

### 2.2 Paniers types (calcul : `prix HT − coûts variables`, port facturé inclus dans le CA)
| Panier type | PU HT | CA HT | Coûts variables | Marge | Taux de marge | CPA max (35 %) | ROAS d'équilibre | ROAS cible (35 %) |
|---|---|---|---|---|---|---|---|---|
| Polos pro : 10 Pegaso cœur + dos | 17,60 | 176,00 | 96,92 | 79,08 | 45 % | 27,68 | 2,2 | 6,4 |
| Polo particulier : 1 Pegaso cœur | 13,60 | 23,50 | 15,87 | 7,63 | 32 % | 2,67 | 3,1 | 8,8 |
| T-shirts asso : 20 Dogo cœur + dos | 12,78 | 255,60 | 131,15 | 124,45 | 49 % | 43,56 | 2,1 | 5,9 |
| T-shirts événement : 50 Atomic cœur | 5,40 | 270,00 | 162,61 | 107,39 | 40 % | 37,59 | 2,5 | 7,2 |
| T-shirt cadeau : 2 Dogo grand devant | 12,78 | 35,46 | 19,67 | 15,79 | 45 % | 5,53 | 2,2 | 6,4 |
| Sweats équipe : 10 Clasica cœur + dos | 20,50 | 205,00 | 111,94 | 93,06 | 45 % | 32,57 | 2,2 | 6,3 |
| Sweat cadeau : 1 Urban grand devant | 23,76 | 33,66 | 20,24 | 13,42 | 40 % | 4,70 | 2,5 | 7,2 |
| HV BTP : 10 gilets Beta cœur + dos | 31,00 | 310,00 | 166,33 | 143,67 | 46 % | 50,28 | 2,2 | 6,2 |
| Vestes : 10 Softshell cœur + dos | 34,88 | 348,80 | 186,43 | 162,37 | 47 % | 56,83 | 2,1 | 6,1 |
| Tabliers resto : 5 Benoit poche | 10,76 | 63,70 | 35,80 | 27,90 | 44 % | 9,76 | 2,3 | 6,5 |
| Chemises : 5 Moscu cœur | 24,30 | 131,40 | 70,87 | 60,53 | 46 % | 21,19 | 2,2 | 6,2 |
| Casquettes : 10 Mercury | 4,80 | 57,90 | 27,49 | 30,41 | 53 % | 10,64 | 1,9 | 5,4 |
| Casquettes : 30 Mercury | 4,00 | 129,90 | 63,19 | 66,71 | 51 % | 23,35 | 1,9 | 5,6 |
| Casquettes : 100 Mercury | 3,00 | 300,00 | 190,15 | 109,85 | 37 % | 38,45 | 2,7 | 7,8 |

Formules : CPA max = marge × 35 % ; ROAS d'équilibre = 1 / taux de marge ; ROAS cible = 1 / (taux de marge × 35 %).

### 2.3 Ce qu'on en retient
- **Par famille** (paniers pros de 10 pièces) : la marge est homogène, entre 44 et 49 %. **Le levier, c'est le panier, pas la famille.** HV, vestes et t-shirts d'association apportent les plus grosses marges absolues : ce sont eux qui supportent le mieux un CPC élevé.
- **Pro contre particulier** : un pro de 10 pièces dégage 80 à 160 € de marge, un particulier à 1 ou 2 pièces 8 à 16 €. Avec un CPC de 0,90 € et un CPA max de 5 €, il faudrait plus de 18 % de taux de conversion : impossible. **Pas de Search « cadeau particulier » payant.** Les particuliers ne sont touchés que par Shopping (CPC ≤ 0,30 €), par le SEO et par les e-mails.
- **Casquette Mercury = produit d'appel** : taux de marge de 51 à 53 % jusqu'à 30 pièces, prix lisible (5,50 € HT tout compris). C'est un bon produit pour Shopping et pour l'accroche des annonces. À 100 pièces, la marge baisse à 37 % à cause de la main-d'œuvre supposée : à confirmer.
- **Valeur vie client** : le B2B recommande (lien « Recommander », nouvelles recrues). Si le gérant l'accepte, on pourra autoriser un CPA de première commande plus élevé pour les pros, après 3 mois de données de réachat. Ce n'est pas retenu pour l'instant.
- **Cible de pilotage retenue** : taux de marge moyen **45 %**, ROAS d'équilibre **2,2**, ROAS cible **6,3** (à 35 %). Pendant l'apprentissage, le ROAS doit rester au-dessus de 2,2 à partir de janvier, puis tendre vers 3 en février et vers 6 au-delà.

---

## 3. Plan 90 jours par canal

### 3.1 Phases
| Phase | Dates | Objectif | Canaux |
|---|---|---|---|
| 0 – Pré-requis | 23/11 → 29/11 | Mesure serveur, achat test visible, flux propre, validation du budget | Aucun achat média |
| 1 – Noël pro + apprentissage | 30/11 → 10/12 (14 h) | Premières commandes, termes de recherche, valider la mesure | Google Search (marque, métiers), Shopping standard |
| 1b – Creux des fêtes | 11/12 → 03/01 | Limiter la dépense, préparer janvier | Google réduit (marque + meilleurs groupes) |
| 2 – Janvier B2B | 04/01 → 31/01 | Montée en charge sur ce qui convertit, ROAS ≥ 2,2 | Google ; Meta reciblage à partir du 18/01 si pixel et CAPI sont en place |
| 3 – Février + préparation du printemps | 01/02 → 21/02 | ROAS ≥ 3, lancement « restauration printemps » | Google ; test de prospection Meta |
| TikTok | Pas avant mars | Test cadré seulement après la pose du pixel | Spécification technique prête (P2) |

### 3.2 Google Ads (priorité 1)
**Réglages communs** : France + Belgique, ciblage « présence » (personnes dans la zone), langue français. Modulation géographique : +20 % sur Nord (59), Pas-de-Calais (62) et Hainaut (Tournai, Mouscron), à mesurer par région. Planning : lundi–vendredi 7 h–20 h pour les campagnes pro (−50 % le week-end), 7 j/7 pour Shopping. Réseau Display et partenaires de recherche **désactivés**.
**Enchères** : CPC manuel avec plafonds au démarrage (pas d'historique). Passage à « Maximiser la valeur de conversion » avec ROAS cible seulement après 30 conversions serveur sur 30 jours.
**Conversion principale** : « Achat (serveur) » uniquement. Le pixel Shopify passe en secondaire pour éviter le double comptage. Devis, lien d'équipe et boutique club sont des **micro-conversions secondaires** (observation, non optimisées).

| Campagne | Contenu | Budget/jour proposé (déc.) | Plafond CPC |
|---|---|---|---|
| Search – Marque alwaan (existante, en pause) | [alwaan], "alwaan fr", "alwaan vêtements" | **2 €** (dépense réelle attendue < 5 % du total) | 0,50 € |
| Search – Pro métiers × produit | 8 groupes serrés + Noël / Janvier (5.1) | **15 €** | 0,90 à 1,80 € selon le groupe |
| Shopping standard – Catalogue | Groupes de produits par `custom_label_0` (famille) | **8 €** | 0,25 à 0,50 € selon la famille |
| Performance Max | **Pas au lancement** : sans historique, PMax dépense sur Display et YouTube sans signal fiable | 0 € | Comparaison prévue en mars avec un test PMax plafonné, après 30 conversions |

### 3.3 Meta Ads (priorité 2, sous conditions)
- **Préalables** : compte Business créé avec l'accord du gérant, Pixel et CAPI posés (P2-1), domaine vérifié, événement Purchase dédupliqué (`event_id = order-<id>`).
- **S8–S12 (dès le 18/01) : reciblage, 5 €/j**. Visiteurs de fiches produit (7 et 30 jours) et paniers abandonnés (7 jours). Message : délai réel de 7 jours ouvrés, « dès 1 pièce », maquette en direct, lien d'équipe. Pas de code promo inventé : l'e-mail de relance −10 % existe déjà et suffit.
- **S10–S12 (dès le 01/02) : test de prospection, 10 €/j**. Audience Advantage+ avec signaux gérants de restaurants et commerces, dirigeants de PME, bureaux de clubs et associations. Créations : vidéo du configurateur (logo posé en direct), avant/après maquette → vêtement imprimé (vraies pièces de l'atelier, jamais de fausse photo client), lien d'équipe.
- **Seuils** : reciblage CPA ≤ 50 € après 14 jours, sinon pause. Prospection : arrêt si 0 commande après 150 € ou si CPA > 80 € après 14 jours.

### 3.4 TikTok Ads (priorité 3)
Aucune dépense sur 90 jours. La spécification du pixel est prête (P2-2). Le test sera proposé en mars–avril, à 10 €/j pendant 21 jours (210 €), auprès des particuliers et des clubs (événements d'été), avec des formats verticaux « je crée ma tenue en 1 minute » et des coulisses de l'atelier. Il sera soumis à validation à ce moment-là.

### 3.5 Objectifs chiffrés et seuils d'arrêt
| Niveau | Objectif | Seuil d'arrêt (décision autorisée sans validation : baisse ou pause) |
|---|---|---|
| Compte, décembre | ≥ 5 commandes payées attribuées ; mesure fiable (écart Google Ads / Shopify < 20 %) | **Dépense cumulée ≥ 400 € sans aucune commande payée** → tout en pause sauf la marque, revue de la mesure et de l'offre |
| Compte, janvier | ROAS ≥ 2,2 (équilibre), CPA ≤ 50 € | ROAS sur 14 jours < 1,0 → budget −50 % ; < 2,2 au 31/01 → pas de hausse en février |
| Compte, février | ROAS ≥ 3, CPA ≤ 40 € | ROAS sur 30 jours < 2,2 → retour au budget de décembre |
| Groupe Search | ≥ 1 commande ou 2 devis par tranche de 60 € | 60 € dépensés sans commande ni devis → pause du groupe |
| Mot-clé | — | 30 € sans conversion ou taux de clic < 2 % après 300 impressions → pause ou correspondance plus stricte |
| Famille Shopping | ROAS ≥ 2,2 | Dépense ≥ 2 × CPA max de la famille sans commande → enchère −50 %, puis exclusion |
| Meta | voir 3.3 | voir 3.3 |

Les hausses de budget restent soumises à la validation écrite du gérant, même quand le compte est rentable.

---

## 4. Plan Noël et janvier

| Date | Action |
|---|---|
| 23 → 29/11 | Pré-requis P0. Validation du budget de décembre. Préparation des annonces (section 6). |
| Lun. 30/11 | Si l'achat test est visible : lancement Marque + Search pro + Shopping. Éléments « Noël » actifs : « Cadeaux d'équipe à votre logo », « Pour Noël : avant le 10/12 ». |
| 30/11 → 10/12 | Message « Noël pro » : tenues de service des fêtes, marchés de Noël, cadeaux d'équipe (sweats, softshells, casquettes). **Pas de Search « cadeau particulier »** (CPA max ≤ 6 €). Shopping reste ouvert aux particuliers avec des enchères basses. |
| **Jeu. 10/12, 14 h** | Fin automatique (date de fin programmée) de tous les titres et descriptions « Noël / avant le 10/12 ». Le site fait foi : si la date affichée change, on aligne. Pas de mention de l'express dans les annonces : le site n'affiche pas de date limite express. |
| 11 → 20/12 | Budget Search pro réduit à 12 €/j. Message « Commandez maintenant, prêt pour la reprise de janvier ». Shopping −30 % sur sweats et t-shirts cadeaux. |
| 21/12 → 03/01 | Creux (pros fermés) : 10 €/j au total (marque + 2 meilleurs groupes + Shopping sur les meilleures familles). Mise en ligne en pause des annonces « janvier ». |
| 15/12 | Demande à l'informaticien : page ou bandeau « Nouvelles tenues 2027 » (la saison `janvier` du site démarre le 26/12, c'est cohérent). |
| Lun. 04/01 | Lancement « Janvier B2B » : nouvelles recrues, renouvellement des tenues, HV et vestes (hiver), sweats. 30 €/j, puis +5 €/j par semaine **si** ROAS 14 jours ≥ 2,2 (hausse à valider). |
| 05/01 | Préparation du printemps (6 semaines avant le 16/02) : annonces « terrasses », demande de landing restauration printemps, propositions de créations Meta. |
| 18/01 | Meta reciblage si le pixel est en place. |
| Février | Saint-Valentin : **pas de payant** (particulier, marge trop faible). Lancement « Restauration printemps » le 09/02 dans la campagne Search pro. |

---

## 5. Mots-clés et négatifs de départ

### 5.1 Campagne « Search – Pro métiers × produit » (expression exacte et expression, pas de requête large au lancement)
| Groupe | Mots-clés | Page d'atterrissage | CPC max |
|---|---|---|---|
| Tenue de travail logo | "vêtement de travail personnalisé", "tenue de travail personnalisée", "vêtements professionnels personnalisés", "vêtement entreprise logo", [tenue professionnelle personnalisée] | `/` (accueil) | 1,50 € |
| Polos | "polo personnalisé logo", "polo entreprise logo", "polo de travail personnalisé", [polo personnalisé] | `/vetements/polos-personnalises` | 1,20 € |
| Restauration | "tenue restaurant personnalisée", "polo restaurant logo", "tablier personnalisé restaurant", "tablier logo", "tablier personnalisé" | `/metiers/restauration` (tablier → `/vetements/tabliers-personnalises`) | 1,20 € |
| Haute visibilité | "gilet haute visibilité personnalisé", "gilet jaune personnalisé logo", "vêtement haute visibilité logo", "gilet de sécurité personnalisé" | `/vetements/haute-visibilite-personnalisee` | 1,80 € |
| Hiver (sweats, vestes) | "sweat personnalisé entreprise", "sweat logo entreprise", "softshell personnalisée", "polaire personnalisée logo", "veste personnalisée entreprise" | `/vetements/sweats-personnalises`, `/vetements/vestes-personnalisees` | 1,50 € |
| Clubs et associations | "t-shirt association personnalisé", "t-shirt club personnalisé", "tenue club personnalisée", "t-shirt personnalisé logo entreprise" | `/clubs-associations`, `/vetements/t-shirts-personnalises` | 1,00 € |
| Casquettes | "casquette personnalisée logo", "casquette logo entreprise", "casquette personnalisée" | `/vetements/casquettes-personnalisees` | 0,90 € |
| Local Nord + Belgique (zone : 59, 62, Hainaut, Bruxelles) | "vêtement personnalisé lille", "t-shirt personnalisé lille", "vêtement de travail lille", "textile personnalisé roubaix", "t-shirt personnalisé tournai", "vêtement personnalisé bruxelles" | `/vetements-personnalises/<ville>` | 1,20 € |
| *Noël (jusqu'au 10/12)* | "cadeau salarié personnalisé", "cadeau d'équipe personnalisé", "sweat personnalisé logo noël" | `/vetements/sweats-personnalises` | 1,00 € |
| *Janvier (dès le 04/01)* | "tenue nouvel employé", "vêtement de travail logo", "uniforme entreprise personnalisé" | `/` ou landing janvier (P1-5) | 1,50 € |

À surveiller avant d'ajouter : « flocage » (souvent utilisé pour tout type de marquage, à tester en expression dans le groupe Tenue si les termes de recherche le confirment), « marquage textile », « sérigraphie » (gros volumes, intention compatible ou non).

### 5.2 Négatifs permanents (liste partagée, niveau compte)
- **Prestation non proposée** : broderie, brodé, brodée, brodés, broder, sublimation, maillot, maillots, bonnet, sac, tote bag, mug, chaussures, veste de cuisine, veste de cuisinier, blouse médicale, tunique médicale, enfant, enfants, bébé, chien
- **Prix et gratuité** : gratuit, gratuite, 1 €, 1 euro, pas cher 1, échantillon gratuit
- **Emploi** : emploi, recrutement, offre d'emploi, stage, alternance, salaire, CDI, intérim
- **Faire soi-même / matériel** : tuto, tutoriel, DIY, faire soi-même, machine, presse à chaud, imprimante, transfert dtf, film dtf, encre, flex, vinyle, cricut
- **Logo et images** : créer un logo, logo gratuit, logo maker, png, image, dessin, coloriage, modèle pdf
- **Occasion et revente** : occasion, vinted, leboncoin, location
- **Marques et concurrents** (on n'achète pas leur nom) : nike, adidas, lacoste, vistaprint, spreadshirt, tunetoo, teezily, amazon
- **Phase 1 seulement** : grossiste (le programme revendeur −10 % passe par la prospection directe, pas par le payant)

Les négatifs sont revus chaque semaine à partir du rapport des termes de recherche, et chaque ajout est consigné dans le journal.

### 5.3 Shopping : négatifs spécifiques
Mêmes négatifs, plus : « vierge » et « sans logo » (textile vierge : marge faible, pas de fiche dans le flux), « gros volume 1000 », ainsi que les termes de recherche de particuliers à 1 pièce qui coûtent sans convertir (à constater sur les données, pas a priori).

---

## 6. Structure de campagnes et premières annonces

### 6.1 Arborescence
```
Compte 251-489-2270
├─ Search – Marque alwaan            [existante, en pause] 2 €/j
│   └─ Marque                        [alwaan] "alwaan fr"
├─ Search – Pro métiers × produit    15 €/j (déc.) → voir plan
│   ├─ Tenue de travail logo
│   ├─ Polos
│   ├─ Restauration (polos, tabliers)
│   ├─ Haute visibilité
│   ├─ Hiver (sweats, vestes)
│   ├─ Clubs et associations
│   ├─ Casquettes
│   ├─ Local Nord + Belgique         (ciblage géo restreint au niveau du groupe via campagne dédiée si besoin)
│   ├─ Noël pro                      (fin 10/12 14 h)
│   └─ Janvier B2B                   (début 04/01)
└─ Shopping standard – Catalogue     8 €/j, priorité moyenne
    ├─ Casquettes                    0,30 €
    ├─ Polos                         0,40 €
    ├─ T-shirts                      0,25 €
    ├─ Sweats                        0,40 €
    ├─ Vestes et polaires            0,50 €
    ├─ Haute visibilité              0,50 €
    ├─ Tabliers                      0,30 €
    └─ Chemises                      0,40 €
```
Extensions : liens annexes (Polos, Haute visibilité, Clubs et associations, Devis, Lien d'équipe), accroches (« Dès 1 pièce », « Maquette en direct », « Atelier dans le Nord », « Devis PDF immédiat »), extraits structurés (Produits : Polos, T-shirts, Sweats, Vestes, Haute visibilité, Tabliers, Casquettes, Chemises), prix (Casquette Mercury 5,50 € HT, Polo Pegaso + logo cœur 13,60 € HT, T-shirt Dogo + logo cœur 8,78 € HT, prix à l'unité, vérifiables sur le site). Pas d'extension d'avis tant qu'il n'y a aucun avis réel.

### 6.2 Annonces responsives (longueurs vérifiées : titres ≤ 30, descriptions ≤ 90 caractères)
**Titres communs (à épingler : aucun)**
1. Vêtements pro à votre logo
2. Dès 1 pièce, sans minimum
3. Maquette en direct sur le site
4. Expédié en 7 jours ouvrés
5. Atelier dans le Nord
6. Impression DTF toutes couleurs
7. Devis PDF en 1 clic
8. Livraison offerte dès 150 € HT
9. Marquage -40 % dès 30 pièces
10. Chacun choisit sa taille
11. France et Belgique
12. Atelier joignable sur WhatsApp

**Titres par groupe**
- Polos : « Polo personnalisé à votre logo », « Polo + logo cœur 13,60 € HT », « Polos resto et accueil »
- Haute visibilité : « Gilet haute visibilité + logo », « Conforme EN ISO 20471 », « Bandes réfléchissantes libres », « Gilets HV pour BTP, logistique »
- Restauration : « Tenues de restaurant à logo », « Tablier personnalisé à logo », « Polos, tabliers et casquettes »
- Casquettes : « Casquette + logo 5,50 € HT », « Casquette à votre logo », « Dès 100 pièces : 3 € HT/pce »
- Hiver : « Sweat personnalisé à logo », « Softshell et polaire à logo », « Tenues d'hiver pour l'équipe »
- Clubs : « T-shirt personnalisé à logo », « T-shirts pour clubs et assos », « Boutique club en ligne »
- Noël (fin 10/12, 14 h) : « Cadeaux d'équipe à votre logo », « Pour Noël : avant le 10/12 »
- Janvier : « Nouvelles tenues pour 2027 », « Équipez vos nouveaux arrivants »
- Marque : « alwaan : site officiel », « alwaan, textile à votre logo »

**Descriptions**
1. Posez votre logo, validez la maquette en direct et commandez dès 1 pièce.
2. Imprimé en DTF dans notre atelier du Nord. Expédié en 7 jours ouvrés. France et Belgique.
3. Remise marquage automatique : -15 % dès 5 pièces, -20 % dès 10, -40 % dès 30 au même logo.
4. Envoyez un lien d'équipe : chacun choisit sa taille, vous validez une seule commande.
5. Gilets et vestes EN ISO 20471 : logo placé sans recouvrir les bandes réfléchissantes.
6. Polos, tabliers et casquettes à votre logo pour la salle et la cuisine. Dès 1 pièce.
7. Livraison offerte dès 150 € HT. Une question ? Notre atelier répond sur WhatsApp.
8. Devis PDF immédiat depuis le panier, paiement par carte ou par virement pour les pros.
9. Casquette Mercury à votre logo : 5,50 € HT l'unité, 4,80 € dès 10, 4 € dès 30 pièces.
10. Pas de broderie : une impression DTF nette, toutes couleurs, dégradés compris.
11. *(Noël, fin 10/12)* Noël : commandez avant le 10 décembre pour être livré au plus tard le 24, selon le site.
12. *(Janvier)* Nouvelle année, nouvelles tenues : équipez vos équipes dès 1 pièce, maquette en direct.

Interdits rappelés : « livraison 48 h », « livré en 3 jours », « brodé », faux avis, « n° 1 », fausse rareté, fausse réduction, nom de concurrent, code promo inventé. Le gilet HV peut dire « conforme EN ISO 20471 » parce que la fiche Roly l'indique : garder la preuve de conformité du fabricant.

---

## 7. Plan d'action chiffré (S1 à S12)

### 7.1 Actions et budgets proposés (identiques pour les 3 scénarios ; le prudent applique ses seuils d'arrêt)
| Sem. | Dates | Actions | Canal | Budget proposé |
|---|---|---|---|---|
| S0 | 23/11 → 29/11 | P0 mesure serveur, achat test, GA4, corrections du flux, validation du budget | — | 0 € |
| S1 | 30/11 → 06/12 | Lancement Marque (2 €/j), Search pro (15 €/j), Shopping (8 €/j) ; Noël pro ; 1er relevé des termes de recherche à J+3 | Google | 175 € |
| S2 | 07/12 → 13/12 | Rush jusqu'au 10/12 14 h, fin automatique des éléments Noël ; 1ers négatifs ; pause des groupes à 60 € sans signal | Google | 175 € |
| S3 | 14/12 → 20/12 | Search pro 12 €/j, message « prêt pour janvier » ; Shopping −30 % sur les familles cadeaux | Google | 140 € |
| S4 | 21/12 → 27/12 | Creux : 10 €/j (marque + 2 meilleurs groupes + meilleures familles Shopping) | Google | 70 € |
| S5 | 28/12 → 03/01 | Creux, mise en ligne en pause des annonces janvier ; bilan de décembre dans le journal | Google | 70 € |
| S6 | 04/01 → 10/01 | Lancement Janvier B2B, 30 €/j ; HV, vestes et sweats mis en avant | Google | 210 € |
| S7 | 11/01 → 17/01 | 35 €/j **si** ROAS 14 j ≥ 2,2 (hausse à valider) ; préparation printemps | Google | 245 € |
| S8 | 18/01 → 24/01 | Google 35 €/j ; Meta reciblage 5 €/j (si pixel + CAPI) | Google + Meta | 280 € |
| S9 | 25/01 → 31/01 | Google 40 €/j ; Meta reciblage ; bilan de janvier | Google + Meta | 315 € |
| S10 | 01/02 → 07/02 | Google 40 €/j ; Meta reciblage 5 €/j + prospection test 10 €/j | Google + Meta | 385 € |
| S11 | 08/02 → 14/02 | Google 45 €/j ; lancement « Restauration printemps » ; Meta | Google + Meta | 420 € |
| S12 | 15/02 → 21/02 | Google 45 €/j ; Meta ; bilan 90 jours, décision PMax / TikTok | Google + Meta | 420 € |
| **Total** | | | | **2 905 €** (déc. 630 €, janv. 1 050 €, févr. 1 225 €) |

Dans le scénario prudent, les seuils d'arrêt se déclenchent fin S7 : Google descend à 15 €/j (marque + meilleurs groupes), Meta est limité au reciblage, sans prospection. Le budget total tombe alors à 1 785 €.

### 7.2 Hypothèses des scénarios
| Hypothèse | Prudent | Médian | Ambitieux | Fourchette marché (France, textile personnalisé / vêtement pro) |
|---|---|---|---|---|
| CPC moyen Google (Search + Shopping mélangés) | 1,20 € | 0,90 € | 0,70 € | Search non-marque « vêtement personnalisé / de travail » : environ 0,80 à 2,50 € ; Shopping vêtement : environ 0,25 à 0,80 € ; marque : < 0,30 € |
| Taux de clic mélangé (impressions → clics) | 2,5 % | 3,5 % | 4,5 % | Search 4 à 7 %, Shopping 0,8 à 1,5 % |
| Taux de conversion clic → commande payée (base) | 0,8 % | 1,5 % | 2,5 % | E-commerce France : environ 1,5 à 3 % ; site neuf sans avis : bas de fourchette ; B2B Search très ciblé : 2 à 4 % |
| Panier moyen HT (base) | 75 € | 110 € | 150 € | Particuliers 25 à 40 € ; pros et clubs 150 à 350 € (paniers types §2.2) |
| Taux de marge sur coûts variables | 45 % | 45 % | 45 % | Calcul §2.2 |
| Meta reciblage : CPC / conversion | 0,60 € / 2 % | 0,45 € / 3 % | 0,35 € / 4,5 % | CPC lien France environ 0,30 à 0,90 € ; reciblage 2 à 5 % |
| Meta prospection : CPC / conversion | — (coupée) | 0,65 € / 0,8 % | 0,45 € / 1,3 % | Prospection 0,4 à 1,5 % |

**Modulation hebdomadaire (tous scénarios)** : taux de conversion × 0,8 en S1 (site neuf), × 1,0 en S2 (rush avant le 10/12), × 0,7 en S3, × 0,4 et × 0,5 en S4–S5 (fêtes), × 1,0 à 1,1 en janvier (pic B2B), × 1,0 en février. Panier × 0,85 en S1–S2 (plus de particuliers), × 1,1 en janvier. En S8–S12, le CPC moyen et le taux de conversion du tableau bougent uniquement à cause du mélange avec Meta (reciblage moins cher et plus convertissant, prospection moins convertissante). Les hypothèses Google restent constantes.

**Sources et limites** : ces fourchettes viennent de références publiques sur la publicité Search et Shopping pour l'habillement et le commerce de détail (études annuelles de benchmarks Google Ads de type WordStream/LocaliQ, chiffres e-commerce France de la FEVAD et de Contentsquare) et de l'expérience de comptes comparables. Elles n'ont pas été vérifiées en ligne pendant ce passage. **À confirmer avant le lancement avec le Planificateur de mots-clés du compte 251-489-2270** (CPC « haut de page » par mot-clé de la section 5) : si les CPC estimés dépassent 1,50 € en moyenne, on bascule vers les hypothèses du scénario prudent et le budget de décembre ne bouge pas.

### 7.3 Estimations semaine par semaine
Lecture : « Cmd » = commandes payées attribuées (valeur moyenne, d'où les décimales) ; marge brute = CA HT × 45 % ; marge nette après pub = marge brute − dépense.

#### Scénario prudent

| Sem. | Budget | Impr. | Clics | CPC moy. | Tx conv. | Cmd | Panier HT | CA HT | Marge brute | Dépense | CPA | ROAS | Marge nette après pub |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | 175 € | 5 833 | 146 | 1,20 € | 0,64 % | 0,9 | 64 € | 60 € | 27 € | 175 € | 187 € | 0,3 | -148 € |
| S2 | 175 € | 5 833 | 146 | 1,20 € | 0,80 % | 1,2 | 64 € | 74 € | 33 € | 175 € | 150 € | 0,4 | -142 € |
| S3 | 140 € | 4 667 | 117 | 1,20 € | 0,56 % | 0,7 | 75 € | 49 € | 22 € | 140 € | 214 € | 0,3 | -118 € |
| S4 | 70 € | 2 333 | 58 | 1,20 € | 0,32 % | 0,2 | 68 € | 13 € | 6 € | 70 € | 375 € | 0,2 | -64 € |
| S5 | 70 € | 2 333 | 58 | 1,20 € | 0,40 % | 0,2 | 75 € | 18 € | 8 € | 70 € | 300 € | 0,2 | -62 € |
| S6 | 210 € | 7 000 | 175 | 1,20 € | 0,80 % | 1,4 | 82 € | 116 € | 52 € | 210 € | 150 € | 0,6 | -158 € |
| S7 | 245 € | 8 167 | 204 | 1,20 € | 0,88 % | 1,8 | 82 € | 148 € | 67 € | 245 € | 136 € | 0,6 | -178 € |
| S8 | 140 € | 5 833 | 146 | 0,96 € | 1,33 % | 1,9 | 82 € | 160 € | 72 € | 140 € | 72 € | 1,1 | -68 € |
| S9 | 140 € | 5 833 | 146 | 0,96 € | 1,33 % | 1,9 | 82 € | 160 € | 72 € | 140 € | 72 € | 1,1 | -68 € |
| S10 | 140 € | 5 833 | 146 | 0,96 € | 1,28 % | 1,9 | 75 € | 140 € | 63 € | 140 € | 75 € | 1,0 | -77 € |
| S11 | 140 € | 5 833 | 146 | 0,96 € | 1,28 % | 1,9 | 75 € | 140 € | 63 € | 140 € | 75 € | 1,0 | -77 € |
| S12 | 140 € | 5 833 | 146 | 0,96 € | 1,28 % | 1,9 | 75 € | 140 € | 63 € | 140 € | 75 € | 1,0 | -77 € |

| Mois | Dépense | Impr. | Clics | Cmd | CA HT | Marge brute | CPA | ROAS | Marge nette après pub |
|---|---|---|---|---|---|---|---|---|---|
| Décembre | 630 € | 21 000 | 525 | 3,2 | 213 € | 96 € | 199 € | 0,3 | -534 € |
| Janvier | 735 € | 26 833 | 671 | 7,1 | 583 € | 262 € | 104 € | 0,8 | -473 € |
| Février | 420 € | 17 500 | 438 | 5,6 | 420 € | 189 € | 75 € | 1,0 | -231 € |
| **Total 12 sem.** | **1785 €** | 65 333 | 1633 | **15,8** | **1 216 €** | 547 € | **113 €** | **0,7** | **-1 238 €** |

#### Scénario médian

| Sem. | Budget | Impr. | Clics | CPC moy. | Tx conv. | Cmd | Panier HT | CA HT | Marge brute | Dépense | CPA | ROAS | Marge nette après pub |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | 175 € | 5 556 | 194 | 0,90 € | 1,20 % | 2,3 | 94 € | 218 € | 98 € | 175 € | 75 € | 1,2 | -77 € |
| S2 | 175 € | 5 556 | 194 | 0,90 € | 1,50 % | 2,9 | 94 € | 273 € | 123 € | 175 € | 60 € | 1,6 | -52 € |
| S3 | 140 € | 4 444 | 156 | 0,90 € | 1,05 % | 1,6 | 110 € | 180 € | 81 € | 140 € | 86 € | 1,3 | -59 € |
| S4 | 70 € | 2 222 | 78 | 0,90 € | 0,60 % | 0,5 | 99 € | 46 € | 21 € | 70 € | 150 € | 0,7 | -49 € |
| S5 | 70 € | 2 222 | 78 | 0,90 € | 0,75 % | 0,6 | 110 € | 64 € | 29 € | 70 € | 120 € | 0,9 | -41 € |
| S6 | 210 € | 6 667 | 233 | 0,90 € | 1,50 % | 3,5 | 121 € | 424 € | 191 € | 210 € | 60 € | 2,0 | -19 € |
| S7 | 245 € | 7 778 | 272 | 0,90 € | 1,65 % | 4,5 | 121 € | 543 € | 245 € | 245 € | 55 € | 2,2 | 0 € |
| S8 | 280 € | 11 667 | 350 | 0,80 € | 1,95 % | 6,8 | 121 € | 826 € | 372 € | 280 € | 41 € | 2,9 | +92 € |
| S9 | 315 € | 12 778 | 389 | 0,81 € | 1,92 % | 7,5 | 121 € | 903 € | 407 € | 315 € | 42 € | 2,9 | +92 € |
| S10 | 385 € | 23 547 | 497 | 0,78 € | 1,58 % | 7,9 | 110 € | 865 € | 389 € | 385 € | 49 € | 2,2 | +4 € |
| S11 | 420 € | 24 658 | 535 | 0,78 € | 1,58 % | 8,4 | 110 € | 929 € | 418 € | 420 € | 50 € | 2,2 | -2 € |
| S12 | 420 € | 24 658 | 535 | 0,78 € | 1,58 % | 8,4 | 110 € | 929 € | 418 € | 420 € | 50 € | 2,2 | -2 € |

| Mois | Dépense | Impr. | Clics | Cmd | CA HT | Marge brute | CPA | ROAS | Marge nette après pub |
|---|---|---|---|---|---|---|---|---|---|
| Décembre | 630 € | 20 000 | 700 | 7,9 | 781 € | 351 € | 79 € | 1,2 | -279 € |
| Janvier | 1050 € | 38 889 | 1244 | 22,3 | 2 696 € | 1 213 € | 47 € | 2,6 | +163 € |
| Février | 1225 € | 72 863 | 1568 | 24,8 | 2 723 € | 1 225 € | 49 € | 2,2 | 0 € |
| **Total 12 sem.** | **2905 €** | 131 752 | 3512 | **55,0** | **6 200 €** | 2 790 € | **53 €** | **2,1** | **-115 €** |

#### Scénario ambitieux

| Sem. | Budget | Impr. | Clics | CPC moy. | Tx conv. | Cmd | Panier HT | CA HT | Marge brute | Dépense | CPA | ROAS | Marge nette après pub |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | 175 € | 5 556 | 250 | 0,70 € | 2,00 % | 5,0 | 128 € | 638 € | 287 € | 175 € | 35 € | 3,6 | +112 € |
| S2 | 175 € | 5 556 | 250 | 0,70 € | 2,50 % | 6,3 | 128 € | 797 € | 359 € | 175 € | 28 € | 4,6 | +184 € |
| S3 | 140 € | 4 444 | 200 | 0,70 € | 1,75 % | 3,5 | 150 € | 525 € | 236 € | 140 € | 40 € | 3,8 | +96 € |
| S4 | 70 € | 2 222 | 100 | 0,70 € | 1,00 % | 1,0 | 135 € | 135 € | 61 € | 70 € | 70 € | 1,9 | -9 € |
| S5 | 70 € | 2 222 | 100 | 0,70 € | 1,25 % | 1,2 | 150 € | 188 € | 84 € | 70 € | 56 € | 2,7 | +14 € |
| S6 | 210 € | 6 667 | 300 | 0,70 € | 2,50 % | 7,5 | 165 € | 1 238 € | 557 € | 210 € | 28 € | 5,9 | +347 € |
| S7 | 245 € | 7 778 | 350 | 0,70 € | 2,75 % | 9,6 | 165 € | 1 588 € | 715 € | 245 € | 25 € | 6,5 | +470 € |
| S8 | 280 € | 14 444 | 450 | 0,62 € | 3,14 % | 14,1 | 165 € | 2 331 € | 1 049 € | 280 € | 20 € | 8,3 | +769 € |
| S9 | 315 € | 15 556 | 500 | 0,63 € | 3,10 % | 15,5 | 165 € | 2 558 € | 1 151 € | 315 € | 20 € | 8,1 | +836 € |
| S10 | 385 € | 32 840 | 656 | 0,59 € | 2,52 % | 16,5 | 150 € | 2 478 € | 1 115 € | 385 € | 23 € | 6,4 | +730 € |
| S11 | 420 € | 33 951 | 706 | 0,60 € | 2,52 % | 17,8 | 150 € | 2 666 € | 1 200 € | 420 € | 24 € | 6,3 | +780 € |
| S12 | 420 € | 33 951 | 706 | 0,60 € | 2,52 % | 17,8 | 150 € | 2 666 € | 1 200 € | 420 € | 24 € | 6,3 | +780 € |

| Mois | Dépense | Impr. | Clics | Cmd | CA HT | Marge brute | CPA | ROAS | Marge nette après pub |
|---|---|---|---|---|---|---|---|---|---|
| Décembre | 630 € | 20 000 | 900 | 17,0 | 2 282 € | 1 027 € | 37 € | 3,6 | +397 € |
| Janvier | 1050 € | 44 444 | 1600 | 46,8 | 7 714 € | 3 471 € | 22 € | 7,3 | +2 421 € |
| Février | 1225 € | 100 741 | 2067 | 52,1 | 7 810 € | 3 514 € | 24 € | 6,4 | +2 290 € |
| **Total 12 sem.** | **2905 €** | 165 185 | 4567 | **115,8** | **17 806 €** | 8 013 € | **25 €** | **6,1** | **+5 108 €** |
### 7.4 Synthèse par mois
| | Prudent (seuils déclenchés) | Médian | Ambitieux |
|---|---|---|---|
| Décembre : dépense / commandes / CA HT / marge nette | 630 € / 3 / 213 € / −534 € | 630 € / 8 / 781 € / −279 € | 630 € / 17 / 2 282 € / +397 € |
| Janvier | 735 € / 7 / 583 € / −473 € | 1 050 € / 22 / 2 696 € / +163 € | 1 050 € / 47 / 7 714 € / +2 421 € |
| Février | 420 € / 6 / 420 € / −231 € | 1 225 € / 25 / 2 723 € / 0 € | 1 225 € / 52 / 7 810 € / +2 290 € |
| **12 semaines** | **1 785 € / 16 / 1 216 € / −1 238 €** | **2 905 € / 55 / 6 200 € / −115 €** | **2 905 € / 116 / 17 806 € / +5 108 €** |
| CPA / ROAS sur 12 semaines | 113 € / 0,7 | 53 € / 2,1 | 25 € / 6,1 |

**Lecture**
- Décembre est un **mois d'apprentissage** : site neuf, aucun avis, fêtes. Il est déficitaire dans deux scénarios sur trois. On l'accepte pour obtenir des termes de recherche, des premières commandes et une mesure validée avant le pic de janvier. La perte maximale de décembre est bornée à 630 €, et elle s'arrête plus tôt si le seuil « 400 € sans commande » est atteint.
- **Le scénario médian devient rentable en janvier**, puis plafonne en février : la prospection Meta dilue le ROAS. La décision de continuer Meta se prend sur les chiffres de S10–S11.
- **Le scénario prudent ne doit pas durer** : les seuils coupent le budget de 40 % dès S8. S'il se confirme fin janvier (ROAS < 1), on garde la marque et Shopping seulement, et la priorité passe à l'offre et à la page (taux de conversion) plutôt qu'au trafic.
- **Si l'ambitieux se confirme** (ROAS 14 j ≥ 4 en janvier), une hausse progressive de +20 % par semaine sera proposée **à validation**, avec passage aux enchères au ROAS cible après 30 conversions.
- Ce modèle ne compte pas les réachats B2B ni les ventes venues du SEO ou des e-mails grâce aux visites payées. Le vrai retour est probablement un peu meilleur, mais on ne pilote que sur ce qui est mesuré.

---

## 8. Demandes techniques pour l'informaticien

### P0 : avant toute dépense
1. **Conversion Achat côté serveur vers Google Ads.** Depuis le webhook de commande Shopify (`src/app/api/shopify/webhook/route.ts`), envoyer à Google Ads une conversion de clic avec `gclid`/`gbraid`/`wbraid` (déjà dans les attributs de commande quand il y a consentement publicité), `conversion_date_time` = date de paiement, `conversion_value` = sous-total HT net des remises, hors port (`current_subtotal_price` comme pour GA4), `order_id` = numéro de commande (déduplication).
   - Méthode au choix : API Google Ads `UploadClickConversions` (compte 251-489-2270, sous le compte administrateur), ou import planifié de conversions hors ligne depuis un fichier HTTPS ou une Google Sheet alimentée par le webhook.
   - Créer l'action « Achat (serveur) » (import, clics), **principale**. Passer « Achat » (pixel Shopify, wv8oCPSexL0dENzCzqBF) en **secondaire** pour ne pas compter deux fois.
   - Inclure les **commandes payées par virement** (webhook `orders/paid` quand le virement est reçu) et le paiement de secours Stripe.
   - Ne jamais envoyer les commandes de test ni les commandes annulées. Si une commande est annulée après envoi, envoyer un ajustement de rétractation (`RETRACTION`).
2. **GA4** : créer la propriété, renseigner `NEXT_PUBLIC_GA4_ID`, `GA4_ID`, `GA4_API_SECRET`. Vérifier en DebugView `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead` et `purchase` (serveur). Lier GA4 à Google Ads (audiences et analyse, pas de double import de l'achat).
3. **Consentement sur le checkout Shopify** : activer la bannière de confidentialité Shopify (Paramètres > Confidentialité des clients) pour la France et la Belgique, sinon le pixel « Marketing » ne se déclenche pas. Vérifier que le pixel « Google Ads alwaan » est bien « Connecté ».
4. **Paiement de secours Stripe** (`src/app/merci/Conversion.tsx`) : ajouter `value` (HT) et `currency` à la conversion, ou s'appuyer uniquement sur l'envoi serveur (1).
5. **Achat test** : passer une vraie commande de faible montant après clic sur une annonce de test (outil « Aperçu et diagnostic des annonces » ou URL avec `gclid` de test), vérifier sa présence dans Google Ads > Conversions (délai jusqu'à 24 h), puis rembourser et envoyer la rétractation. Signaler le résultat dans le journal.

### P1 : avant la montée en charge de janvier
1. **Micro-conversions** (secondaires dans Google Ads, via GA4) : `generate_lead` à l'envoi du formulaire `/devis` (`src/app/devis/QuoteForm.tsx`) ; nouvel événement `team_link_created` à la création d'un lien d'équipe ; `shop_created` à la création d'une boutique club ; `whatsapp_click` sur le lien WhatsApp. Aucune donnée personnelle dans les paramètres.
2. **Flux Merchant** (`/feeds/google.xml`) :
   - `custom_label_2` = marge : haute pour casquettes, HV, vestes et sweats ; moyenne pour polos, tabliers et chemises ; basse pour t-shirts Atomic et Fox ;
   - `custom_label_3` = saison (`noel`, `janvier`, `printemps`, `ete`, `toute-annee`), alignée sur `seasons.ts` ;
   - `custom_label_4` = cible (pro / particulier / mixte) ;
   - `g:size` : une taille valide par article (ou une variante par taille) à la place de la plage « S-5XL » ;
   - images principales hébergées sur alwaan.fr ; si possible, une maquette avec logo d'exemple clairement présentée comme exemple.
3. **Concordance des prix** : sur `/produits/<slug>?couleur=<hex>`, les données structurées donnent `AggregateOffer lowPrice 14.40` alors que le flux indique 16,32 € TTC. Ajouter une `Offer` au prix TTC de l'article du flux (1 pièce, logo cœur) et vérifier que ce prix est visible au rendu de la page. Sinon, désactiver les « mises à jour automatiques des articles » pour le prix dans Merchant Center.
4. **Belgique** : confirmer que le flux est diffusé en BE et que le prix TTC affiché à un acheteur belge est bien celui du flux (le panier Shopify est créé avec `country: FR`).
5. **Pages d'atterrissage** : (a) « Nouvelles tenues 2027 / équiper les nouveaux arrivants » pour le 04/01 (ou un bandeau de saison sur `/` et `/metiers/*`) ; (b) « Restauration printemps / ouverture des terrasses » pour le 09/02 ; (c) « Cadeaux d'entreprise » (sweats, softshells, casquettes) pour novembre 2027. Chaque page reprend le délai réel, « dès 1 pièce » et le devis PDF.

### P2 : canaux suivants
1. **Meta** (après création du compte Business avec l'accord du gérant) : renseigner `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, `META_CAPI_TOKEN` ; vérifier le domaine alwaan.fr ; tester `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Lead` (navigateur, après consentement) et `Purchase` (CAPI, `event_id = order-<id>`) dans le Gestionnaire d'événements.
2. **TikTok, spécification du pixel** (aucune dépense avant qu'il soit en place) :
   - chargement **uniquement après accord publicité**, comme Meta dans `Tracking.tsx` ; variable `NEXT_PUBLIC_TIKTOK_PIXEL_ID` ;
   - capture de `ttclid` dans `captureAttribution()` (même règle de consentement que gclid et fbclid) et transmission dans les attributs de commande ;
   - événements navigateur : `ViewContent` (fiche produit, `content_id` = slug, `value` HT), `AddToCart` (valeur HT du panier ajouté), `InitiateCheckout`, `SubmitForm` (devis) ;
   - `Purchase` envoyé **côté serveur** (TikTok Events API) depuis le webhook : `event_id = order-<id>` pour la déduplication, `value` HT, `currency` EUR, `ttclid`, e-mail et téléphone hachés en SHA-256 uniquement si le gérant valide la base légale ; variables `TIKTOK_PIXEL_ID`, `TIKTOK_EVENTS_TOKEN` ;
   - ajout de TikTok à la liste des traceurs du bandeau cookies et de la politique de confidentialité.
3. **Suivi avancé des conversions Google** (e-mail haché) : seulement après validation du gérant et mise à jour de la politique de confidentialité.

---

## 9. Calendrier saisonnier (préparation 6 semaines avant)
| Saison (site) | Période | Préparation (J−6 semaines) | Familles poussées | Canal payant |
|---|---|---|---|---|
| Noël | 01/11 → 25/12 (commande avant le 10/12) | mi-septembre (2027) | Sweats, softshells, casquettes (cadeaux d'équipe) | Search pro « cadeau d'équipe », Shopping |
| Janvier | 26/12 → 15/02 | mi-novembre (cette année : en cours) | HV, vestes, polos manches longues, sweats | Search pro, Meta reciblage |
| Printemps (terrasses) | 16/02 → 15/06 | **05/01/2027** | Polos, tabliers, casquettes | Search restauration, Meta prospection restaurants |
| Été (événements) | 16/06 → 19/08 | début mai | T-shirts Atomic/Dogo, casquettes, visières | Shopping t-shirts/casquettes, test TikTok (clubs, événements) |
| Rentrée | 20/08 → 30/09 | début juillet | Polos, t-shirts, HV | Search clubs et associations, B2B |
| Halloween | octobre | fin août | T-shirts, tabliers | Pas de payant spécifique (petits paniers) |

Ruptures : vérifier chaque semaine `stockEpuise` dans les insights et exclure tout de suite du Shopping (et des annonces citant le produit) les articles en rupture.

---

## 10. Routine de pilotage
- **Chaque lundi** : dépense, commandes payées (serveur), CPA et ROAS par campagne et par famille, termes de recherche (négatifs), seuils d'arrêt, diagnostic Merchant, ruptures. Entrée datée dans le journal.
- **J+3 après le lancement** : premier relevé des termes de recherche et contrôle de la mesure (écart Google Ads / Shopify).
- **Chaque début de mois** : bilan marge générée − dépense, tests terminés, plan du mois suivant, budget soumis à validation.
- **Tests** : un seul changement par campagne, au moins 14 jours ou 30 conversions, critère de réussite écrit avant le lancement. Premier test prévu en février : page d'atterrissage métier contre page catégorie pour le groupe Restauration (critère : taux de conversion +30 % à CPC égal).
