# Audit pré-lancement Google Ads alwaan (23/11/2026)

Compte 251-489-2270. Objet : les campagnes créées **en pause** selon `docs/ads-campagnes-google.md`, avant l'activation prévue le **lundi 30/11**.
Aucune dépense, aucune activation, aucune modification du site ici : ce document liste ce qu'il faut régler, qui le fait et ce que ça rapporte.
Sources lues : `docs/ads-campagnes-google.md`, `docs/ads-journal.md`, `src/lib/adsConversions.ts`, `src/lib/track.ts`, `src/components/CookieBanner.tsx`, `src/app/devis/QuoteForm.tsx`, `src/components/Configurator.tsx`, flux `/feeds/google.xml` (relu le 23/11) et les 16 pages d'atterrissage des groupes (statut, temps de réponse, contenu).

---

## 0. Verdict

La structure est saine : intention forte, groupes serrés, Display et partenaires coupés, une seule conversion principale côté serveur, CPC manuel au démarrage. **Cinq points coûtent de l'argent ou faussent les décisions** si on lance tel quel :

1. **Environ 30 à 45 % des ventes payantes seront invisibles dans Google Ads.** Le gclid n'est transmis qu'avec l'accord publicité du bandeau (boutons « Tout refuser » et « Tout accepter » de même poids). On risque de couper des groupes rentables. Correctif gratuit : un suffixe UTM au niveau du compte, puisque les UTM sont transmis à la commande même sans consentement.
2. **Les mots-clés génériques à forte part de particuliers** ([polo personnalisé], « casquette personnalisée », « tablier personnalisé », « tablier logo », « sweat personnalisé logo noël ») vont manger le budget de 30 €/j en décembre, saison des cadeaux. Une commande de particulier rapporte 7 à 17 € de marge, contre 70 à 155 € pour une commande pro.
3. **Les automatismes de Google ne sont pas verrouillés** : recommandations appliquées automatiquement, ressources générées, expansion d'URL. Ils peuvent ajouter de la requête large, monter les budgets ou écrire des promesses fausses (« livraison rapide »).
4. **La règle Noël à 14 h est trop tardive.** Une règle peut s'exécuter jusqu'à environ 1 h après l'heure prévue, et l'atelier arrête de prendre les commandes « pour Noël » à 14 h. Il faut la programmer à 12 h. Les baisses de budget du 11/12 et du 21/12 ne sont pas automatisées : risque d'oubli.
5. **Plusieurs prix d'annonce ne sont pas visibles sur les pages d'atterrissage** : 13,60 € et 5,50 € n'apparaissent que dans le configurateur. Risque de refus et d'internautes déçus. **Le Shopping reste bloqué** tant que Merchant Center indique « compte pas encore configuré ».

Gain estimé des correctifs (section 7) : **ROAS de décembre d'environ 1,5 à environ 1,9**, **+100 à +150 € de marge nette** sur les 3 premières semaines. Surtout, on aura une mesure qui permet de décider juste en janvier.

---

## 1. Rappel économique (mis à jour avec le coût réel du marquage)

Le gérant a donné le coût réel du marquage : environ 2 € HT par zone (4 € HT pour cœur + dos), et 1,12 € HT tout compris pour la casquette Mercury. Les marges sont recalculées avec le script du premier passage, les autres hypothèses (port, emballage, paiement) étant inchangées.

| Panier type | CA HT | Marge | Taux | CPA d'équilibre | CPA max (35 %) |
|---|---|---|---|---|---|
| 10 polos Pegaso cœur + dos | 176 € | 72 € | 41 % | 72 € | 25 € |
| 20 t-shirts Dogo cœur + dos (asso) | 256 € | 110 € | 43 % | 110 € | 39 € |
| 50 t-shirts Atomic cœur (événement) | 270 € | 77 € | **29 %** | 77 € | 27 € |
| 10 sweats Clasica cœur + dos | 205 € | 86 € | 42 % | 86 € | 30 € |
| 10 gilets HV Beta cœur + dos | 310 € | 137 € | 44 % | 137 € | 48 € |
| 10 softshells cœur + dos | 349 € | 155 € | 45 % | 155 € | 54 € |
| 5 tabliers Benoit poche | 64 € | 25 € | 39 % | 25 € | 9 € |
| 10 / 30 / 100 casquettes Mercury | 58 / 130 / 300 € | 36 / 85 / 170 € | **63 / 65 / 57 %** | idem | 13 / 30 / 59 € |
| 1 polo ou 1 sweat (particulier) | 24 à 34 € | 7 à 14 € | 30 à 41 % | 7 à 14 € | 2 à 5 € |

- Taux de marge moyen : **environ 43 %** (45 % au premier passage). **ROAS d'équilibre ≈ 2,3. ROAS cible (35 %) ≈ 6,6.**
- **Casquettes** : meilleur taux de marge du catalogue. **T-shirts à gros volume** : faible, car à partir de 30 pièces le marquage vendu (2,40 € pour un cœur) couvre à peine son coût (2 €). C'est une information de prix pour le gérant, sans action pub immédiate.
- **CPC d'équilibre d'un groupe** = marge d'une commande type × taux de conversion. Avec un taux de 1,5 % : polos 1,08 €, HV 2,05 €, hiver environ 1,65 €, clubs 1,66 €, casquettes environ 0,75 €, restauration environ 0,90 €.

---

## 2. Audit critique

Légende de gravité : **A** = gaspillage ou décision faussée dès la 1re semaine ; **B** = manque à gagner ; **C** = confort ou hygiène.

### 2.1 Mesure
| # | Constat | Risque chiffré | Recommandation | Grav. |
|---|---|---|---|---|
| M1 | `attributionForCheckout()` n'envoie gclid, gbraid et wbraid qu'avec l'accord publicité. Le bandeau propose « Tout refuser » au même niveau que « Tout accepter » (conforme), ce qui donne en général 55 à 70 % d'acceptation. | **30 à 45 % des ventes issues d'annonces absentes de « Achat (serveur) »**. Le CPA affiché est surestimé de ×1,4 à ×1,8 : on couperait des groupes rentables. | **Suffixe d'URL finale (compte)** : `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}`. Les UTM sont déjà transmis à la commande sans consentement (pas d'identifiant personnel). L'informaticien ajoute dans les insights les ventes par `utm_campaign` / `utm_content`, avec ou sans gclid (demande I1). Pilotage : **ROAS réel = ventes UTM « google / cpc » ÷ dépense**, et Google Ads sert pour les tendances. Conformité du suivi UTM à confirmer par le gérant. | **A** |
| M2 | Le CSV d'import (`src/lib/adsConversions.ts`) n'exporte que `gclid`. gbraid et wbraid sont stockés mais pas envoyés. | Les clics iPhone venus des applications Google (Gmail, appli Google) arrivent souvent sans gclid, soit environ 5 à 15 % des clics mobiles perdus. | Ajouter les colonnes GBRAID / WBRAID si le Gestionnaire de données les accepte (à vérifier dans le modèle d'import), sinon envoyer ces lignes par l'API (I3). | B |
| M3 | Une commande annulée **après** son import disparaît du fichier, mais Google Ads garde la conversion. | Faible au lancement. | Importer un ajustement de rétractation, ou le faire à la main via Conversions > Importations (I8). | C |
| M4 | Import quotidien entre 3 h et 4 h, et Google rattache la conversion **à la date du clic**. | Les 2 à 3 derniers jours paraissent toujours sans vente : risque de couper trop tôt. | Règle de pilotage : **ne jamais juger sur les 3 derniers jours**. | B |
| M5 | Aucun test de bout en bout clic → commande → CSV → Google Ads. | Si la chaîne casse, on découvre au bout de 10 jours qu'aucune vente n'a été comptée. | Lundi : une vraie commande utile (par exemple des casquettes au logo de l'atelier) après un clic sur une annonce, avec les cookies acceptés. Contrôler le CSV le mardi et Google Ads le mardi ou le mercredi (W3). | **A** |
| M6 | Micro-conversions absentes : GA4 toujours non configuré. Le formulaire `/devis` ne déclenche aucun événement et n'enregistre pas l'origine (gclid/UTM). | Les leads B2B issus des annonces sont invisibles, alors que le B2B décide lentement. | Conversion secondaire « Demande de devis » (balise sur l'envoi du formulaire et sur le devis PDF du panier), origine jointe à la demande (I4). GA4 (I5). | B |
| M7 | Pixel Shopify « Achat » (secondaire) en attente de la bannière de confidentialité Shopify. | **Aucun effet sur les enchères** : l'action principale est côté serveur. | La bannière relève de la conformité, pas du ROI. Si elle n'est pas prête lundi : **déconnecter le pixel Shopify et lancer quand même** (décision du gérant). | C |
| M8 | Réglages de « Achat (serveur) » à vérifier : fenêtre de conversion, attribution, fuseau. | B2B payé par virement : paiement possiblement 1 à 3 semaines après le clic. | Fenêtre clic **90 jours**, attribution basée sur les données, fuseau du compte = Paris (sinon les règles horaires sont décalées). | B |

### 2.2 Enchères
| # | Constat | Risque | Recommandation | Grav. |
|---|---|---|---|---|
| E1 | CPC manuel au démarrage. | Bon choix sans historique : contrôle par groupe et par mot-clé, ajustements géo, horaires et appareils possibles. Le CPC optimisé (eCPC) n'existe plus en Search. | **Garder le CPC manuel tout décembre.** | — |
| E2 | Passage prévu en **« Maximiser les conversions »** après 15 conversions. | Cette stratégie compte toutes les ventes pareil, donc elle optimise vers les petites commandes de particuliers (marge 7 à 17 €) plutôt que vers les pros (70 à 155 €). Résultat : le ROI se dégrade. | Passer plutôt à **« Maximiser la valeur de conversion »** après **15 conversions serveur en 30 jours**, sans objectif au début. ROAS cible seulement à partir de 30 conversions en 30 jours, en démarrant à **250 %** (juste au-dessus de l'équilibre 2,3), puis +25 points tous les 14 jours si le volume tient. Avec la perte de mesure M1, 15 conversions mesurées ne seront probablement pas atteintes avant mi-janvier. | **A** (à décider avant janvier) |
| E3 | CPC max hérités du premier passage, comparés au CPC d'équilibre (taux de 1,5 %). | Tenue de travail 1,50 € (équilibre ≈ 1,20) ; Polos 1,20 € (≈ 1,08) ; Casquettes 0,90 € (≈ 0,75) ; Restauration 1,20 € (≈ 0,90). Ces groupes paient au-delà de l'équilibre tant que le taux de conversion n'atteint pas 2 %. HV 1,80 € (≈ 2,05) et Hiver 1,50 € (≈ 1,65) sont cohérents. Clubs 1,00 € (≈ 1,66) est sous-enchéri. | **Baisses** : Tenue 1,50 → 1,20 ; Polos 1,20 → 1,00 ; Restauration 1,20 → 1,00 ; Casquettes 0,90 → 0,70 ; Janvier 1,50 → 1,20. **Hausse soumise à validation** : Clubs 1,00 → 1,20 (pas de hausse du budget quotidien). Mots-clés génériques : voir B2. | B |

### 2.3 Budget et répartition
| # | Constat | Risque chiffré | Recommandation | Grav. |
|---|---|---|---|---|
| B1 | 30 €/j répartis sur 9 groupes actifs (Janvier en pause). Avec un CPC réel d'environ 1 € (70 à 85 % du CPC max), cela fait environ 30 clics par jour, soit **environ 3 clics par groupe et par jour**. Sur 11 jours (jusqu'au 10/12) : environ 330 clics et environ 5 commandes au taux de 1,5 %, dont environ 3 mesurées. | Aucun groupe n'aura assez de données en décembre pour un verdict statistique. Décembre sert à apprendre des **termes de recherche**, pas à arbitrer entre groupes. | Ne pas multiplier les tests. Seuils par groupe revus (S1). Ne pas créer de nouveaux groupes avant janvier. | B |
| B2 | Le budget est commun à la campagne : les requêtes à gros volume passent en premier. Or les plus volumineuses sont les plus « particulier » en décembre : [polo personnalisé], « casquette personnalisée », « tablier personnalisé », « tablier logo » (tabliers cadeaux pour papa ou barbecue), « sweat personnalisé logo noël ». | Hypothèse : **30 à 40 % de la dépense Search pro** sur ces termes, avec un ROAS d'environ 0,4 (panier de 35 €, conversion de 1 %). Soit **100 à 150 € dépensés pour environ 25 € de marge** sur les 3 premières semaines. | CPC max **par mot-clé** à **0,50 à 0,60 €** sur [polo personnalisé] et « casquette personnalisée ». **Mettre en pause** « tablier personnalisé » et « tablier logo » jusqu'au 15/01 (garder « tablier personnalisé restaurant »). Retirer « sweat personnalisé logo noël » du groupe Noël. Ajouter les négatifs « particulier » (N2). Le budget libéré profite aux requêtes pro, sans hausse du budget. | **A** |
| B3 | Écart de calcul : le journal compte 40 €/j du 30/11 au 20/12 (840 € + 140 € = 980 €). La fiche de campagnes prévoit 12 €/j de Search pro dès le 11/12. | D'après la fiche, décembre fait **≈ 800 €** (440 € jusqu'au 10/12, 220 € du 11 au 20/12, 140 € du 21/12 au 03/01). | **Le gérant confirme** lequel s'applique. Recommandation : 12 €/j à partir du 11/12 (après la date limite, la demande B2B immédiate chute), sauf si la 1re semaine montre des commandes pro au-dessus de l'équilibre. | B |
| B4 | Les changements de budget du 11/12, du 21/12 et du 04/01 sont manuels. | Un oubli le 21/12 coûte environ 30 €/j pendant les fêtes. | **Règles automatiques de budget**, une seule exécution chacune (check-list C6). Les baisses sont autorisées ; la remontée du 04/01 n'est qu'un retour au budget déjà validé. | B |

### 2.4 Mots-clés, correspondances, annonces
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| K1 | Correspondances exacte et expression, sans requête large. | Bien. Vérifier qu'aucun mot-clé n'est passé en large à la création (colonne « Type de correspondance »). **AI Max pour le Réseau de Recherche : désactivé.** | — |
| K2 | « t-shirt personnalisé logo entreprise » est placé dans le groupe Clubs, alors que l'annonce parle de clubs. | Le déplacer dans « Tenue de travail logo » avec l'URL `/vetements/t-shirts-personnalises` (URL au niveau du mot-clé). | C |
| K3 | Annonces : 12 titres communs + 3 titres de groupe. Peu de titres contiennent le mot-clé du groupe, ce qui fait baisser la pertinence et le Quality Score, donc monter le CPC. | Ajouter 2 titres « mot-clé » par groupe et retirer les communs les moins utiles (« France et Belgique », « Atelier joignable sur WhatsApp », couvert par une accroche). Un Quality Score plus haut d'1 à 2 points baisse le CPC d'environ 10 à 20 %. Titres proposés en C9. | B |
| K4 | Groupes à 2 pages (Restauration : tabliers ; Hiver : vestes ; Local : 6 villes). | **URL finale au niveau du mot-clé** : tablier → `/vetements/tabliers-personnalises` ; softshell, polaire, veste → `/vetements/vestes-personnalisees` ; chaque ville → `/vetements-personnalises/<ville>` (les 6 pages répondent en 200). | B |
| K5 | « gilet jaune personnalisé logo » : intention souvent associative ou événementielle, à petit prix. Notre gilet Beta (multipoches, classe 2) affiche « dès 25,40 € HT ». | Garder, mais surveiller ce terme en priorité dans le rapport des termes de recherche. Pour le gérant : un gilet HV d'entrée de gamme au catalogue (si Roly en propose) rendrait ce groupe nettement plus compétitif. | B |
| K6 | Campagne de marque [alwaan] : les variantes proches incluent « alwan » (« couleurs » en arabe, utilisé par d'autres commerces). | Relever les termes de recherche à J+3. Négatifs probables : peinture, restaurant, traiteur, épicerie, couleur(s). Budget de 2 €/j : risque faible. | C |

### 2.5 Négatifs
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| N1 | « 1 € » : Google ignore la plupart des symboles, donc le négatif devient « 1 » et bloque « polo personnalisé **1** pièce » ou « t-shirt logo à partir de **1** », nos meilleures requêtes (« dès 1 pièce »). « pas cher 1 » : même risque. | **Supprimer « 1 € » et « pas cher 1 »**, garder « 1 euro » en expression. | **A** |
| N2 | Il manque les signaux « cadeau individuel », non rentables en payant (CPA max de 2 à 5 €). | Ajouter à « Négatifs alwaan » (Search pro + Shopping) : papa, maman, mamie, papi, prénom, photo, humour, drôle, couple, naissance, anniversaire, mariage, cadeau homme, cadeau femme, cadeau papa, cadeau maman. Garder EVJF et EVG (groupes de 8 à 15 pièces, à observer). | **A** |
| N3 | Produits non proposés absents de la liste. | Ajouter : écusson, patch, badge, body, bavoir, pyjama, chaussette(s), plaid, coussin, gourde, stylo, drapeau, banderole, autocollant, sticker, porte-clé, carte de visite, masque. | B |
| N4 | Marques textiles recherchées pour elles-mêmes. | Ajouter : stanley stella, gildan, fruit of the loom, b&c, kariban, decathlon, kiabi, printful. | C |
| N5 | « image » et « dessin » bloquent aussi « t-shirt avec image de mon logo ». | Remplacer par « image gratuite », « images », « coloriage » (déjà présent). | C |
| N6 | La marque n'est pas exclue du Search pro. | Ajouter **alwaan** en négatif exact et expression dans Search pro (pas dans Shopping), pour que les recherches de marque aillent à la campagne de marque et que les chiffres restent propres. | C |

### 2.6 Géographie et langue
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| G1 | France + Belgique, lieu de présence. | Bien. **Ajouter comme zones ciblées en plus** : Nord, Pas-de-Calais, Hainaut, Région de Bruxelles-Capitale, avec **+15 %** (proximité de l'atelier, WhatsApp, retrait possible). Cela donne aussi des rapports par zone sans changer la couverture. | B |
| G2 | Le ciblage par langue n'est plus proposé. | Effet négligeable : les mots-clés en français filtrent déjà la langue. Ne rien faire. | — |
| G3 | « Le groupe Local doit être restreint au Nord » (fiche). | Inutile : les mots-clés contiennent la ville. Ne pas créer de campagne dédiée. | C |
| G4 | Corse et Monaco : tarif de livraison Shopify à vérifier. | Si la Corse n'a pas le même tarif, l'exclure (Google cible les DOM séparément de la France). | C |
| G5 | Belgique B2B : le checkout applique 20 % de TVA. Un professionnel belge assujetti attend souvent l'autoliquidation avec son numéro de TVA. | Frein à la conversion pour la cible +15 % du Hainaut. À voir avec le comptable (demande I10). | B |

### 2.7 Horaires et appareils
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| H1 | Aucun calendrier de diffusion : diffusion 24 h/24, 7 j/7. | **Search pro** : lun.–ven. 6 h–22 h (0 %) ; sam. et dim. 8 h–21 h (**−30 %**) ; **nuit 22 h–6 h exclue**. Les gérants de restaurant consultent tard, d'où 22 h et non 19 h. **Marque** : 24 h/24. **Shopping** : 7 h–23 h tous les jours. Économie estimée : 5 à 10 % de la dépense réorientée vers les heures ouvrées. | B |
| H2 | Aucun ajustement par appareil. | Le configurateur demande d'envoyer un logo, ce qui se fait moins bien sur mobile. **Mobile −20 %** sur Search pro et Shopping au départ, à revoir à J+14 sur le rapport « Appareils » (micro-conversions comprises). | B |

### 2.8 Shopping et Merchant Center
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| S1 | Merchant affiche **« compte pas encore configuré »** : aucune diffusion Shopping. | Check-list C11. Tant que ce n'est pas résolu, la campagne ne dépense rien : pas de perte, mais 8 €/j de budget immobilisé. | **A** (bloque le canal) |
| S2 | « marge haute +20 % / basse −20 % à l'intérieur de chaque catégorie » : dans le flux, **chaque catégorie n'a qu'une valeur** de `custom_label_2` (Casquettes, HV, Sweats, Vestes = haute ; Polos, Tabliers, Chemises = moyenne ; T-shirts = basse). En Shopping standard, on fixe une enchère par groupe de produits, il n'y a pas d'ajustement en %. | Subdiviser seulement par **Type de produit**. Mettre l'enchère par catégorie selon la marge et le panier : Casquettes 0,30 € ; T-shirts 0,20 € ; Polos 0,30 € ; Sweats 0,35 € ; Vestes et polaires 0,50 € ; HV 0,50 € ; Tabliers 0,25 € ; Chemises 0,30 €. Le groupe « Tout le reste » est **exclu**. CPC d'équilibre Shopping ≈ panier 60 € × 43 % × conversion 1 % ≈ 0,26 €. On remonte une famille seulement si la part d'impressions est < 10 % **et** le ROAS ≥ 2,3. | B |
| S3 | Shopping affiche le prix d'1 pièce TTC, ce qui attire surtout les particuliers. | Négatifs N2 dans Shopping ; mobile −20 % ; budget de 8 €/j inchangé. Seuil : ROAS < 1,5 après 150 € → enchères −30 %. | B |
| S4 | `g:size` reste une plage (« S-5XL ») sur 81 articles. | À surveiller dans les diagnostics Merchant une fois le compte configuré (demande I9). | C |
| S5 | Fiche produit : la ligne d'en-tête affiche **« dès 3,00 € HT la pièce, logo compris »** (Mercury) ou « dès 12,00 € HT la pièce » (Pegaso) **sans la quantité**, alors que le flux et l'`Offer` indiquent 6,60 € et 16,32 € TTC. | Risque d'avertissement « prix non concordant » côté Merchant. Promesse « dès » **sans condition de quantité**, contraire à nos règles. Demande **I2 (P0)**. | **A** |

### 2.9 Pages d'atterrissage et cohérence des annonces
Les 16 pages répondent en 200. Temps de réponse serveur : 0,20 à 0,36 s (accueil 0,75 s). Les pages catégorie affichent « dès 1 pièce », le délai en jours ouvrés, WhatsApp, l'atelier et « livraison offerte ». Aucun avis n'est affiché : c'est cohérent, il n'y en a pas encore.

| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| L1 | Titres et extensions de prix **absents des pages d'atterrissage** : « Polo + logo cœur 13,60 € HT » (la page Polos affiche « dès 12,00 € HT dès 30 pièces ») ; « Casquette + logo 5,50 € HT » et la description 9 (la page Casquettes affiche « dès 3,00 € HT dès 100 pièces ») ; extension de prix « T-shirt Dogo 8,78 € HT ». | Remplacer par des prix visibles : « Polos dès 12 € HT (30 pièces) », « Casquette dès 3 € HT, 100 pcs ». Extensions de prix en **« À partir de »** avec la condition dans la description : Polo Pegaso 12,00 € « HT, logo cœur, dès 30 pcs » → `/produits/polo-pegaso` ; Casquette Mercury 3,00 € « HT, logo inclus, 100 pcs » → `/produits/casquette-mercury` ; T-shirt Dogo 7,18 € « HT, logo cœur, dès 30 pcs » → `/produits/t-shirt-dogo`. Mettre en pause la description 9 jusqu'à I2. | **A** |
| L2 | Le groupe **Noël pro** pointe vers `/vetements/sweats-personnalises`, qui **n'affiche pas** « Commandez avant le 10 déc. ». Seul l'accueil l'affiche. | URL finale du groupe Noël = **`/`** (accueil : date limite + cadeaux d'équipe), jusqu'à ce que l'informaticien affiche le bandeau date limite sur les pages catégorie (I3 bis). | **A** |
| L3 | « Tenue de travail » arrive sur l'accueil (h1 « Vos tenues à votre logo, expédiées en 7 jours ouvrés ») : correct, mais générique, et le visuel de saison est Noël. | Accepté pour décembre. Page hub « Vêtements de travail personnalisés » demandée (I7). | C |
| L4 | `/metiers` et `/vetements-personnalises` renvoient une **404**. | Ne les utiliser dans aucun lien annexe ni aucune URL. | B |
| L5 | Images produit chargées directement chez le fournisseur (static.gorfactory.es) : environ 56 Ko, environ 1 s par image depuis l'Espagne. | Effet modéré, les images sont en chargement différé. Les servir via le CDN du site (I6). | C |

### 2.10 Extensions (éléments)
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| X1 | L'en-tête d'extrait « Produits » n'existe pas en français, « Types » a été pris. | Bon choix. Ajouter un 2e extrait avec l'en-tête **« Services »** : Maquette en direct, Lien d'équipe, Boutique club, Devis PDF immédiat, Impression DTF. | C |
| X2 | Liens annexes : textes et descriptions à fixer. | 4 à 6 liens annexes, tous en 200 (C8). | B |
| X3 | Extension d'appel : seulement si quelqu'un décroche aux heures de l'atelier. Si Google crée alors l'action « Appels depuis les annonces » en **principale**, elle fausse l'optimisation. | Soit pas d'extension d'appel, soit l'action d'appel passée en **secondaire**. | B |
| X4 | Images de l'atelier (vraies photos) : bon taux de clic si l'option est proposée. | Ajouter 4 à 6 photos réelles (atelier, presse, pièces imprimées). Jamais de photo présentée comme celle d'un client si ce n'en est pas une. | C |
| X5 | Ressources automatiques au niveau du compte (liens annexes et accroches dynamiques). | **Les désactiver** : elles peuvent pointer vers une 404 ou afficher une promesse non tenue. | **A** |

### 2.11 Automatisations Google
| # | Constat | Recommandation | Grav. |
|---|---|---|---|
| U1 | Recommandations appliquées automatiquement : état non vérifié. Certaines ajoutent de la requête large ou montent les budgets. | **Tout désactiver** (C1). Indispensable pour le garde-fou « aucune hausse sans validation ». | **A** |
| U2 | Ressources textuelles générées automatiquement, expansion de l'URL finale, AI Max. | **Désactivés** dans les 2 campagnes Search (C2). | **A** |
| U3 | Règle Noël programmée le 10/12 à 14 h. | Une règle s'exécute dans l'heure qui suit l'heure prévue, et l'internaute qui clique à 13 h 50 n'a pas le temps de configurer et de payer avant 14 h. **Programmer la règle à 12 h**, puis vérifier à 13 h que le groupe est bien en veille. | **A** |
| U4 | Fuseau horaire du compte non vérifié. | Les règles et le calendrier suivent le fuseau du compte : vérifier « (GMT+01:00) Paris ». | B |
| U5 | Brouillon de campagne inutile. | Le supprimer (C12). | C |

### 2.12 Seuils d'arrêt
Avec environ 3 clics par jour et par groupe, le seuil actuel « 60 € sans commande ni devis → pause » est trop serré. Un groupe qui convertit **exactement** à l'équilibre a **environ 50 % de chances** de n'avoir aucune vente mesurée à 60 € : CPC d'environ 1,3 €, soit environ 46 clics ; × 1,5 % = 0,7 vente attendue ; P(0) = e^−0,7 ≈ 50 %. Avec la perte de mesure M1, c'est encore pire.

**Seuils proposés (à valider)** :
- **Compte** : inchangé, **400 € cumulés sans commande payée → tout en pause sauf la marque**. Dans le scénario médian, P(0 vente mesurée) ≈ 2 % ; dans le prudent, environ 20 %. Le seuil reste pertinent. Compter les ventes Google Ads **et** les ventes UTM google/cpc.
- **Groupe** : pause si la dépense atteint **1,5 × le CPA d'équilibre** du groupe sans commande (UTM comprises), sans devis ni lien d'équipe. Soit : Tenue 120 €, Polos 110 €, Restauration 90 €, HV 200 €, Hiver 165 €, Clubs 165 €, Casquettes 75 €, Local 120 €. À ce niveau, un groupe deux fois plus rentable que l'équilibre n'a plus que 5 % de risque d'être coupé à tort. Conséquence : **peu de groupes atteindront leur seuil avant janvier**.
- **Terme de recherche** : exclusion immédiate de toute intention hors cible, sans attendre de seuil. Mot-clé : pause à 20 clics sans aucune micro-conversion **et** taux de clic < 2 %.
- **Shopping** : ROAS < 1,5 après 150 € → enchères −30 % ; famille à 2 × son CPA d'équilibre sans vente → exclue.

---

## 3. Plan d'actions priorisé

Qui : **Nav** = agent navigateur ou gérant dans les comptes ; **Info** = informaticien ; **Gér.** = décision du gérant.

### 3.1 Avant lundi 30/11
| Prio | Action | Réglage exact | Impact attendu | Qui |
|---|---|---|---|---|
| 1 | Verrouiller les automatismes | Recommandations > Application automatique : tout décoché ; campagnes Search : ressources générées, expansion d'URL et AI Max désactivées ; ressources automatiques du compte désactivées | Aucune requête large, hausse de budget ou promesse non validée | Nav |
| 2 | Suffixe UTM + taggage automatique | Paramètres du compte > Suivi (C3) | Voir 100 % des ventes payantes au lieu de 55 à 70 % : décisions justes en janvier | Nav + Info (I1) |
| 3 | Mots-clés génériques « particulier » | CPC 0,55 € sur [polo personnalisé] et « casquette personnalisée » ; pause de « tablier personnalisé » et « tablier logo » ; retrait de « sweat personnalisé logo noël » | 100 à 150 € de décembre réorientés vers le pro ; environ +100 € de marge | Nav |
| 4 | Corriger et compléter les négatifs | Supprimer « 1 € » et « pas cher 1 » ; ajouter N2, N3, N4, N5 ; « alwaan » en négatif du Search pro | Ne plus bloquer « 1 pièce » ; −10 à 20 % de clics hors cible | Nav |
| 5 | Règle Noël à 12 h + règles de budget | Règles (C6) | Pas d'annonce « avant le 10/12 » après l'heure limite ; pas d'oubli de baisse (environ 30 €/j économisés à partir du 21/12) | Nav |
| 6 | Prix des annonces visibles sur la page | Remplacer les titres et descriptions L1 ; extensions de prix en « À partir de » vers les fiches produit | Pas de refus, pas de déception, moins de rebond | Nav |
| 7 | URL du groupe Noël = accueil | Groupe Noël pro > annonce > URL finale `https://alwaan.fr/` | La date limite est vue : meilleure conversion sur 11 jours | Nav |
| 8 | Baisse des CPC max au-dessus de l'équilibre | E3 (baisses) ; Clubs 1,20 € si le gérant valide | Environ −10 % de CPC moyen à volume utile équivalent | Nav (+ Gér. pour Clubs) |
| 9 | Horaires, appareils, zones | C4, C5 (+15 % géographique soumis à validation) | 5 à 10 % de dépense réorientée vers les heures ouvrées et la proximité | Nav |
| 10 | Merchant « compte pas encore configuré » | C11 | Débloque le Shopping (8 €/j) | Nav + Gér. |
| 11 | Shopping : enchères par catégorie | S2 ; « Tout le reste » exclu ; négatifs | ROAS Shopping d'environ 1,3 à environ 1,6 (estimation) | Nav |
| 12 | Réglages de la conversion | « Achat (serveur) » : fenêtre 90 j, attribution basée sur les données ; fuseau du compte Paris | Les virements B2B tardifs sont comptés ; règles à la bonne heure | Nav |
| 13 | Bandeau date limite + prix « dès » avec la quantité | I2, I3 bis | Conformité des promesses ; concordance Merchant | Info |
| 14 | Exclusions d'IP et hygiène | IP de l'atelier et du domicile ; brouillon supprimé ; vérification de l'annonceur et facturation OK | Pas de clics internes ; diffusion possible dès lundi | Nav |
| 15 | Décision budget décembre (800 ou 980 €) et seuils révisés | B3, section 2.12 | Plan clair | Gér. |

### 3.2 Première semaine (30/11 → 06/12)
| Jour | Action | Détail | Qui |
|---|---|---|---|
| Lun. 30/11, 8 h | Activation | Activer Marque, Search pro et Shopping (si Merchant est OK). Contrôler le statut « Éligible » et l'approbation de chaque annonce. Vérifier les annonces avec « Aperçu et diagnostic des annonces », **jamais par une recherche Google** (les impressions et clics internes faussent les chiffres). | Gér. / Nav |
| Lun. 30/11 | **Test de bout en bout (M5)** | Depuis un téléphone, hors réseau de l'atelier : recherche « casquette logo entreprise » → clic sur l'annonce → « Tout accepter » → commande réelle utile (par exemple des casquettes au logo de l'atelier, environ 20 €) → paiement par carte. | Gér. |
| Mar. 01/12 | Contrôle de la chaîne | Le CSV `/feeds/conversions/<clé>-ventes.csv` contient la ligne (gclid réel, valeur HT, n° de commande). Gestionnaire de données : import du matin « réussi », 1 ligne acceptée. | Info + Nav |
| Mer. 02/12 | Conversion visible | Objectifs > Conversions > « Achat (serveur) » : 1 conversion. Sinon, **pause de Search pro et Shopping** jusqu'à correction (marque maintenue). | Nav |
| Mar. et jeu. | Termes de recherche | Rapport « Termes de recherche » de Search pro et Shopping, les 3 premiers jours puis tous les 2 jours : négatifs immédiats sur l'intention hors cible. | Nav (liste préparée par l'agent ads) |
| Jeu. 03/12 | Budget et enchères | Colonnes « Part d'impr. perdue (budget) » et « (classement) ». Si Search pro est limité par le budget : baisser les CPC des termes génériques plutôt que monter le budget. | Nav |
| Ven. 04/12 | 1er bilan | Dépense, clics, CPC réel, devis, ventes (Google Ads + UTM), termes ajoutés, entrée dans le journal. Proposition éventuelle sur le budget du 11/12. | Agent ads |
| Semaine | Micro-conversion devis | I4 en production : conversion secondaire « Demande de devis » | Info |
| Mer. 09/12 | Préparation fin de Noël | Vérifier la règle (10/12, 12 h) et l'état « en pause » de Janvier B2B ; préparer le message post-Noël. | Nav |

---

## 4. Check-list de l'agent navigateur
Libellés de l'interface Google Ads et Merchant Center en français. Ils peuvent varier légèrement selon les versions : en cas de doute, chercher le libellé dans la barre de recherche de l'interface. **Ne rien activer : les campagnes restent en pause jusqu'au 30/11.**

**C1. Recommandations appliquées automatiquement**
- [ ] Menu de gauche > **Recommandations** > en haut à droite **« Application automatique »**.
- [ ] Onglets « Augmenter votre portée », « Entretenir votre compte », « Améliorer vos enchères » (et tous les autres) : **tout décocher** > Enregistrer.

**C2. Ressources générées et AI Max (pour chaque campagne Search : Marque et Pro métiers)**
- [ ] Campagnes > sélectionner la campagne > **Paramètres** > « AI Max pour les campagnes sur le Réseau de Recherche » : **désactivé**.
- [ ] Même page > « Ressources générées automatiquement » / « Personnalisation du texte » : **désactivé** ; « Expansion de l'URL finale » : **désactivé**.
- [ ] **Paramètres du compte** (Administrateur > Paramètres du compte) > « Ressources générées automatiquement » / « Ressources automatisées » : désactiver liens annexes, accroches, extraits structurés et images dynamiques.

**C3. Suivi**
- [ ] Administrateur > **Paramètres du compte** > **Taggage automatique** : coché.
- [ ] Même page > **Suivi** > **Suffixe de l'URL finale** :
  `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}` > Enregistrer.
- [ ] Bouton « Tester » sur une URL : la page s'ouvre en 200 avec les paramètres.
- [ ] Administrateur > Paramètres du compte > **Fuseau horaire** : « (GMT+01:00) Paris ». Si ce n'est pas le cas, **noter le fuseau et me le signaler** (les heures des règles doivent alors être recalculées).
- [ ] Objectifs > Conversions > **Achat (serveur)** > Modifier les paramètres : fenêtre de conversion après clic **90 jours** ; modèle d'attribution **basé sur les données** ; « Valeur » : valeurs différentes ; Comptabilisation : toutes ; action **principale**. « Achat » (balise) : **secondaire**.
- [ ] Campagnes > Search pro et Shopping > Paramètres > **Exclusions d'adresses IP** : IP publique de l'atelier (et du domicile du gérant). Trouver l'IP en tapant « mon adresse IP » dans Google depuis chaque lieu.

**C4. Zones, horaires, appareils (Search – Pro métiers × produit)**
- [ ] Paramètres > **Zones** > Modifier > ajouter (en plus de France et Belgique) : **Nord**, **Pas-de-Calais**, **Hainaut**, **Région de Bruxelles-Capitale**. Options de zone : « Présence ».
- [ ] Onglet **Zones** (tableau) > colonne « Ajustement des enchères » : **+15 %** sur ces 4 zones, **seulement si le gérant l'a validé** (c'est une hausse ciblée). Sinon 0 % : on garde les rapports par zone.
- [ ] Paramètres > **Calendrier de diffusion** :
  - lundi à vendredi 06:00–22:00 ;
  - samedi 08:00–21:00 ;
  - dimanche 08:00–21:00 ;
  - puis dans le tableau « Calendrier de diffusion » : **−30 %** le samedi et le dimanche.
- [ ] Onglet **Appareils** > « Téléphones mobiles » > Ajustement des enchères : **−20 %**.
- [ ] Shopping : calendrier tous les jours 07:00–23:00 ; Appareils > mobiles **−20 %**.
- [ ] Marque : aucun calendrier (24 h/24), aucun ajustement.

**C5. Mots-clés et URL (Search – Pro métiers)**
- [ ] Mots-clés > [polo personnalisé] > colonne « CPC max » : **0,55 €**.
- [ ] Mots-clés > « casquette personnalisée » > CPC max **0,55 €**.
- [ ] Mots-clés > « tablier personnalisé » et « tablier logo » : **Mettre en veille** (note : réactivation prévue le 15/01).
- [ ] Groupe Noël pro > mot-clé « sweat personnalisé logo noël » : **Supprimer**.
- [ ] « t-shirt personnalisé logo entreprise » : déplacer vers « Tenue de travail logo » (le créer là, le supprimer de Clubs) ; URL finale du mot-clé `https://alwaan.fr/vetements/t-shirts-personnalises`.
- [ ] CPC max des groupes : Tenue de travail **1,20 €** ; Polos **1,00 €** ; Restauration **1,00 €** ; Casquettes **0,70 €** ; Janvier B2B **1,20 €** ; Clubs **1,20 € seulement si le gérant a validé** (sinon 1,00 €). HV 1,80 €, Hiver 1,50 €, Local 1,20 €, Noël 1,00 € : inchangés.
- [ ] URL finale **au niveau du mot-clé** (colonne « URL finale ») :
  - « tablier personnalisé restaurant » → `https://alwaan.fr/vetements/tabliers-personnalises` ;
  - « softshell personnalisée », « polaire personnalisée logo », « veste personnalisée entreprise » → `https://alwaan.fr/vetements/vestes-personnalisees` ;
  - chaque mot-clé Local → `https://alwaan.fr/vetements-personnalises/lille` (lille), `/roubaix`, `/tournai`, `/bruxelles` selon la ville.
- [ ] Vérifier la colonne « Type de correspondance » : aucun mot-clé en « Requête large ».

**C6. Règles automatiques** (Outils > Actions groupées > **Règles**)
- [ ] Modifier la règle « Mettre en veille le groupe d'annonces Noël pro » : fréquence **Une fois**, le **10/12/2026 à 12:00** (au lieu de 14:00).
- [ ] Nouvelle règle « Budget 11/12 » : type « Règle de campagne » > **Modifier les budgets** > Search – Pro métiers × produit > **Définir le budget sur 12 €** > Une fois, **11/12/2026 00:00**.
- [ ] Nouvelle règle « Budget fêtes 21/12 » : Modifier les budgets, une fois, **21/12/2026 00:00** :
  - Search pro **6 €** ;
  - Shopping **3 €** ;
  - Marque **1 €** ;
  - soit 10 €/j au total.
- [ ] Nouvelle règle « Budget janvier 04/01 » : Modifier les budgets, une fois, **04/01/2027 06:00** :
  - Search pro **30 €** ;
  - Shopping **8 €** ;
  - Marque **2 €**.
  - (Retour au budget validé.)
- [ ] Pour chaque règle : notification par e-mail « Uniquement en cas de modifications ou d'erreurs ».
- [ ] Le 10/12 à 13:00 : vérifier dans Outils > Règles > Historique que la règle Noël s'est bien exécutée, et que le groupe est « En veille ».

**C7. Négatifs** (Outils > Bibliothèque partagée > **Listes de mots clés à exclure** > « Négatifs alwaan »)
- [ ] **Supprimer** : « 1 € », « pas cher 1 », « image », « dessin ».
- [ ] **Ajouter (expression)** :
  - **cadeaux individuels** : papa, maman, mamie, papi, prénom, photo, humour, drôle, couple, naissance, anniversaire, mariage, cadeau homme, cadeau femme, cadeau papa, cadeau maman ;
  - **produits non proposés** : écusson, patch, badge, body, bavoir, pyjama, chaussette, chaussettes, plaid, coussin, gourde, stylo, drapeau, banderole, autocollant, sticker, porte-clé, carte de visite, masque ;
  - **marques textiles et enseignes** : stanley stella, gildan, fruit of the loom, b&c, kariban, decathlon, kiabi, printful ;
  - **images** : image gratuite, images.
- [ ] Vérifier que la liste est appliquée à **Search pro et Shopping**, et **pas** à la Marque.
- [ ] Search pro > Mots clés > **Mots clés à exclure** (niveau campagne) : ajouter **[alwaan]** et **"alwaan"**.

**C8. Annonces et éléments**
- [ ] Groupe Polos > annonce : remplacer le titre « Polo + logo cœur 13,60 € HT » par **« Polos dès 12 € HT (30 pièces) »**.
- [ ] Groupe Casquettes > annonce : remplacer « Casquette + logo 5,50 € HT » par **« Casquette dès 3 € HT, 100 pcs »**.
- [ ] Description n° 9 (prix dégressif Mercury) : la retirer des annonces jusqu'à ce que la fiche affiche le prix à l'unité (I2).
- [ ] Groupe Noël pro > annonce > URL finale : **`https://alwaan.fr/`**.
- [ ] Éléments > **Prix** : type « Produits », qualificatif **« À partir de »** :
  - Polo Pegaso **12,00 €**, « HT, logo cœur, dès 30 pcs », `https://alwaan.fr/produits/polo-pegaso` ;
  - Casquette Mercury **3,00 €**, « HT, logo inclus, 100 pcs », `https://alwaan.fr/produits/casquette-mercury` ;
  - T-shirt Dogo **7,18 €**, « HT, logo cœur, dès 30 pcs », `https://alwaan.fr/produits/t-shirt-dogo`.
  - Supprimer les anciennes valeurs 13,60 €, 5,50 € et 8,78 €.
- [ ] Éléments > **Extrait structuré** : en-tête « Types » (déjà créé) ; ajouter en-tête **« Services »** : Maquette en direct, Lien d'équipe, Boutique club, Devis PDF immédiat, Impression DTF.
- [ ] Éléments > **Liens annexes** (texte ≤ 25, descriptions ≤ 35) :
  - « Demander un devis » → `/devis` (« Réponse sous 24 h ouvrées » / « Devis PDF immédiat depuis le panier ») ;
  - « Lien d'équipe » → `/lien-equipe` (« Chacun donne sa taille en ligne ») ;
  - « Clubs et associations » → `/clubs-associations` (« Boutique en ligne pour vos membres ») ;
  - « Haute visibilité » → `/vetements/haute-visibilite-personnalisee` (« Gilets et vestes EN ISO 20471 ») ;
  - « Polos personnalisés » → `/vetements/polos-personnalises` (« Logo cœur et dos, dès 1 pièce ») ;
  - « Casquettes à logo » → `/vetements/casquettes-personnalisees` (« Logo face inclus, dès 1 pièce »).
  - **Jamais** `/metiers` ni `/vetements-personnalises` (404).
- [ ] Pas d'extension d'appel pour l'instant. Si elle est ajoutée : Objectifs > Conversions > « Appels depuis les annonces » en **secondaire**.

**C9. Titres « mot-clé » à ajouter (un par ligne, ≤ 30 caractères vérifiés)**
- [ ] Retirer de chaque annonce : « France et Belgique », « Atelier joignable sur WhatsApp ».
- [ ] Tenue de travail : « Vêtement de travail à logo », « Tenue de travail personnalisée ».
- [ ] Polos : « Polo entreprise à votre logo », « Polo de travail personnalisé ».
- [ ] Restauration : « Tablier restaurant à logo ».
- [ ] Haute visibilité : « Gilet jaune à votre logo ».
- [ ] Hiver : « Sweat entreprise à votre logo », « Softshell à votre logo ».
- [ ] Clubs : « Tenue de club personnalisée », « T-shirt asso à votre logo ».
- [ ] Casquettes : « Casquette logo entreprise ».
- [ ] Local : « Atelier à Haubourdin (Nord) », « Livré en Belgique » (ce dernier dans l'annonce qui porte les mots-clés belges).
- [ ] Noël pro : « Cadeau salarié à votre logo ».

**C10. Shopping standard – Catalogue**
- [ ] Groupes de produits : « Tous les produits » > subdiviser par **Type de produit** (une seule subdivision).
- [ ] Enchères :
  - Casquettes **0,30 €** ;
  - T-shirts **0,20 €** ;
  - Polos **0,30 €** ;
  - Sweats **0,35 €** ;
  - Vestes et polaires **0,50 €** ;
  - Haute visibilité **0,50 €** ;
  - Tabliers **0,25 €** ;
  - Chemises **0,30 €**.
- [ ] Ligne « Tout le reste » : **Exclu**.
- [ ] Ne **pas** créer de subdivision par `custom_label_2` (une seule valeur par catégorie, sans effet).
- [ ] Mots clés à exclure : liste « Négatifs alwaan » appliquée + « vierge », « sans logo », « gros volume 1000 ».
- [ ] Paramètres : priorité « Moyenne », zones France + Belgique (présence), budget 8 €/j, **en pause**.

**C11. Merchant Center (5915162698) : « compte pas encore configuré »**
- [ ] **Accueil** > encart **« Terminer la configuration »** (ou « Votre entreprise ») : faire chaque étape non cochée et noter laquelle bloquait.
- [ ] **Paramètres** (roue dentée) > **Informations sur l'entreprise** :
  - nom « alwaan », adresse de l'atelier (Haubourdin) ;
  - **téléphone vérifié** (code SMS ou appel) ;
  - e-mail du service client ;
  - pays France.
- [ ] Paramètres > **Expédition et retours** :
  - service de livraison France **et** Belgique (11,88 € TTC, offerte dès 180 € TTC), délai de traitement **7 jours ouvrés**, délai de transport **1 à 3 jours ouvrés** ;
  - **politique de retour générale** (lien `https://alwaan.fr/retours`), en plus de celle de l'étiquette `personnalise` ;
  - sans politique générale, le compte reste souvent « non configuré ».
- [ ] Paramètres > **Site Web** : alwaan.fr « Validé » et « Revendiqué » (déjà fait, à recontrôler).
- [ ] **Croissance** (ou « Programmes ») > **Annonces Shopping** et **Fiches gratuites** : **activés** pour France et Belgique.
- [ ] **Produits** > **Sources de données** : la source `https://alwaan.fr/feeds/google.xml`, récupération **quotidienne**, pays cibles **France et Belgique**, langue français. Lancer « Récupérer maintenant » si aucune récupération n'apparaît.
- [ ] Produits > **Diagnostics** : noter le nombre d'articles « En attente », « Refusés », « Avertissements » (en particulier « taille » et « prix ») et me les transmettre.
- [ ] Paramètres > **Applications et services** (ou « Comptes associés ») : lien Google Ads 251-489-2270 « Actif ».
- [ ] Délai normal : jusqu'à 3 jours ouvrés d'examen des produits après configuration.

**C12. Hygiène**
- [ ] Campagnes > afficher les brouillons > supprimer le **brouillon inutile** (après avoir vérifié qu'il ne contient rien de validé).
- [ ] Administrateur > **Facturation** : moyen de paiement valide. **Validation de l'annonceur** : statut « Validé » ou étapes à compléter (sinon les annonces peuvent ne pas diffuser lundi).
- [ ] Les 3 campagnes et le groupe Janvier B2B restent **en pause**.
- [ ] Capture d'écran de chaque page modifiée, à joindre au journal.

---

## 5. Demandes à l'informaticien (site et mesure)

| ID | Priorité | Demande | Pourquoi (ROI) |
|---|---|---|---|
| **I1** | **P0, avant le 30/11** | Insights / tableau des ventes : ajouter la répartition par `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` (id de groupe) / `utm_term`, **avec ou sans gclid**. Indicateur « google / cpc sans gclid » = ventes payantes non consenties. Montants HT. | Mesurer le ROAS réel malgré 30 à 45 % de refus du consentement (M1) |
| **I2** | **P0** | Fiche produit (`Configurator.tsx`, ligne « dès … la pièce ») : ajouter la quantité (« dès 3,00 € HT la pièce **dès 100 pièces**, logo compris ») et **afficher le prix à 1 pièce** et le tableau des paliers sans interaction (ex. Mercury 1–9 : 5,50 € · 10+ : 4,80 € · 30+ : 4,00 € · 50+ : 3,50 € · 100+ : 3,00 € HT). | Promesse « dès » avec condition ; concordance avec le flux et l'`Offer` (6,60 € / 16,32 € TTC) ; permet de réutiliser les prix à l'unité dans les annonces |
| **I3 bis** | **P0** | Bandeau date limite de Noël (`EventBanner compact`) aussi sur les pages `/vetements/*`, `/metiers/*`, `/vetements-personnalises/*` jusqu'au 10/12. | Le groupe Noël pourra pointer vers les sweats ; conversion sur la date limite |
| **I3** | P1 | Export CSV des conversions : colonnes GBRAID / WBRAID si le format du Gestionnaire de données les accepte, sinon envoi par l'API Google Ads. | Récupérer 5 à 15 % des clics mobiles iOS (M2) |
| **I4** | P1, 1re semaine | Formulaire `/devis` : `track('generate_lead')` à l'envoi et conversion Google Ads **secondaire** « Demande de devis » (balise gtag avec label, avec consentement). Joindre à la demande stockée l'attribution (UTM, et gclid si consentement), pour pouvoir importer plus tard « devis → commande ». Même conversion sur le devis PDF du panier. | Rendre visible la valeur B2B qui ne passe pas tout de suite par le checkout |
| **I5** | P1 | GA4 : identifiants, API secret, vérification des événements (demande ouverte depuis le premier passage). | Entonnoir, pages qui convertissent, audiences |
| **I6** | P2 | Images produit servies par le CDN du site (`next/image` ou proxy) au lieu de static.gorfactory.es (environ 1 s par image). | Vitesse sur mobile ; robustesse du flux |
| **I7** | P2, janvier | Page hub « Vêtements de travail personnalisés » (pros : métiers, délais, devis, lien d'équipe, virement), pour le groupe Tenue et le groupe Janvier. | Pertinence de la page, donc Quality Score et conversion du groupe le plus large |
| **I8** | P2 | Annulation après import : fichier d'ajustements (rétractation) ou envoi par l'API. | Ne pas surestimer le ROAS |
| **I9** | P2 | `g:size` : une taille valide par article (ou variantes par taille). | Diagnostics Merchant |
| **I10** | P2, avec le comptable | Checkout : numéro de TVA intracommunautaire pour les pros belges (autoliquidation) si la situation fiscale le permet. | Frein à l'achat B2B en Belgique, cible +15 % |
| **I11** | P2 | Réassurance sur les pages catégorie : « BAT validé avant impression », « paiement par virement pour les pros », vraies photos de l'atelier et de réalisations réelles. Collecte d'avis réels (le code AVIS existe), affichés dès qu'il y en a. | Conversion de trafic froid ; jamais de faux avis |
| — | Info gérant | Produit : gilet HV d'entrée de gamme (si Roly en propose un) ; marge des t-shirts à partir de 30 pièces (marquage vendu 2,40 € pour un coût d'environ 2 €). | Compétitivité du groupe HV ; rentabilité des gros volumes de t-shirts |

---

## 6. Décisions attendues du gérant
1. Budget de décembre : **800 €** (fiche, Search pro à 12 €/j dès le 11/12) ou **980 €** (journal, 30 €/j jusqu'au 20/12). Recommandation : 800 €.
2. Seuils d'arrêt révisés (section 2.12) : seuil compte inchangé, seuils par groupe à 1,5 × le CPA d'équilibre.
3. Clubs et associations : CPC max 1,00 → 1,20 € ; zones Nord, Pas-de-Calais, Hainaut et Bruxelles à +15 % (hausses de CPC ciblées, pas de budget).
4. Stratégie d'enchères après 15 conversions : « Maximiser la valeur de conversion », et non « Maximiser les conversions ».
5. Bannière Shopify : si elle n'est pas prête lundi, déconnecter le pixel Shopify (secondaire) et lancer quand même.

---

## 7. Estimation de l'impact des correctifs (30/11 → 20/12)
Hypothèses :
- **Termes pro** : CPC 1,00 €, conversion 1,3 %, panier 170 € HT, soit un ROAS d'environ 2,2.
- **Termes particuliers** : CPC 0,85 €, conversion 1 %, panier 35 €, soit un ROAS d'environ 0,4.
- **Shopping** : CPC 0,35 €, conversion 1 %, panier 45 €, soit un ROAS d'environ 1,3.
- **Mélange actuel** : 35 % de la dépense Search sur les termes particuliers ; 10 % de dépense de nuit à demi-conversion.
- **Après correctifs** : termes particuliers ramenés à environ 60 €, dont 70 % du budget libéré absorbé par les termes pro ; Shopping à un ROAS d'environ 1,6.
- Taux de marge : 43 % (coût réel du marquage).

| | Dépense | CA HT | Marge brute | Marge nette | ROAS |
|---|---|---|---|---|---|
| Configuration actuelle | ≈ 620 € | ≈ 895 € | ≈ 385 € | ≈ −235 € | ≈ 1,45 |
| Avec les correctifs | ≈ 570 € | ≈ 1 055 € | ≈ 455 € | ≈ −115 € | ≈ 1,85 |
| **Écart** | −50 € | +160 € | +70 € | **≈ +120 €** | +0,4 |

Ces ordres de grandeur sont à confirmer à J+7 avec les termes de recherche réels. Le gain le plus important ne se chiffre pas : grâce aux UTM, la mesure **voit enfin toutes les ventes**, ce qui évite de couper en janvier des groupes rentables.
