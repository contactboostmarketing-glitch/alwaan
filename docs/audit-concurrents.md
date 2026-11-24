# Audit concurrentiel : alwaan.fr face aux 6 concurrents Semrush (23/11/2026)

Concurrents retenus : ceux qui prennent le plus d'annonces et de référencement sur nos mots-clés (voir `docs/ads-recalage-semrush.md` et `docs/semrush/`).
Parcours fait comme un client, avec un vrai navigateur (Playwright, Chromium, 1280 × 900 et iPhone 13), le 23/11/2026. Aucun compte créé, aucun formulaire envoyé, aucune mise au panier.
Captures : `/tmp/claude-0/-home-user-alwaan/34c1fa0a-1fb1-5daf-8704-9c2c8891c9be/scratchpad/concurrents/` (2 ou 3 par site, liste en annexe). Ce dossier est temporaire : copiez les captures ailleurs si vous voulez les garder.

**Limites, à lire avant les chiffres**
- **th4.com : inaccessible.** Le site impose une vérification Cloudflare qui doit joindre `challenges.cloudflare.com`, un domaine bloqué par le réseau de cette session. Résultat : page « Un instant… » en 403, sur ordinateur comme sur mobile (capture `th4-blocage-cloudflare.png`). Rien n'est inventé : on ne connaît que ses annonces (Semrush).
- **teamshirts.fr : inaccessible.** Le site répond `{"error":"Forbidden","status":403}` au navigateur, sur ordinateur comme sur mobile (captures `teamshirts-blocage-403-*.png`). Là aussi, seules ses annonces (Semrush) sont connues.
- **graphywest.com et vetementpro.com n'affichent aucun prix avec marquage.** Ils fonctionnent sur devis : leurs prix sont notés « sur devis ».
- **Prix relevés** :
  - maboutiquepro : grilles affichées sur les fiches produits ;
  - tee-shirts-express : prix affiché par le configurateur après saisie des quantités, avant le panier. Les frais de port et un éventuel supplément au panier n'ont pas été vus.
- **Conventions** : tous les prix sont HT. TTC = HT × 1,2. « n.r. » : non relevé.
- **Pages chargées** :
  - maboutiquepro : environ 16 ;
  - graphywest : 14 ;
  - vetementpro : 8 ;
  - tee-shirts-express : environ 30, dont une dizaine de rechargements de la même fiche pour comprendre son configurateur. C'est un peu au-delà de la limite de 25 pages.
  - th4 et teamshirts : 2 à 3 tentatives chacun.

---

## 1. En bref

1. **Le concurrent le plus proche, maboutiquepro.com, est 18 à 69 % plus cher que nous** sur les 7 produits comparés, à toutes les quantités. En plus, il ne montre pas la maquette en direct : le « rendu gratuit » est envoyé après l'ajout au panier, et le BAT arrive par e-mail après la commande.
2. **tee-shirts-express.com est le vrai concurrent sur le prix.** C'est le plus gros annonceur du lot : environ 11 450 visites payantes par mois selon Semrush. Il propose 582 avis Trusted Shops, des milliers de références, un configurateur avec prix dégressifs dès 1 pièce et la broderie. Face à lui :
   - nous sommes **moins chers à l'unité** ;
   - **alignés à 10 et 30 pièces** ;
   - **plus chers à 100 pièces** : t-shirt +50 %, polo +13 %, sweat à capuche +7 %.
3. **Le gilet haute visibilité est notre produit le plus mal placé.** Il coûte 27,00 € HT à l'unité et 25,40 € HT dès 30, contre 16,10 et 12,10 € HT chez tee-shirts-express, soit **+68 à +133 %**. Ailleurs, des gilets nus démarrent à 2,20 ou 3,25 € HT. Or c'est **notre 1er groupe Google Ads** (environ 4 200 recherches par mois).
4. **Nos casquettes sont 60 à 78 % moins chères que tout le monde.** C'est trop bas : nous perdons de la marge sans gagner en crédibilité.
5. **Notre avance réelle** :
   - maquette sur photo réelle et prix exact en direct ;
   - BAT validé avant paiement, donc production lancée tout de suite ;
   - lien d'équipe pour les tailles, prénom imprimé, boutique club, assistant ;
   - pages métiers et villes du Nord et de Belgique, devis PDF immédiat.
   
   Aucun concurrent visité ne réunit tout cela.
6. **Notre retard réel** :
   - **zéro avis et zéro photo de réalisation** affichés : tee-shirts-express a 582 avis, vetementpro 4,6/5, et graphywest publie environ 25 réalisations nommées ;
   - pas de broderie ;
   - un seul numéro de téléphone, en WhatsApp mobile ;
   - livraison payante jusqu'à 150 € HT, sans palier au-delà de 30 pièces.

---

## 2. Tableau comparatif des prix

### 2.1 Prix unitaire, logo côté cœur (petit logo poitrine), impression couleur, par quantité
Chaque case donne **HT / TTC** en € par pièce, logo compris.

| Produit et site | 1 pièce | 10 pièces | 30 pièces | 100 pièces |
|---|---|---|---|---|
| **Polo** | | | | |
| alwaan · Pegaso 190-220 g | 13,60 / 16,32 | 12,80 / 15,36 | 12,00 / 14,40 | 12,00 / 14,40 |
| maboutiquepro · Polo Homme 190 g coton | 20,90 / 25,08 | 16,72 / 20,06 | 15,68 / 18,82 | 14,63 / 17,56 |
| tee-shirts-express · Roly Star 200 g coton | 15,78 / 18,94 | 12,31 / 14,77 | 11,78 / 14,14 | 10,59 / 12,71 |
| *Position alwaan vs maboutiquepro* | moins cher -35 % | moins cher -23 % | moins cher -23 % | moins cher -18 % |
| *Position alwaan vs tee-shirts-express* | moins cher -14 % | aligné +4 % | aligné +2 % | **plus cher +13 %** |
| **T-shirt** | | | | |
| alwaan · Dogo 165 g | 8,78 / 10,54 | 7,98 / 9,58 | 7,18 / 8,62 | 7,18 / 8,62 |
| maboutiquepro · T-shirt Homme 180 g | 14,90 / 17,88 | 11,92 / 14,30 | 11,18 / 13,42 | 9,69 / 11,63 |
| tee-shirts-express · Sol's Imperial 190 g | 13,67 / 16,40 | 7,83 / 9,40 | 5,80 / 6,96 | 4,78 / 5,74 |
| *Position alwaan vs maboutiquepro* | moins cher -41 % | moins cher -33 % | moins cher -36 % | moins cher -26 % |
| *Position alwaan vs tee-shirts-express* | moins cher -36 % | aligné +2 % | **plus cher +24 %** | **plus cher +50 %** |
| **Sweat col rond** | | | | |
| alwaan · Clasica | 16,50 / 19,80 | 15,70 / 18,84 | 14,90 / 17,88 | 14,90 / 17,88 |
| maboutiquepro · Sweat Classique | 24,90 / 29,88 | 19,92 / 23,90 | 18,68 / 22,42 | 17,43 / 20,92 |
| tee-shirts-express · AWDis JH030 280 g | 19,93 / 23,92 | 16,47 / 19,76 | 15,93 / 19,12 | 14,74 / 17,69 |
| *Position alwaan vs maboutiquepro* | moins cher -34 % | moins cher -21 % | moins cher -20 % | moins cher -15 % |
| *Position alwaan vs tee-shirts-express* | moins cher -17 % | aligné -5 % | moins cher -6 % | aligné +1 % |
| **Sweat à capuche** | | | | |
| alwaan · Urban | 19,76 / 23,71 | 18,96 / 22,75 | 18,16 / 21,79 | 18,16 / 21,79 |
| maboutiquepro · Sweat à capuche | 34,90 / 41,88 | 27,92 / 33,50 | 26,18 / 31,42 | 24,43 / 29,32 |
| tee-shirts-express · AWDis College Hoodie 280 g | 22,10 / 26,52 | 18,63 / 22,36 | 18,10 / 21,72 | 16,91 / 20,29 |
| *Position alwaan vs maboutiquepro* | moins cher -43 % | moins cher -32 % | moins cher -31 % | moins cher -26 % |
| *Position alwaan vs tee-shirts-express* | moins cher -11 % | aligné +2 % | aligné 0 % | **plus cher +7 %** |
| **Casquette** (logo face) | | | | |
| alwaan · Mercury 6 pans (prix tout compris) | 5,50 / 6,60 | 4,80 / 5,76 | 4,00 / 4,80 | 3,00 / 3,60 |
| maboutiquepro · Casquette visière courbe | 14,90 / 17,88 | 11,92 / 14,30 | 11,18 / 13,42 | 9,69 / 11,63 |
| tee-shirts-express · K-up KP011 6 panneaux | 24,69 / 29,63 | 16,32 / 19,58 | 14,65 / 17,58 | 11,31 / 13,57 |
| *Position alwaan vs maboutiquepro* | moins cher -63 % | moins cher -60 % | moins cher -64 % | moins cher -69 % |
| *Position alwaan vs tee-shirts-express* | moins cher -78 % | moins cher -71 % | moins cher -73 % | moins cher -73 % |
| **Gilet haute visibilité** | | | | |
| alwaan · Beta multipoches, classe 2 | 27,00 / 32,40 | 26,20 / 31,44 | 25,40 / 30,48 | 25,40 / 30,48 |
| maboutiquepro | pas de gilet HV (seulement un gilet sans manches en twill, non HV : 24,90 € HT) | | | |
| tee-shirts-express · Yoko gilet multifonction HV (1) | 16,10 / 19,32 | 12,64 / 15,17 | 12,10 / 14,52 | 10,91 / 13,09 |
| *Position alwaan vs tee-shirts-express* | **plus cher +68 %** | **plus cher +107 %** | **plus cher +110 %** | **plus cher +133 %** |
| **Tablier** | | | | |
| alwaan · Benoit bavette, logo poche | 11,36 / 13,63 | 10,56 / 12,67 | 9,76 / 11,71 | 9,76 / 11,71 |
| maboutiquepro · Tablier unisexe (logo cœur) | 26,90 / 32,28 | 20,18 / 24,22 | 18,83 / 22,60 | 18,83 / 22,60 |
| tee-shirts-express · NewGen bavette coton 280 g | n.r. (2) | 13,09 / 15,71 | 12,56 / 15,07 | 11,37 / 13,64 |
| *Position alwaan vs maboutiquepro* | moins cher -58 % | moins cher -48 % | moins cher -48 % | moins cher -48 % |
| *Position alwaan vs tee-shirts-express* | — | moins cher -19 % | moins cher -22 % | moins cher -14 % |

« aligné » = écart de ±5 % au plus.
(1) Prix du plus petit emplacement proposé par le configurateur, pour le coloris par défaut ; le libellé exact de l'emplacement n'est pas lisible. À prendre comme un ordre de grandeur.
(2) Le prix à l'unité ne s'est pas affiché pour le coloris par défaut.

**Ce qui est inclus**

| Site | Dans le prix affiché | En plus |
|---|---|---|
| alwaan | Vêtement + impression DTF en couleur au cœur (10 × 10 cm max.). Remise sur le **marquage seul** : -15 % dès 5, -20 % dès 10, -40 % dès 30 pièces au même logo. Casquettes : prix tout compris dégressif jusqu'à 100. | Livraison 9,90 € HT à domicile ou 4,90 € HT en point relais, offerte dès 150 € HT. Retouche du logo en option : 4 € HT par logo. |
| maboutiquepro | Vêtement + 1 marquage cœur, « sans frais fixes ». Remise sur **tout le prix** : -20 % dès 5, -25 % dès 20, -30 % dès 50 (jusqu'à -45 % dès 1 000 pour le t-shirt). Chaque emplacement en plus s'ajoute : sur le polo à 1 pièce, cœur 20,90 → + dos 24,90 → + anti-cœur 27,90 → + manches 33,90 € HT. | Livraison 6,90 € d'après les données structurées des fiches (HT ou TTC non précisé, seuil de gratuité non affiché). |
| tee-shirts-express | Vêtement + impression de l'emplacement choisi. Prix dégressifs calculés en direct dès 1 pièce. Broderie dès 5 pièces. | Livraison et délai (Rush, Standard ou Économique) choisis au panier ; tarifs non affichés avant. |
| graphywest | « À partir de » HT, sans quantité ni marquage précisés. | Tout le reste **sur devis**. |
| vetementpro | Vêtement nu seulement. | Marquage **sur devis**, avec 10 pièces minimum par technique et **500 € HT minimum** de commande. |

### 2.2 Paniers types (HT, livraison comprise quand elle est connue)

| Panier | alwaan | maboutiquepro | tee-shirts-express |
|---|---|---|---|
| 1 polo logo cœur | 13,60 + 9,90 = **23,50** (18,50 en relais) | 20,90 + 6,90 = **27,80** | 15,78 + port (n.r.) |
| 10 polos logo cœur | 128,00 + 9,90 = **137,90** | 167,20 + 6,90 = **174,10** | 123,10 + port (n.r.) |
| 30 t-shirts logo cœur | **215,40** (port offert) | 335,40 + port | 174,00 + port |
| 100 t-shirts logo cœur | **718,00** | 969,00 + port | **478,00** + port |
| 10 gilets HV logo cœur | **262,00** (port offert) | — | **126,40** + port |

### 2.3 Prix d'appel des sites sur devis (non comparables tels quels)

| Produit | graphywest « à partir de » HT (marquage et quantité non précisés, devis) | vetementpro, vêtement **nu** (marquage sur devis, 500 € HT minimum) |
|---|---|---|
| Polo | 8,25 € (210 g) ; 10,75 € (polycoton 200 g) ; 16,75 € (Practice 270 g) | 9,06 € TTC, soit 7,55 € HT (Clique) |
| T-shirt | 3,75 € (Impérial 190 g) ; 2,75 € (Regent 150 g) | n.r. |
| Tablier | 7,50 € (polycoton 240 g) ; 5,00 € (coton 180 g) | n.r. |
| Gilet de sécurité | 3,25 € ; Yoko classe 1 à 4,25 € | 2,64 € TTC (classe 2 de base, 2,20 € HT) ; Portwest multipoches 11,10 € TTC (9,25 € HT) |
| Sweat, casquette | sur devis (pas de prix sur les pages vues) | n.r. |

### 2.4 Livraison et délais annoncés

| Site | Tarif | Gratuité | Délai standard | Express |
|---|---|---|---|---|
| **alwaan** | 9,90 € HT à domicile, 4,90 € HT en relais (France et Belgique) | dès 150 € HT | 7 jours ouvrés de production + transport ; date estimée affichée | 4 jours ouvrés : 15 € (≤ 10 pièces), 20 € (≤ 20), 30 € (≤ 30), 60 € au-delà |
| maboutiquepro | 6,90 € (France) ; livre la Belgique, la Suisse, le Luxembourg et l'UE | non affichée | « rendu + marquage » en 5 à 7 jours + 1 à 2 jours de transport ; « expédié en 3 à 6 jours ouvrés » | « Express : rendu + marquage en 2 à 4 jours » sur les articles marqués Express, sans surcoût affiché |
| tee-shirts-express | au panier | n.r. | au choix : Rush, Standard ou Économique (dates au panier, « non garanties ») | Rush |
| graphywest | sur devis | — | « livraison sous 1 semaine possible » | — |
| vetementpro | 3,90 à 6,90 € TTC | dès 59 € TTC | 24/48 h pour le stock **non personnalisé** ; marquage sur devis | — |
| th4 (annonces) | ? | ? | « Personnalisé sous 24 h » | ? |
| teamshirts (annonces) | ? | « Livraison gratuite » | ? | ? |

---

## 3. Tableau des fonctionnalités

| Fonction | alwaan | maboutiquepro | graphywest | tee-shirts-express | vetementpro |
|---|---|---|---|---|---|
| Commande en ligne d'un vêtement marqué | oui | oui | non (devis) | oui | non (devis) |
| Aperçu du logo en direct | **oui**, sur photo réelle du vêtement (face et dos) | **non** : visuel « mon logo ici », rendu envoyé après l'ajout au panier | non | oui (déclaré) : prévisualisation après envoi du fichier, vue 3D ; non testé sans fichier | non |
| Placement libre du logo | non (8 emplacements fixes) | non (4 à 5 emplacements) | — | non (surfaces prédéfinies, plusieurs tailles) | — |
| Prix exact affiché par quantité avant le panier | oui (grille + calcul en direct) | oui (grille) | non (« à partir de ») | oui (après saisie des tailles) | non |
| Minimum de commande | **1** | **1** | 10 (annonces) ; non affiché sur le site | 1 (impression), 5 (broderie) | 10 pièces par technique + 500 € HT |
| Frais fixes ou de mise en route | aucun | aucun (« sans frais fixes ») | sur devis | aucun affiché | sur devis |
| BAT | maquette validée par le client avant paiement | BAT PDF par e-mail **après** la commande, corrections sous 48 h | devis | contrôle par un opérateur ; BAT si demandé ou si nécessaire | devis |
| Retouche ou vectorisation du logo | option payante 4 € HT, détourage automatique gratuit | **gratuite**, création de logo offerte | — | contrôle opérateur gratuit | fichier vectorisé exigé |
| Choix des tailles | grille de tailles + **lien d'équipe** | grille de tailles | — | grille de tailles | — |
| Devis | PDF immédiat + formulaire | panier « ou devis » | formulaire | page d'aide « devis » | formulaire |
| Techniques | DTF | flex, flocage, transfert, broderie, numérique (CGV) | sérigraphie, broderie, DTF, DTG | impression, broderie | broderie, transfert |
| Compte client et recommande | oui (page Recommander) | oui : **boutique privée** avec maquettes prêtes à recommander | non | oui (galerie de fichiers) | oui |
| Boutique club ou entreprise | oui | boutique privée du client | non | non vu | non |
| Paiement | carte, Apple Pay, Google Pay ; virement pour les pros connectés | virement, PayPal, chèque, carte | — | carte, virement, PayPal (CGV) ; « bon de commande administratif » traité dans l'aide | carte, chèque, virement, mandat administratif |
| Avis | **aucun affiché** (dispositif d'avis vérifiés prêt) | aucun visible | aucun visible | **Trusted Shops : 582 avis, « Très bien »** | **Avis Vérifiés : 4,6/5** (nombre non affiché sur la page vue) |
| Réalisations | page sans photo client | non | **environ 25 cas nommés** (Manu Chao, O'Tacos, Speed Burger…) | non vu | non |
| Blog et guides | 10 guides | non | blog d'environ 90 articles | rubrique d'aide | blog, guides d'achat, normes |
| FAQ | oui | non | non | oui (rubrique d'aide) | oui |
| Pages métiers | 4 | non | non (articles de blog) | non vu | oui (médical, cuisine, BTP…) |
| Pages villes | **14** (Nord et Belgique) | non | non | non | non |
| Téléphone | WhatsApp 06 seulement | fixe 04 77 76 24 29 | fixe 02 96 70 26 10, lun-ven 9 h-17 h | fixe 02 31 67 87 87 | via contact |
| Chat | conseiller IA + WhatsApp | non | non | oui | chatbot |
| Atelier en France affiché | Haubourdin (59) | « Made in France », Montbrison (42) | Lanvollon (22) | Vire (Normandie) | — |
| Haute visibilité | oui (3 modèles) | non | oui | oui | oui (large) |
| Express | oui, payant (4 jours ouvrés) | oui, 2 à 4 jours | « 1 semaine possible » | Rush | stock 24/48 h |
| Spécificités | maquette = BAT, lien d'équipe, prénom imprimé, assistant, packs métiers, contrôle photo, échantillon offert dès 150 pièces, site FR/EN | création de logo offerte | sérigraphie (grandes séries) | 3 délais au choix, très grand catalogue | EPI, chaussures, grandes marques |

**th4.com et teamshirts.fr** n'ont pas pu être vérifiés. Ce que disent leurs annonces (Semrush, 23/11/2026) :
- **th4** : « Personnalisé sous 24 h », « Plus de 7 000 références ». Il vend aussi des transferts DTF en gros.
- **teamshirts** : « Aperçu en ligne », « Livraison gratuite », « jusqu'à -60 % ». Il vend aussi des maillots de sport.

---

## 4. Analyse site par site

### maboutiquepro.com (Montbrison, 42) : le plus proche
Sources : accueil, 9 fiches produits, CGV, « Nos services », « Qui sommes-nous ». Captures `maboutiquepro-*`.
- **Structure** : 8 catégories (vestes, t-shirts, polos, sweats, casquettes, gilets, chemises, objets) et une cinquantaine de produits. Pas de blog, de FAQ, de pages métiers, de pages villes ni de réalisations. Bandeau « Made in France », téléphone fixe en tête.
- **Parcours** :
  - on choisit la couleur (27 à 43 coloris par modèle), les emplacements (cumulables) et les quantités par taille ;
  - la grille dégressive est affichée ;
  - le logo s'envoie **à la fin de la commande**, ou plus tard par e-mail ;
  - la maquette est faite **à la main** et envoyée en BAT PDF, avec corrections sous 48 h ;
  - la commande est payée avant le BAT ;
  - une boutique privée garde ensuite les maquettes pour recommander sans BAT.
- **Forces** :
  - même promesse que nous : « dès 1 pièce, sans frais fixes, imprimé en France » ;
  - logo refait en HD gratuitement, création de logo offerte ;
  - beaucoup de coloris, coupes femme ;
  - express 2 à 4 jours ;
  - paiement PayPal ou chèque ;
  - livraison dans toute l'UE.
- **Faiblesses** :
  - **prix 18 à 69 % plus élevés que les nôtres** ;
  - aucune maquette en direct ;
  - délai allongé par le BAT ;
  - aucun avis ni aucune réalisation ;
  - aucun contenu pour le SEO ;
  - pas de haute visibilité ;
  - site daté et titres de fiches à rallonge.
- **Lecture** : leurs annonces disent ce que nous disons, mais leur site ne tient pas la comparaison sur le prix ni sur l'aperçu. Une page « Pourquoi alwaan » qui montre côte à côte le prix d'un polo à 1 et à 10 pièces et le BAT immédiat suffit à nous démarquer, sans les nommer.

### graphywest.com (Lanvollon, 22) : « N°1 », sur devis
Sources : accueil, catégories, 2 fiches, contact, plan du site. Captures `graphywest-*`.
- **Structure** :
  - 12 catégories, environ 250 références (tote bags, bandanas, serviettes, outdoor) ;
  - **blog d'environ 90 articles**, dont environ 25 « réalisations » avec des clients nommés ;
  - pages sur les techniques (sérigraphie, broderie, DTF, DTG) ;
  - « Leader français », « N°1 » dans le titre ;
  - téléphone fixe et horaires.
- **Parcours** : pas de panier ni de configurateur. Chaque fiche renvoie à « DEVIS EXPRESS » (formulaire avec quantité et fichier). Les prix sont « à partir de » HT, sans marquage ni quantité précisés.
- **Forces** :
  - crédibilité (références connues, ancienneté) ;
  - sérigraphie, bien moins chère en grande série ;
  - broderie ;
  - large catalogue ;
  - contenu SEO abondant : il est 1er sur « vêtement de travail personnalisé ».
- **Faiblesses** :
  - impossible de commander ou de connaître le prix sans attendre un devis ;
  - 10 pièces minimum (annonces) ;
  - aucun avis ;
  - site vieillissant.
- **Lecture** : il gagne les projets de 100 pièces et plus (BDE, événements, marques). Nous gagnons les commandes de 1 à 50 pièces qui veulent un prix tout de suite. Nos annonces « Dès 1 pièce, prix affiché » répondent directement à son « dès 10, sur devis ».

### tee-shirts-express.com (Vire, 14) : le plus gros annonceur
Sources : accueil, catégories, 7 fiches avec configurateur, aide, CGV. Captures `tee-shirts-express-*`.
- **Structure** :
  - catalogue très large (environ 490 polos sur 41 pages) ;
  - filtres par grammage, origine et labels ;
  - prix HT/TTC au choix ;
  - **582 avis Trusted Shops** sur l'accueil ;
  - rubrique d'aide en FAQ ;
  - téléphone fixe et chat.
- **Parcours** :
  - quantités par taille ;
  - le prix de chaque emplacement se recalcule selon la quantité ;
  - impression ou broderie (5 pièces minimum) ;
  - envoi du fichier, puis prévisualisation et contrôle par un opérateur gratuit ;
  - BAT si nécessaire ;
  - 3 délais au choix (Rush, Standard, Économique) ;
  - paiement par carte, virement ou PayPal (CGV) ; l'aide traite aussi le « bon de commande administratif ».
- **Forces** :
  - **prix très bas en volume** (t-shirt 190 g à 4,78 € HT à 100 pièces) ;
  - preuve sociale massive ;
  - choix de marques (Stanley/Stella, Sol's, B&C, Roly) ;
  - broderie ;
  - adapté aux collectivités ;
  - vue 3D.
- **Faiblesses** :
  - cher à l'unité : t-shirt 13,67 € HT, casquette 24,69 € HT ;
  - configurateur lent (il s'affiche après plusieurs secondes) ;
  - ergonomie chargée ;
  - pas de lien d'équipe ni d'accompagnement par métier ;
  - frais de port visibles seulement au panier.
- **Lecture** : c'est lui qu'un acheteur pro compare à nos prix. Nous gagnons de 1 à 10 pièces. Nous devons tenir à 30 et 100 pièces : voir la section 7.

### vetementpro.com : vêtement de travail non marqué
Sources : accueil, personnalisation, avis, livraison, 2 catégories. Captures `vetementpro-*`.
- **Structure** : boutique d'EPI et de vêtements de travail de marque (Lafont, Carhartt, Portwest…). Avis Vérifiés 4,6/5, guides d'achat, normes, blog, FAQ, chatbot.
- **Personnalisation** : **sur devis seulement**, avec 500 € HT minimum et 10 pièces par technique.
- **Forces** :
  - livraison offerte dès 59 € TTC, en 24/48 h ;
  - retours sous 30 jours (articles non marqués) ;
  - mandat administratif ;
  - énorme trafic SEO (environ 16 900 mots-clés).
- **Faiblesses sur notre terrain** : aucune commande marquée en ligne, et un minimum élevé.
- **Lecture** : il capte les recherches génériques « vêtement de travail » (déjà exclues de nos annonces). Le seul vrai point de friction : ses gilets HV nus à 2 à 9 € HT servent de référence de prix aux acheteurs.

### th4.com et teamshirts.fr
Inaccessibles (voir les limites). D'après Semrush :
- **th4** achète surtout « personnaliser des casquettes », « papier transfert textile » et « impression dtf » (acheteurs de transferts) ;
- **teamshirts** achète surtout les marques concurrentes et les maillots de sport.

Leurs messages (« sous 24 h », « -60 % », « livraison gratuite ») ne sont pas vérifiables : à ne pas copier.

### alwaan.fr, vu avec les mêmes critères
- **Forces** :
  - seul site avec **maquette sur photo réelle + prix exact + BAT validé avant paiement** ;
  - dès 1 pièce, sans frais ;
  - prix les plus bas à l'unité ;
  - lien d'équipe, prénom imprimé, boutique club, packs métiers, assistant ;
  - pages métiers et villes ;
  - devis PDF immédiat, site FR/EN ;
  - point relais à 4,90 € ;
  - atelier local mis en avant.
- **Faiblesses** :
  - **aucune preuve sociale** : 0 avis, page Réalisations sans photo ;
  - téléphone en WhatsApp mobile seulement ;
  - pas de broderie ;
  - catalogue court (23 modèles, pas de polo femme) ;
  - remise plafonnée à 30 pièces et limitée au marquage, donc cher en volume ;
  - gilet HV cher ;
  - retouche de logo payante (4 €) quand d'autres l'offrent ;
  - livraison payante jusqu'à 150 € HT.

---

## 5. Ce qu'ils ont que nous n'avons pas, et l'inverse

| Ils ont, nous non | Chez qui | Importance pour nous |
|---|---|---|
| Avis clients visibles (note + nombre) | tee-shirts-express (582), vetementpro (4,6/5) | **Forte** |
| Réalisations nommées avec photos | graphywest (environ 25) | **Forte** |
| Broderie | maboutiquepro, graphywest, tee-shirts-express, vetementpro | Moyenne (polos et softshells pros) |
| Logo refait ou créé gratuitement | maboutiquepro (et opérateur gratuit chez tee-shirts-express) | Moyenne |
| Téléphone fixe + horaires | tous | Moyenne |
| Mandat administratif ou bon de commande, PayPal, chèque | vetementpro, tee-shirts-express, maboutiquepro | Moyenne (collectivités, associations) |
| Prix très bas à 100 pièces et plus | tee-shirts-express ; graphywest en sérigraphie | Moyenne (gros paniers) |
| Gilet HV d'entrée de gamme | tee-shirts-express, graphywest, vetementpro | **Forte** (1er groupe Ads) |
| Large choix de coloris, de marques, coupes femme | maboutiquepro, tee-shirts-express | Moyenne |
| Express sans surcoût affiché | maboutiquepro | Faible à moyenne |
| Livraison offerte dès 49 € HT | vetementpro (non marqué) | Faible |

| Nous avons, eux non | Ce que ça apporte |
|---|---|
| Maquette en direct sur la vraie photo du vêtement, prix exact recalculé à chaque clic | Le client voit et chiffre seul, en 1 minute |
| **Maquette = BAT validé avant paiement** | Pas d'attente de BAT par e-mail : production lancée tout de suite, 1 à 3 jours gagnés face à maboutiquepro |
| Lien d'équipe (chacun saisit sa taille) | Exclusif : supprime le tableau de tailles par e-mail |
| Prénom imprimé, boutique club, packs métiers, assistant « Créer ma tenue en 1 min » | Commande d'équipe complète sans échange |
| Remise cumulée par logo sur des vêtements différents | Un polo + un tablier + une casquette cumulent les paliers |
| Détourage automatique du logo, alerte en cas de logo en basse définition | Moins de mauvaises surprises |
| Pages métiers et 14 pages villes (Nord et Belgique) | Référencement local, que personne d'autre ne fait |
| Contrôle photo avant envoi, échantillon offert dès 150 pièces | Réassurance concrète |
| Point relais à 4,90 € HT ; Belgique au même tarif | Livraison bon marché |
| Prix les plus bas de 1 à 10 pièces sur tous les produits sauf le gilet HV | Argument chiffré, vérifiable |

---

## 6. Ce qui fera la différence : 15 recommandations priorisées

P0 = avant ou pendant la relance Ads du 30/11 et le pic de décembre ; P1 = d'ici fin janvier ; P2 = au premier trimestre.

| # | Prio. | Domaine | Recommandation | Pourquoi (constat) | Impact conversion | Effort |
|---|---|---|---|---|---|---|
| 1 | **P0** | Offre/prix | **Ajouter un gilet HV classe 2 d'entrée de gamme et repositionner le Beta** (section 7.1). En attendant : ne pas pousser d'enchères sur le groupe Haute visibilité au-delà du CPC prévu. | 1er groupe Ads (environ 4 200 recherches/mois) et notre produit le plus cher : +68 à +133 % face à tee-shirts-express, gilets nus à 2 à 9 € ailleurs | **Fort** | Moyen (sourcing + fiche) |
| 2 | **P0** | Réassurance | **Obtenir et afficher les 10 premiers avis** : fiche Google Business Profile de l'atelier d'Haubourdin, avis vérifiés du site (demande déjà envoyée à J+10), sollicitation directe des premiers clients. Afficher la note et le nombre dès 5 avis, près du bouton « Ajouter au panier ». | tee-shirts-express 582 avis, vetementpro 4,6/5 ; maboutiquepro et graphywest n'en ont aucun, ce qui laisse une fenêtre | **Fort** | Faible |
| 3 | **P0** | Réassurance | **Remplir la page Réalisations** : 6 à 10 photos réelles (commandes, pièces test portées, atelier, photos de contrôle) et 2 à 3 mini-cas « restaurant de Lille, 12 polos + 12 tabliers ». | Page actuelle sans photo client ; graphywest en publie environ 25, nommées | **Fort** | Faible |
| 4 | **P0** | Site | **Mettre en avant « BAT validé en 1 minute, production lancée tout de suite »** sur l'accueil, les fiches et les annonces, avec un schéma « vous validez → on imprime » face à « commande → attente du BAT par e-mail » (sans nommer personne). | Chez maboutiquepro, le BAT arrive après la commande (48 h par correction) ; chez tee-shirts-express, via un opérateur | Moyen à fort | Faible |
| 5 | **P0** | Réassurance/site | **Numéro d'appel + horaires** (« Appel ou WhatsApp · lun-ven 9 h-18 h »), lien tel: sur mobile, et même numéro dans les annonces (extension d'appel). | Tous les concurrents affichent un fixe et des horaires ; nous n'avons qu'un WhatsApp mobile | Moyen | Faible |
| 6 | **P1** | Offre/prix | **Palier 100 pièces** : marquage -50 % et vêtement -10 % dès 100 pièces au même logo (section 7.2). Afficher « 100+ » dans la grille. | À 100 pièces : t-shirt +50 %, polo +13 %, sweat à capuche +7 % face à tee-shirts-express ; notre remise s'arrête à 30 | Moyen (gros paniers) | Faible |
| 7 | **P1** | Offre | **Retouche du logo offerte** (supprimer le forfait de 4 €) et l'annoncer : « Logo vérifié et retouché gratuitement ». | maboutiquepro refait le logo en HD et crée un logo gratuitement ; tee-shirts-express : opérateur gratuit | Moyen | Faible |
| 8 | **P1** | Offre/prix | **Livraison offerte dès 120 € HT** au lieu de 150 (section 7.4). | 10 polos = 128 € HT paient aujourd'hui 9,90 € ; maboutiquepro facture 6,90 € ; vetementpro offre dès 59 € TTC | Moyen | Faible |
| 9 | **P1** | Contenu/SEO | **Mettre en ligne et pousser les pages d'atterrissage Semrush** : hub « vêtements de travail personnalisés » et page « gilet de sécurité / gilet jaune personnalisé » (déjà dans le code), puis « polo entreprise », « textile publicitaire », « tablier serveur / horeca ». | graphywest est 1er sur « vêtement de travail personnalisé » grâce à son contenu ; maboutiquepro n'a aucun contenu | Moyen (2 à 3 mois) | Moyen |
| 10 | **P1** | Contenu/SEO | **Une étude de cas par mois** (« restaurant X à Roubaix », « club Y à Tournai »), reliée aux pages métiers et villes. | Modèle graphywest (« Speed Burger x Graphy West ») ; nos 14 pages villes n'ont pas de preuve locale | Moyen | Moyen |
| 11 | **P1** | Réassurance/offre | **Paiement des collectivités et associations** : virement sans compte, bon de commande, mandat administratif ; à afficher dans la FAQ et au panier. | Mandat administratif chez vetementpro, bon de commande administratif chez tee-shirts-express ; mairies, écoles et clubs sont nos cibles « événementiel et associations » | Moyen (segment) | Moyen |
| 12 | **P1** | Offre | **Délai standard ramené à 5 jours ouvrés si la capacité le permet**, ou express offert dès 300 € HT. | maboutiquepro : 5 à 7 jours ou express 2 à 4 jours sans surcoût affiché ; nous : 7 jours ouvrés + transport, express payant | Moyen | Moyen (capacité atelier) |
| 13 | **P2** | Offre | **Versions femme des best-sellers** (polo, t-shirt) et 1 polo 100 % coton. | maboutiquepro et tee-shirts-express proposent la coupe femme sur chaque modèle phare ; nous n'avons aucun polo femme | Moyen | Moyen |
| 14 | **P2** | Offre | **Broderie sous-traitée, sur devis dès 10 pièces** (polos, softshells), ou une page claire « pourquoi le DTF plutôt que la broderie » reliée aux fiches. | Les 4 concurrents visités brodent ; « brodé » est interdit dans nos annonces | Moyen | Élevé |
| 15 | **P2** | Offre/prix | **Remonter légèrement les casquettes** (section 7.3). | 60 à 78 % sous la concurrence : marge perdue sans gain de crédibilité | Faible (marge) | Faible |

---

## 7. Prix mal placés et propositions chiffrées (sans toucher au code)

### 7.1 Gilet haute visibilité : trop cher (priorité 1)

| | 1 | 10 | 30 | 100 | vs tee-shirts-express (1 / 10 / 30 / 100) |
|---|---|---|---|---|---|
| Actuel : Beta multipoches (achat 11,50 €, ×2 = 23,00 € + cœur 4 €) | 27,00 | 26,20 | 25,40 | 25,40 | +68 % / +107 % / +110 % / +133 % |
| **Proposé A : nouveau gilet classe 2 d'entrée de gamme** (achat cible 2 à 2,50 € HT, à sourcer ; vendu nu 5,00 € + cœur 4 € avec les paliers actuels) | **9,00** | **8,20** | **7,40** | **7,40** | -44 % / -35 % / -39 % / -32 % |
| Proposé B : Beta repositionné en « premium multipoches » (coefficient 1,5, soit 17,25 € nu) | 21,25 | 20,45 | 19,65 | 19,65 | +32 % / +62 % / +62 % / +80 % |

- Faire du gilet d'entrée de gamme le **prix « dès » de la catégorie et des annonces** : « Gilet jaune + logo dès 7,40 € HT » ou « 9 € HT à l'unité ».
- Garder le Beta comme option « multipoches, porte-badge » en proposition B.
- La marge par commande du groupe HV, estimée à environ 137 € dans `ads-recalage-semrush.md`, baisse par pièce. En contrepartie, le taux de conversion d'un produit 2 à 3 fois plus cher que la concurrence est très probablement proche de zéro : à mesurer dès les premières semaines.
- Le modèle d'entrée de gamme exact reste à choisir chez Roly ou un autre fournisseur. Aucune référence n'est avancée ici.

### 7.2 Volumes de 100 pièces et plus : notre remise s'arrête trop tôt
Règle proposée : **dès 100 pièces au même logo, marquage -50 % (cœur à 2,00 €) et vêtement -10 %**. Les paliers de 5, 10 et 30 restent inchangés.

| Produit (logo cœur, 100 pièces) | Actuel | Proposé | vs tee-shirts-express (actuel → proposé) | vs maboutiquepro (actuel → proposé) | Marge restante sur le vêtement |
|---|---|---|---|---|---|
| Polo Pegaso | 12,00 | **10,64** | +13 % → 0 % | -18 % → -27 % | 3,84 € + marquage |
| T-shirt Dogo 165 g | 7,18 | **6,30** | +50 % → +32 % | -26 % → -35 % | 1,91 € + marquage |
| T-shirt Atomic 150 g | 5,40 | **4,70** | +13 % → -2 % | -44 % → -51 % | 1,20 € + marquage |
| Sweat Clasica | 14,90 | **13,25** | +1 % → -10 % | -15 % → -24 % | 5,00 € + marquage |
| Sweat à capuche Urban | 18,16 | **16,18** | +7 % → -4 % | -26 % → -34 % | 6,30 € + marquage |
| Tablier Benoit | 9,76 | **8,62** | -14 % → -24 % | -48 % → -54 % | 2,94 € + marquage |

- Sur les t-shirts en volume (événements, associations), **mettre en avant l'Atomic 150 à 4,70 € HT les 100** : c'est le seul moyen d'être au prix de tee-shirts-express.
- Le Dogo, à 165 g, reste plus cher et plus léger que l'Imperial 190 g : à présenter comme le t-shirt « porté toute l'année », pas comme le moins cher.

### 7.3 Casquettes : trop bon marché
| Casquette Mercury, logo face | 1 | 10 | 30 | 50 | 100 |
|---|---|---|---|---|---|
| Actuel (5,50 € → 3,00 €) | 5,50 | 4,80 | 4,00 | 3,50 | 3,00 |
| **Proposé** | **6,90** | **5,90** | **4,90** | **4,40** | **3,90** |
| Gain par casquette | +1,40 | +1,10 | +0,90 | +0,90 | +0,90 |
| Position proposée vs maboutiquepro / tee-shirts-express | -54 % / -72 % | -51 % / -64 % | -56 % / -67 % | — | -60 % / -66 % |

- Mêmes proportions pour la Wizer et la Barny : nouveau prix tout compris à l'unité = 6,90 × prix d'achat ÷ 4,20, puis même dégressivité (CAP_LADDER : 1 ; 0,86 ; 0,71 ; 0,64 ; 0,57).
- Le message Ads « Casquette dès 3 € HT, 100 pcs » devient « dès 3,90 € HT, 100 pcs ». Nous restons de loin les moins chers.
- C'est une décision de marge, à prendre ou non (P2).

### 7.4 Livraison : seuil de gratuité un peu haut pour un panier pro typique
| | Actuel | Proposé |
|---|---|---|
| Livraison offerte | dès 150 € HT | **dès 120 € HT** |
| 10 polos logo cœur (128 € HT) | 137,90 € HT livrés | **128,00 € HT livrés**, sous les 123,10 € + port de tee-shirts-express dès que leur port dépasse 4,90 € |
| 9,90 € domicile / 4,90 € relais | inchangé | inchangé |

- Coût : 9,90 € (ou 4,90 €) sur chaque commande entre 120 et 150 € HT.
- Nouvel argument d'annonce : « 10 polos à votre logo livrés : 128 € HT ».
- Alternative moins coûteuse : garder 150 € et mettre le point relais à 4,90 € en option par défaut.

### 7.5 Ce qui est bien placé, à ne pas toucher
- **De 1 à 10 pièces**, nous sommes moins chers que tous les concurrents mesurés sur polo, t-shirt, sweats, casquette et tablier. C'est notre meilleur argument : il faut l'afficher (« 1 polo à votre logo : 13,60 € HT »).
- **Option, non recommandée pour l'instant** : un marquage à 5 € au lieu de 4 € pour 1 à 4 pièces garderait 30 % d'écart avec maboutiquepro et améliorerait la marge des petites commandes. Mieux vaut d'abord mesurer la conversion avec les prix actuels.

---

## 8. Résumé pour le gérant

1. Notre concurrent le plus proche, maboutiquepro, est **18 à 69 % plus cher** que nous et ne montre pas la maquette : nous gagnons sur le prix et l'aperçu.
2. Le vrai concurrent de prix est **tee-shirts-express** (582 avis, énorme catalogue) : nous sommes moins chers de 1 à 10 pièces, alignés à 30, plus chers à 100.
3. **Gilet HV : 27 € HT contre 12 à 16 € chez lui.** C'est notre 1er groupe Ads : il faut un gilet d'entrée de gamme à environ 9 € HT logo compris (7,40 € dès 30).
4. **Notre plus gros manque : aucune preuve.** Zéro avis, zéro photo de réalisation. Objectif : 10 avis Google et 8 photos en décembre.
5. Notre avantage unique, à crier partout : **maquette réelle + prix exact + BAT validé en 1 minute**, production lancée tout de suite.
6. Afficher un **numéro d'appel avec horaires** (tous les concurrents le font).
7. Ajouter un **palier 100 pièces** (marquage -50 %, vêtement -10 %) pour ne plus perdre les grosses commandes.
8. **Offrir la retouche du logo** (4 € aujourd'hui) : les concurrents la font gratuitement.
9. **Livraison offerte dès 120 € HT** : 10 polos livrés gratuitement.
10. Casquettes **trop bon marché** (60 à 78 % sous le marché) : passer à 6,90 → 3,90 € HT reste imbattable.
11. th4 et teamshirts n'ont pas pu être visités (sites bloqués pour les robots) : aucune donnée inventée.
12. Ensuite : versions femme, paiement des collectivités, broderie sous-traitée.

---

### Annexe : captures (scratchpad)
- `alwaan-accueil-desktop.png`, `alwaan-accueil-mobile.png`, `alwaan-polo-config-desktop.png`
- `maboutiquepro-accueil-desktop.png`, `maboutiquepro-accueil-mobile.png`, `maboutiquepro-polo-config-desktop.png` (visuel « mon logo ici », grille de prix)
- `graphywest-accueil-desktop.png`, `graphywest-accueil-mobile.png`, `graphywest-produit-polo-desktop.png` (« Devis express », prix « à partir de »)
- `tee-shirts-express-accueil-desktop.png`, `tee-shirts-express-accueil-mobile.png`, `tee-shirts-express-polo-config-1-piece.png` (prix par emplacement pour 1 pièce)
- `vetementpro-accueil-desktop.png`, `vetementpro-accueil-mobile.png`, `vetementpro-personnalisation-desktop.png` (conditions : 500 € HT, 10 pièces)
- `th4-blocage-cloudflare.png`, `teamshirts-blocage-403-desktop.png`, `teamshirts-blocage-403-mobile.png`

Prix alwaan calculés avec `unitAt()` de `src/lib/pricing.ts` et `capPrice()` de `src/lib/catalog.ts` (état du dépôt au 23/11/2026).
