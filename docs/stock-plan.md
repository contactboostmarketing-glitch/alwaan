# Plan de stock alwaan : ce qu'on stocke, ce qui reste à la commande

*Version du 23/11/2026, avant le lancement du 30/11. Il n'y a encore aucune vente : tout repose sur les prévisions de `docs/ads-strategie.md` et sur des hypothèses écrites en clair (§ 10). Montants en € HT, au prix d'achat Roly. Le détail ligne par ligne est dans `docs/stock-depart.csv`.*

## 0. En bref

1. **Sans stock, le délai standard de 7 jours ouvrés tient, mais pile.** 5 jours pour recevoir Roly + 2 jours d'impression = 7. Il n'y a aucune marge : un jour de retard chez Roly, une commande Roly passée le lendemain ou une rupture chez Roly, et la date annoncée est ratée.
2. **Aujourd'hui, le site promet deux choses impossibles sans stock** : l'express en 4 jours (sans stock, il faut au moins 7 jours) et le textile vierge « expédié sous 2 jours » (il en faut 5 à 6). Il les affiche pour tous les articles parce qu'aucun stock n'est saisi.
3. **Décision : un petit stock « de service », pas un stock « de volume ».** Il sert à l'express, aux commandes de 1 à 5 pièces, au textile vierge, aux échantillons et à la sécurité de Noël, sur 21 produits : 10 en stock permanent (A) et 11 en petit stock tampon (B). Les 20 autres produits (C), les couleurs rares, les tailles 4XL et 5XL et les grosses commandes d'équipe restent 100 % à la commande, en 7 jours.
4. **Trois niveaux de stock de départ** : minimal **328 €**, recommandé **1 355 €** (120 références, 327 pièces), confortable **3 927 €**. Plus un renfort pour janvier de 0, 722 € ou 1 564 € selon les ventes de décembre (décision le lundi 14/12).
5. **Cette semaine** : commander le stock de départ chez Roly **au plus tard le mardi 24/11** (reçu le mardi 01/12). Tant qu'il n'est pas arrivé et saisi sur le site, l'express doit être masqué. Les réglages à faire sur le site sont au § 8.

## 1. Les délais : ce que le site promet, ce qui est possible

### 1.1 Les données
- **Vos délais réels** : Roly met 5 jours ouvrés pour livrer l'atelier ; l'impression prend 2 jours ouvrés ; le transport vers le client 2 jours ouvrés (réglage `TRANSIT_DAYS`).
- **Ce que le site annonce** (`src/lib/delivery.ts`) : préparation standard 7 jours ouvrés (`PRODUCTION_DAYS`), express 4 jours (`EXPRESS_DAYS`, option payante de 15 à 60 € HT selon le nombre de pièces), textile vierge 2 jours (`BLANK_DAYS`). Une commande passée après 14 h compte à partir du jour ouvré suivant.
- **Le suivi de stock** (`src/lib/stockTypes.ts`, `src/lib/stock.ts`) : tant qu'aucun stock n'est saisi, tout est considéré « disponible ». Dès qu'on saisit un stock, toute taille ou couleur absente ou insuffisante devient « sur commande » et le site ajoute 5 jours (`ON_ORDER_DAYS`).

### 1.2 Ce que ça donne (jours ouvrés avant l'expédition, transport en plus)

| Cas | Le site aujourd'hui (aucun stock saisi) | Le site si on saisit un stock, réglages actuels | Réalité | Verdict |
|---|---|---|---|---|
| Standard, article en stock | 7 | 7 | 2 (impression seule) | Juste, avec 5 jours d'avance |
| Standard, article sur commande | 7 | **12** (7 + 5) | 7 (5 Roly + 2 impression) | Aujourd'hui : juste mais sans aucune marge. Avec un stock saisi : **5 jours de trop annoncés**, soit près de 3 semaines avec le transport : des ventes perdues |
| Express, article en stock | 4 | 4 | 2 | Juste, 2 jours de marge |
| Express, article sur commande | 4 | 9 (4 + 5) | 7 au mieux | Aujourd'hui : **promesse impossible**. Avec un stock saisi : le client paie l'express pour un délai plus long que le standard réel |
| Textile vierge, en stock | 2 | 2 | 1 à 2 | Juste |
| Textile vierge, sur commande | 2 | 7 (2 + 5) | 5 à 6 (Roly + préparation) | Aujourd'hui : **promesse impossible**. Avec un stock saisi : juste |

Exemple : une commande passée le lundi 30/11 à 10 h. Le site annonce une réception le vendredi 11/12 en standard et le mardi 08/12 en express. Sans stock, l'express arriverait au mieux le vendredi 11/12, comme le standard.

**D'où vient l'incohérence.** Les 7 jours standard comprennent déjà les 5 jours Roly ; les 2 jours du textile vierge, non. Le site ajoute pourtant les mêmes 5 jours aux deux. Aucun réglage des seuls chiffres ne rend juste les six lignes à la fois : il faut deux petites modifications du code (§ 8, points 2 et 3).

### 1.3 Noël (bandeau « commandez avant le … pour être livré au plus tard le 24 décembre »)
- **Le site calcule le jeudi 10/12** (fonction `orderBy` de `src/lib/seasons.ts` : 7 + 2 jours ouvrés, et le 24 lui-même est exclu, ce qui donne déjà un jour de marge). C'est la même date que les annonces.
- **Article sur commande, commande du jeudi 10/12 avant 14 h** : commande Roly le jour même → reçue le jeudi 17/12 → imprimée les 18 et 21/12 → expédiée le lundi 21/12 → livrée le mercredi 23/12. **Un seul jour de marge**, à condition de commander chez Roly le jour même et que le transport tienne 2 jours la semaine de Noël. Commande du 10/12 après 14 h : livrée le 24/12, **aucune marge**.
- **Article en stock, même commande** : expédiée le lundi 14/12, livrée le mercredi 16/12, soit 6 jours de marge. En express depuis le stock, on peut encore livrer pour Noël une commande passée **jusqu'au mercredi 16/12 avant 14 h** (livrée le 22/12 dans les faits, le 24/12 d'après le calcul du site).
- **Roly est une marque espagnole (Gorfactory)** : le 8 décembre est férié en Espagne. Une commande Roly passée entre le 2 et le 8/12 peut arriver un jour plus tard. À confirmer avec Roly (§ 9).
- **Conclusion** : la date du 10/12 tient sans risque pour les articles en stock, et à un jour près pour les articles sur commande. C'est une raison forte de stocker les produits poussés à Noël (bonnet, Mercury, Pegaso, sweats, tabliers).

## 2. Décision de fond

### 2.1 À quoi sert le stock, et à quoi il ne sert pas

Ordre de grandeur : le scénario médian prévoit environ 403 pièces vendues en 12 semaines, réparties sur 41 vêtements, 18 couleurs et jusqu'à 9 tailles. La plupart des combinaisons vêtement + couleur + taille ne vendront qu'une ou deux pièces sur la période. **Le stock ne peut donc pas servir à « avoir tout » : il sert à rendre un service précis sur les articles qui se vendent le plus.**

| Besoin | Sans stock | Avec le stock recommandé | Ce qu'on stocke pour ça |
|---|---|---|---|
| Express 4 jours (option payante) | Impossible | Possible quand tout le panier est en stock | Produits A et B, couleurs phares |
| Marge sur la promesse de 7 jours | 0 jour | 5 jours sur les articles en stock | Idem |
| Noël (commande jusqu'au 10/12) | 1 jour de marge au mieux | 6 jours ; express jusqu'au 16/12 | Bonnet, Mercury, Pegaso, sweats, tabliers |
| Rupture chez Roly (délai de retour inconnu) | Commande bloquée | Les best-sellers restent servis tant que leur stock dure (environ une commande type par couleur) | Produits A |
| Commandes de 1 pièce (16 % des commandes simulées) | Un envoi Roly pour une seule pièce | Servies depuis le stock 49 % du temps | Tailles S à XXL des produits A |
| Textile vierge (promis sous 2 jours) | 5 à 6 jours | 1 à 2 jours | Idem |
| Échantillons, essais d'impression, photos de réalisation (aucune aujourd'hui, voir l'audit concurrents) | Attendre Roly | Immédiat | Un « kit » d'une pièce par produit A et B : 21 pièces, 136 € (en plus du stock vendable) |
| Commandes d'équipe de 10 pièces et plus dans une même couleur | 7 jours | 7 jours : elles restent sur commande | Rien de plus : le délai standard suffit |

**Ce qui peut rester 100 % à la commande** : les 20 produits C, toutes les couleurs hors couleurs phares, les tailles 4XL et 5XL (et 3XL hors haute visibilité), les coupes femme, et toute quantité au-delà du stock. Le délai standard de 7 jours le permet ; il faut seulement commander chez Roly le jour même (§ 5.4).

### 2.2 Classement des 41 produits

Règle appliquée par le script :
- **A, stock permanent** : au moins 3,5 % des pièces prévues, textile à 12 € ou moins, et best-seller, ou mis en avant par une saison du site (Noël, janvier, printemps), ou textile à 5 € ou moins.
- **B, petit stock tampon** : au moins 1,4 % des pièces prévues, et best-seller, ou mis en avant, ou haute visibilité, ou textile à 5 € ou moins, ou au moins 3 % des pièces.
- **C, à la commande uniquement** : tout le reste.

| Classe | Produit | Part des pièces prévues (médian) | Prix d'achat HT | Raison |
|---|---|---|---|---|
| A | Polo Pegaso | 11,0 % | 4,80 € | n° 1 des pièces prévues, best-seller, mis en avant à Noël et au printemps |
| A | Casquette Mercury | 10,1 % | 1,12 € | produit d'appel à 1,12 €, taille unique, Noël et printemps |
| A | T-shirt Dogo | 9,5 % | 2,39 € | best-seller, 2,39 € |
| A | Tablier Benoit | 6,0 % | 3,68 € | best-seller restauration, taille unique (aucun risque de taille) |
| A | T-shirt Atomic 150 | 5,3 % | 1,50 € | le moins cher (1,50 €) ; les grosses séries d'événement restent sur commande |
| A | T-shirt Kutta | 5,3 % | 2,08 € | t-shirt de travail à 2,08 € |
| A | Sweat Clasica | 5,1 % | 6,25 € | best-seller de l'hiver (Noël, janvier) |
| A | Gilet HV Beta | 4,4 % | 11,50 € | 1re famille pro (≈ 4 200 recherches/mois), best-seller ; jaune fluo seulement (prix de vente jugé élevé par l'audit) |
| A | Gilet HV Polux | 4,0 % | 3,10 € | gilet HV le moins cher (3,10 €), 2 tailles seulement |
| A | Bonnet Rosmal | 3,7 % | 1,29 € | mis en avant à Noël, 1,29 €, taille unique ; à laisser s'écouler après janvier |
| B | Sweat à capuche Urban | 3,6 % | 7,88 € | 3,6 % des pièces mais 7,88 € et pas best-seller : couleur n° 1 seulement |
| B | Casquette Barny | 2,8 % | 3,90 € | casquette trucker à 3,90 € : noir seulement |
| B | Polo Estrella | 2,4 % | 6,51 € | manches longues, mis en avant en janvier |
| B | Softshell Nebraska | 1,9 % | 13,44 € | best-seller des vestes mais 13,44 € : noir, M à XL |
| B | T-shirt HV Delta | 1,9 % | 4,88 € | famille haute visibilité |
| B | Tablier Mini | 1,9 % | 1,84 € | 1,84 €, taille unique, une seule couleur, printemps |
| B | Parka HV Epsilon | 1,8 % | 25,15 € | mise en avant en janvier mais 25,15 € : 1 à 2 pièces par taille, M à XL |
| B | Chemise Moscu homme | 1,7 % | 10,45 € | best-seller, janvier, 10,45 € : blanc, M à XL |
| B | Polo HV Polaris | 1,7 % | 5,20 € | famille haute visibilité |
| B | Polaire Himalaya | 1,5 % | 4,57 € | polaire à 4,57 € |
| B | Veste HV Persei | 1,5 % | 14,65 € | mise en avant en janvier, 14,65 €, une seule couleur |
| C | Visière Wizer | 1,9 % | 5,10 € | visière d'été (mise en avant de juin à août) |
| C | Polo Montreal | 1,8 % | 6,25 € | doublon du Pegaso, demande faible |
| C | Sweat zippé Montblanc | 1,5 % | 10,45 € | 10,45 €, doublon des deux autres sweats |
| C | Tablier Batali | 1,4 % | 8,35 € | mis en avant à Noël mais demande prévue juste sous le seuil B ; option : 3 pièces marine (≈ 25 €) si vous le voulez en express |
| C | Chemise Moscu femme | 1,1 % | 10,45 € | coupe femme, tailles dispersées |
| C | T-shirt Fox | 1,1 % | 2,70 € | chiné, 3 couleurs, demande faible |
| C | Gilet Oslo | 0,6 % | 10,45 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Softshell Antartida | 0,5 % | 12,55 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Doudoune Finland | 0,5 % | 13,55 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Softshell Rudolph | 0,4 % | 14,60 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Gilet Quebec | 0,3 % | 9,92 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Polaire Luciane | 0,3 % | 10,45 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Gilet Nevada | 0,3 % | 9,35 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Doudoune Norway | 0,3 % | 14,18 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Veste Makalu | 0,3 % | 12,55 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Softshell Nebraska Femme | 0,2 % | 13,44 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Softshell Antartida Femme | 0,2 % | 12,55 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Gilet Oslo Femme | 0,1 % | 10,45 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Doudoune Finland Femme | 0,1 % | 13,55 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |
| C | Doudoune Norway Femme | 0,1 % | 14,18 € | moins de 1 % des pièces chacune, 9 à 15 €, 3 à 7 couleurs : le risque d'invendus dépasse le gain |

## 3. Le stock de départ

### 3.1 Hypothèses (toutes à recaler avec les vraies ventes)
- **Demande** : les 3 scénarios de `docs/ads-strategie.md` § 7, semaine par semaine, lus par le script : prudent 15,9 commandes et 1 218 € de CA sur 12 semaines, médian 54,9 commandes et 6 200 €, ambitieux 115,8 commandes et 17 808 €. Les ventes venues du référencement naturel ne sont pas comptées.
- **Budget de décembre relevé à 980 €** (`docs/ads-journal.md`) : s'il était entièrement dépensé au même rendement, décembre passerait de 7,9 à 12,6 commandes dans le médian. Le recalage Semrush prévoit plutôt 550 à 650 € réellement dépensés, faute de recherches pros : on garde les scénarios tels quels, et le niveau confortable couvre ce cas haut.
- **Répartition du chiffre d'affaires par famille** (part en %, d'après les recherches pros Semrush, la haute visibilité en tête, et les saisons du site) :

| Famille | Décembre | Janvier | Février |
|---|---|---|---|
| Haute visibilité | 24 % | 28 % | 22 % |
| Sweats | 18 % | 15 % | 11 % |
| Vestes et polaires | 16 % | 17 % | 10 % |
| Polos | 12 % | 13 % | 20 % |
| T-shirts | 13 % | 12 % | 15 % |
| Casquettes et bonnet | 8 % | 5 % | 8 % |
| Tabliers | 5 % | 5 % | 9 % |
| Chemises | 4 % | 5 % | 5 % |

- **Dans chaque famille**, le best-seller prend la plus grosse part (Pegaso 70 % des polos, Dogo 45 % des t-shirts, Clasica 50 % des sweats, Mercury 45 à 60 % des casquettes, Benoit 65 % des tabliers, gilets Beta et Polux 55 % de la haute visibilité, softshell Nebraska 25 % et polaire Himalaya 20 % des vestes). Détail dans le script `hyp.py`.
- **Couleurs** : noir, marine et blanc d'abord (sweats : noir, marine, gris chiné ; haute visibilité : jaune fluo 80 %, orange fluo 20 % ; chemises : blanc 55 %, noir 45 %).
- **Courbe de tailles** (adulte, part des pièces) :

| Courbe | XS | S | M | L | XL | XXL | 3XL | 4XL | 5XL |
|---|---|---|---|---|---|---|---|---|---|
| Vêtement de travail (polos, t-shirts, sweats, vestes, chemises) | 2 % | 8 % | 20 % | 28 % | 23 % | 12 % | 5 % | 1,5 % | 0,5 % |
| Haute visibilité (BTP, logistique) | 1 % | 4 % | 16 % | 28 % | 27 % | 15 % | 6 % | 3 % | — |
| Coupes femme | 6 % | 24 % | 32 % | 22 % | 11 % | 5 % | — | — | — |

  Pourquoi : le guide des tailles Roly met le L à 99–106 cm de tour de poitrine et le XL à 107–114 cm, là où se trouvent la plupart des hommes adultes. Les équipes de chantier et de logistique sont surtout masculines et prennent souvent une taille au-dessus en hiver (couches superposées), d'où une courbe haute visibilité décalée vers le XL et le 3XL. La restauration et l'hôtellerie sont plus mixtes, d'où plus de M. Gilet Polux : moitié M/L, moitié XL/2XL. Le site enregistre la taille de chaque pièce vendue : la courbe sera remplacée par la vraie après une cinquantaine de commandes.
- **Prix de vente moyen par pièce** : moyenne du prix « logo cœur » et « cœur + dos » à 10 pièces (`src/lib/pricing.ts`) ; casquettes et bonnet : prix tout compris à 10 pièces.
- **Coût d'achat** : champ `cost` du catalogue (prix Roly à l'unité, ou au blister quand Roly ne vend pas à l'unité), majoré pour le 3XL et au-delà selon les grilles Roly, arrondi à 5 % près (par exemple polo Pegaso 3XL +30 %, t-shirt Dogo 3XL +45 %, vestes et sweats +5 à +15 %).
- **Conditionnement Roly** (grilles 2026) : Atomic par blister de 10, Dogo, Pegaso et Fox par blister de 5 (−12,5 % par rapport à l'unité) ; tous les autres vêtements à l'unité, en cartons de 10 à 100 (prix carton ≈ −5 %, rarement atteint ici) ; bonnet par blister de 10, boîte de 200 (fiche roly.eu). Les casquettes Mercury, Barny et Wizer ne figurent pas dans les grilles (prix sur demande) : **multiples de 10 supposés, à confirmer**. Le script n'arrondit au blister que si la quantité voulue atteint 4 pièces sur 5 (8 sur 10) : sinon, acheter 5 pour en vouloir 2 coûte plus cher que l'économie du blister.
- **Quantité par taille** = une « commande type » par couleur stockée, répartie selon la courbe (au moins 1 pièce par taille retenue), plus la demande prévue pendant 10 jours ouvrés (5 jours de délai Roly + 5 jours entre deux commandes Roly). Commande type par couleur : minimal 5 pièces (casquettes 10) ; recommandé 10, 10 puis 5 pièces pour les couleurs n° 1, 2 et 3 (casquettes 20, 10, 10), et 5 pièces pour les B ; confortable 20, 15, 10 et 5 (casquettes 30, 20, 20, 10), et 10 puis 5 pour les B.

### 3.2 Les 3 niveaux

Chaque niveau a été testé par simulation : 1 000 tirages de 12 semaines de commandes par scénario, avec réassort chaque lundi (méthode au § 10).

| | Minimal | **Recommandé** | Confortable |
|---|---|---|---|
| **Investissement HT** | **328 €** | **1 355 €** | **3 927 €** |
| Ce qu'on stocke | Les 10 produits A, couleurs n° 1 et 2 (haute visibilité : jaune fluo seul), tailles M, L, XL | A : 3 couleurs phares, S à XXL (haute visibilité : jaune fluo seul, M à 3XL) ; B : couleur n° 1, M à XL | A : jusqu'à 4 couleurs, S à 3XL ; B : 2 couleurs, S à XXL |
| Produits / vêtement + couleur / références / pièces | 10 / 18 / 41 / 110 | 21 / 37 / 120 / 327 | 21 / 53 / 221 / 841 |
| Commandes servies entièrement depuis le stock, donc **express possible** (prudent / médian / ambitieux) | 9 / 7 / 5 % | 28 / 20 / 15 % | 51 / 42 / 33 % |
| Commandes de 1 pièce servies depuis le stock (médian) | 23 % | 49 % | 67 % |
| Petites commandes, 5 pièces ou moins, servies depuis le stock (médian) | 11 % | 30 % | 54 % |
| Commandes sur un produit et une couleur en stock, servies entièrement (médian) | 24 % | 38 % | 65 % |
| Pièces vendues prises dans le stock (médian) | 14 % | 34 % | 57 % |
| Couverture : jours ouvrés de ventes que représente le stock, au rythme de décembre / de janvier (médian) | 28 / 7 | 115 / 28 | 333 / 82 |
| Même chose au rythme de janvier, scénario ambitieux | 2 | 10 | 29 |
| Stock restant après 12 semaines (médian) | 253 € | 1 124 € | 3 388 € |
| Références sans aucune vente après 12 semaines (médian) | 19 sur 41 (133 €) | 67 sur 120 (608 €) | 144 sur 221 (1 987 €) |
| Pour qui | Trésorerie serrée : express et textile vierge seulement sur les best-sellers, dans leurs tailles les plus courantes | **Le bon point de départ** : chaque produit phare dans ses couleurs cœur, de S à XXL | Si le scénario ambitieux se confirme (≥ 10 commandes payées au 13/12) |

**Comment lire ces pourcentages.** Ils paraissent modestes parce qu'une commande type est une commande d'équipe : une dizaine de pièces d'une même couleur, dans des tailles au hasard, ou un produit C, ou une couleur rare. Ces commandes partent sur commande, en 7 jours, et c'est normal. La simulation suppose aussi que le client choisit sa couleur sans regarder le stock ; en pratique, un client pressé qui voit « express disponible » sur le noir et le marine choisira souvent l'une des deux. La vraie part de l'express sera donc un peu meilleure, sans qu'on puisse la chiffrer avant les premières ventes.

### 3.3 Détail du niveau recommandé

Format : taille, quantité de départ, et entre parenthèses le **seuil de recommande** (§ 5). TU = taille unique.

| Classe | Vêtement | Couleur | Tailles : quantité (seuil) | Pièces | Coût HT |
|---|---|---|---|---|---|
| A | Polo Pegaso | Marine | S 1 (0) · M 2 (1) · L 5 (2) · XL 3 (2) · XXL 1 (0) | 12 | 57,60 € |
| A | Polo Pegaso | Noir | S 1 (0) · M 2 (1) · L 5 (2) · XL 3 (2) · XXL 1 (0) | 12 | 57,60 € |
| A | Polo Pegaso | Blanc | S 1 (0) · M 1 (0) · L 1 (0) · XL 1 (0) · XXL 1 (0) | 5 | 24,00 € |
| B | Polo Estrella | Noir | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 32,55 € |
| A | T-shirt Dogo | Noir | S 1 (0) · M 2 (1) · L 5 (2) · XL 3 (2) · XXL 1 (0) | 12 | 28,68 € |
| A | T-shirt Dogo | Blanc | S 1 (0) · M 2 (1) · L 5 (2) · XL 3 (2) · XXL 1 (0) | 12 | 28,68 € |
| A | T-shirt Dogo | Marine | S 1 (0) · M 1 (0) · L 1 (0) · XL 1 (0) · XXL 1 (0) | 5 | 11,95 € |
| A | T-shirt Atomic 150 | Blanc | S 1 (0) · M 2 (1) · L 3 (2) · XL 3 (2) · XXL 1 (0) | 10 | 15,00 € |
| A | T-shirt Atomic 150 | Noir | S 1 (0) · M 2 (1) · L 3 (2) · XL 3 (2) · XXL 1 (0) | 10 | 15,00 € |
| A | T-shirt Atomic 150 | Royal | S 1 (0) · M 1 (0) · L 1 (0) · XL 1 (0) · XXL 1 (0) | 5 | 7,50 € |
| A | T-shirt Kutta | Noir | S 1 (0) · M 2 (1) · L 3 (2) · XL 3 (2) · XXL 1 (0) | 10 | 20,80 € |
| A | T-shirt Kutta | Marine | S 1 (0) · M 2 (1) · L 3 (2) · XL 3 (2) · XXL 1 (0) | 10 | 20,80 € |
| A | T-shirt Kutta | Blanc | S 1 (0) · M 1 (0) · L 1 (0) · XL 1 (0) · XXL 1 (0) | 5 | 10,40 € |
| B | Chemise Moscu homme | Blanc | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 52,25 € |
| A | Tablier Benoit | Noir | TU 12 (6) | 12 | 44,16 € |
| A | Tablier Benoit | Marine | TU 11 (5) | 11 | 40,48 € |
| A | Tablier Benoit | Bordeaux | TU 5 (3) | 5 | 18,40 € |
| B | Tablier Mini | Noir | TU 6 (3) | 6 | 11,04 € |
| A | Casquette Mercury | Noir | TU 20 (10) | 20 | 22,40 € |
| A | Casquette Mercury | Blanc | TU 10 (0) | 10 | 11,20 € |
| A | Casquette Mercury | Royal | TU 10 (0) | 10 | 11,20 € |
| B | Casquette Barny | Noir | TU 10 (0) | 10 | 39,00 € |
| A | Bonnet Rosmal | Noir | TU 20 (10) | 20 | 25,80 € |
| A | Bonnet Rosmal | Marine | TU 10 (0) | 10 | 12,90 € |
| A | Bonnet Rosmal | Gris chiné | TU 10 (0) | 10 | 12,90 € |
| A | Gilet HV Beta | Jaune fluo | M 3 (1) · L 4 (2) · XL 4 (2) · XXL 1 (0) · 3XL 1 (0) | 13 | 150,08 € |
| A | Gilet HV Polux | Jaune fluo | M/L 6 (3) · XL/2XL 6 (3) | 12 | 37,20 € |
| B | T-shirt HV Delta | Jaune fluo | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 24,40 € |
| B | Polo HV Polaris | Jaune fluo | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 26,00 € |
| B | Veste HV Persei | Jaune fluo | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 73,25 € |
| B | Parka HV Epsilon | Jaune fluo | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 125,75 € |
| A | Sweat Clasica | Noir | S 1 (0) · M 2 (1) · L 3 (2) · XL 3 (2) · XXL 1 (0) | 10 | 62,50 € |
| A | Sweat Clasica | Marine | S 1 (0) · M 2 (1) · L 3 (2) · XL 3 (2) · XXL 1 (0) | 10 | 62,50 € |
| A | Sweat Clasica | Gris chiné | S 1 (0) · M 1 (0) · L 1 (0) · XL 1 (0) · XXL 1 (0) | 5 | 31,25 € |
| B | Sweat à capuche Urban | Noir | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 39,40 € |
| B | Polaire Himalaya | Noir | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 22,85 € |
| B | Softshell Nebraska | Noir | M 1 (0) · L 2 (1) · XL 2 (1) | 5 | 67,20 € |
| | **Total** | | | **327** | **1 354,67 €** |

Dont produits A : 266 pièces, 841 € ; produits B : 61 pièces, 514 €. Économie si les blisters complets sont payés au prix blister : 8,99 € (le tableau garde le prix catalogue, plus prudent).

### 3.4 Les 10 références à stocker en priorité (vêtement + couleur, demande médiane)

| Rang | Vêtement | Couleur | Classe | Pièces attendues en 12 semaines (médian) | Stock recommandé | Coût HT |
|---|---|---|---|---|---|---|
| 1 | Casquette Mercury | Noir | A | 20,3 | 20 | 22,40 € |
| 2 | Gilet HV Beta | Jaune fluo | A | 14,3 | 13 | 150,08 € |
| 3 | Tablier Benoit | Noir | A | 13,3 | 12 | 44,16 € |
| 4 | Gilet HV Polux | Jaune fluo | A | 12,9 | 12 | 37,20 € |
| 5 | Polo Pegaso | Marine | A | 12,4 | 12 | 57,60 € |
| 6 | Polo Pegaso | Noir | A | 11,5 | 12 | 57,60 € |
| 7 | T-shirt Dogo | Noir | A | 9,9 | 12 | 28,68 € |
| 8 | T-shirt Dogo | Blanc | A | 9,2 | 12 | 28,68 € |
| 9 | Polo Pegaso | Blanc | A | 8,8 | 5 | 24,00 € |
| 10 | Casquette Mercury | Blanc | A | 8,1 | 10 | 11,20 € |

### 3.5 Niveaux minimal et confortable (résumé par vêtement et couleur)

**Minimal (328 €)** : Polo Pegaso marine 5 ; Polo Pegaso noir 5 ; T-shirt Dogo noir 5 ; T-shirt Dogo blanc 5 ; T-shirt Atomic 150 blanc 5 ; T-shirt Atomic 150 noir 5 ; T-shirt Kutta noir 5 ; T-shirt Kutta marine 5 ; Tablier Benoit noir 5 ; Tablier Benoit marine 5 ; Casquette Mercury noir 10 ; Casquette Mercury blanc 10 ; Bonnet Rosmal noir 10 ; Bonnet Rosmal marine 10 ; Gilet HV Beta jaune fluo 5 ; Gilet HV Polux jaune fluo 5 ; Sweat Clasica noir 5 ; Sweat Clasica marine 5. Détail par taille dans le CSV.

**Confortable (3 927 €)** : Polo Pegaso marine 31 ; Polo Pegaso noir 25 ; Polo Pegaso blanc 14 ; Polo Pegaso royal 6 ; Polo Estrella noir 13 ; Polo Estrella blanc 5 ; T-shirt Dogo noir 31 ; T-shirt Dogo blanc 20 ; T-shirt Dogo marine 15 ; T-shirt Dogo gris chiné 6 ; T-shirt Atomic 150 blanc 24 ; T-shirt Atomic 150 noir 18 ; T-shirt Atomic 150 royal 10 ; T-shirt Atomic 150 rouge 6 ; T-shirt Kutta noir 23 ; T-shirt Kutta marine 18 ; T-shirt Kutta blanc 11 ; T-shirt Kutta gris chiné 6 ; Chemise Moscu homme blanc 13 ; Chemise Moscu homme noir 6 ; Tablier Benoit noir 26 ; Tablier Benoit marine 17 ; Tablier Benoit bordeaux 11 ; Tablier Benoit sable 6 ; Tablier Mini noir 13 ; Casquette Mercury noir 40 ; Casquette Mercury blanc 20 ; Casquette Mercury royal 20 ; Casquette Mercury jaune fluo 10 ; Casquette Barny noir 20 ; Casquette Barny royal 10 ; Bonnet Rosmal noir 30 ; Bonnet Rosmal marine 20 ; Bonnet Rosmal gris chiné 20 ; Bonnet Rosmal beige 10 ; Gilet HV Beta jaune fluo 30 ; Gilet HV Beta orange fluo 17 ; Gilet HV Polux jaune fluo 28 ; Gilet HV Polux orange fluo 17 ; T-shirt HV Delta jaune fluo 13 ; Polo HV Polaris jaune fluo 13 ; Veste HV Persei jaune fluo 14 ; Parka HV Epsilon jaune fluo 14 ; Sweat Clasica noir 24 ; Sweat Clasica marine 18 ; Sweat Clasica gris chiné 13 ; Sweat Clasica blanc 6 ; Sweat à capuche Urban noir 13 ; Sweat à capuche Urban marine 8 ; Polaire Himalaya noir 12 ; Polaire Himalaya marine 6 ; Softshell Nebraska noir 13 ; Softshell Nebraska marine 8. Détail par taille dans le CSV.

## 4. Ce qui reste à la commande, et pourquoi

- **Les 20 produits C** : Visière Wizer, Polo Montreal, Sweat zippé Montblanc, Tablier Batali, Chemise Moscu femme, T-shirt Fox, Gilet Oslo, Softshell Antartida, Doudoune Finland, Softshell Rudolph, Gilet Quebec, Polaire Luciane, Gilet Nevada, Doudoune Norway, Veste Makalu, Softshell Nebraska Femme, Softshell Antartida Femme, Gilet Oslo Femme, Doudoune Finland Femme, Doudoune Norway Femme. Chacun pèse peu dans la demande prévue, coûte souvent 9 à 15 € et existe en 3 à 7 couleurs : un stock y dormirait. Le délai standard de 7 jours suffit.
- **Les couleurs hors couleurs phares** des produits A et B (par exemple polo Pegaso jaune, orange, rouge, bordeaux, royal, turquoise, vert ; haute visibilité orange fluo, sauf renfort de janvier).
- **Les tailles extrêmes** : XS, 4XL et 5XL partout, 3XL hors haute visibilité (environ 4 % des pièces prévues, et jusqu'à +45 à +95 % de prix d'achat chez Roly pour les t-shirts).
- **Les quantités au-delà du stock** : le site le gère déjà taille par taille (« au-delà du stock, sur commande »).
- **Les grosses séries** (t-shirts d'événement à 50 pièces et plus, casquettes à 100, commandes de 30 pièces et plus) : elles se commandent chez Roly au carton, au meilleur prix, en 7 jours.
- **Les coupes femme** (chemise, softshells, doudounes, gilet) : demande faible et tailles dispersées.

## 5. Règles de réassort

### 5.1 La règle, en une phrase
**Chaque lundi matin, pour chaque référence en stock : si la quantité est égale ou inférieure à son seuil de recommande, commander chez Roly de quoi revenir à la quantité de départ.** Le seuil et la quantité de départ (le « max ») sont dans le tableau du § 3.3 et dans le CSV (colonnes `point_de_commande_min` et `stock_max`).

### 5.2 Le calcul derrière
- **Seuil de recommande** = demande par jour ouvré × 5 jours (le temps que Roly livre) + stock de sécurité. Le stock de sécurité vaut la moitié de la quantité de base de la taille : de quoi servir une petite commande pendant l'attente.
- **Max** = demande par jour ouvré × 10 jours (délai Roly + une semaine jusqu'à la commande suivante) + quantité de base, arrondi au blister quand c'est rentable.
- Exemple, polo Pegaso marine en L (quantité de base 3) : demande médiane de janvier ≈ 0,06 pièce par jour ouvré. Seuil = 0,06 × 5 + 3 ÷ 2 ≈ 2. Max = 0,06 × 10 + 3 ≈ 4, arrondi au blister de 5 = **5**.
- Dans le niveau recommandé, la plupart des références ont un max de 1 à 3 pièces et un seuil de 0 à 2 (seuil 0 = recommander quand la dernière pièce part) : 93 % des seuils valent 2 ou moins. Seuils plus hauts : Tablier Benoit noir (6), Tablier Benoit marine (5), Tablier Benoit bordeaux (3), Tablier Mini noir (3), Casquette Mercury noir (10), Bonnet Rosmal noir (10), Gilet HV Polux jaune fluo (3).

### 5.3 Le seuil d'alerte du site (`STOCK_ALERT`)
Le site envoie un e-mail quand une référence **passe** sous le seuil, et ce seuil est le même pour toutes. Avec la valeur actuelle de 5, les 108 références stockées à 5 pièces ou moins (sur 120) n'enverraient jamais d'alerte, puisqu'elles démarrent déjà en dessous. **Réglage recommandé : `STOCK_ALERT = 0`** (variable Netlify, sans toucher au code) : un e-mail part dès qu'une référence est épuisée, et le compteur « stock bas » du tableau de bord atelier compte les références épuisées. Le relevé du lundi reste la règle principale. (Avec 0, l'objet de l'e-mail dit « sous 0 pièces » : formulation à ajuster si vous voulez.)

### 5.4 Les jours de commande chez Roly
- **Le lundi** : réassort du stock (règle du § 5.1), plus les articles sur commande des commandes payées pendant le week-end ou le vendredi après 14 h.
- **Les autres jours** : commander chez Roly **le jour même** dès qu'une commande payée contient un article sur commande. C'est la seule façon de tenir les 7 jours (5 + 2, sans marge).
- **Ce que ça coûte en frais de port Roly (inconnus, à confirmer)** : sur 12 semaines dans le médian, commander chaque jour où c'est nécessaire fait environ 31 envois ; regrouper sur 2 jours fixes (lundi et jeudi) environ 18 ; un seul jour (lundi) environ 9. **Par tranche de 10 € de port par envoi**, cela fait environ 310 €, 180 € ou 90 € sur la période. Si Roly ne facture pas le port, ou si le franco est atteint, on commande chaque jour. Le stock change peu ce nombre d'envois (31,3 avec le stock recommandé contre 31,5 sans stock, car il reste presque chaque jour un article sur commande) : ce sont les jours de commande qui le font baisser.
- **Si le port Roly est élevé** : passer à 2 jours fixes (lundi et jeudi) et annoncer 2 jours de marge sur les articles sur commande au lieu de 1 (§ 8, point 3), sinon la promesse de 7 jours n'est plus tenue.
- **Si Roly impose un minimum de commande** : compléter les petites commandes clients avec le réassort du stock pour l'atteindre.

### 5.5 Recalage
Après 4 semaines de ventes (lundi 28/12, ou lundi 04/01), remplacer la courbe de tailles, les couleurs et les parts de produits par les vraies ventes, puis relancer le calcul. Une référence sans vente pendant 8 semaines ne se recommande plus ; un produit C vendu 3 fois ou plus dans le mois passe en B.

## 6. Calendrier

Dates calculées avec les fonctions du site (`addBusinessDays`, jours fériés français), Roly à 5 jours ouvrés.

| Date | Action | Quantités |
|---|---|---|
| Lun. 23/11 ou **mar. 24/11 au plus tard** | Commander le stock de départ chez Roly (reçu le lun. 30/11 ou le mar. 01/12) | Niveau recommandé : 327 pièces, 1 355 € (+ kit photos et échantillons 136 € si souhaité) |
| Lun. 30/11 | Lancement. Express masqué tant que le stock n'est pas saisi | — |
| Mar. 01/12 | Réception, contrôle, saisie du stock sur la page atelier (clés `cle_site` du CSV) | Tout le niveau choisi, en une seule fois |
| Chaque lundi | Relevé et réassort (§ 5.1) | Selon les ventes de la semaine |
| Jeu. 03/12 | Dernière commande de réassort reçue avant la fin des commandes de Noël (reçue le jeu. 10/12, ou le 11/12 si le férié espagnol du 8/12 compte) : remettre à niveau bonnet, Mercury, Pegaso, sweats, tabliers | Retour au max |
| Lun. 07/12 | Réassort reçu le lun. 14/12 : il sert l'express de Noël jusqu'au 16/12 | Retour au max |
| **Jeu. 10/12** | Dernier jour de commande pour Noël (bandeau et annonces). Tout article sur commande doit partir chez Roly **le jour même**, avant son heure limite | — |
| **Lun. 14/12** | **Décision et commande du renfort de janvier** (reçu le lun. 21/12), selon les commandes payées du 30/11 au 13/12 : moins de 4 → pas de renfort ; de 4 à 9 → renfort léger ; 10 ou plus → renfort complet. Repères : le médian en prévoit 5,2, l'ambitieux 11,3, le prudent 2,1 | Léger : 103 pièces, 722 €. Complet : 182 pièces, 1 564 € (tableau ci-dessous) |
| Mer. 16/12 | Dernier express livrable pour Noël (articles en stock, avant 14 h) | — |
| Avant le ven. 18/12 | Demander à Roly ses jours de fermeture entre Noël et le Nouvel An. S'il ferme, avancer le réassort du 21/12 au ven. 18/12 (reçu le lun. 28/12) | — |
| Lun. 21/12 et 28/12 | Réassort normal si Roly est ouvert (reçus les 29/12 et 05/01) | Petit : creux des fêtes |
| Lun. 04/01 | Lancement « Janvier B2B ». Réassort reçu le lun. 11/01. Le 6/01 est férié en Espagne : +1 jour possible | Retour au max |
| Lun. 01/02 | Décision printemps (polos, tabliers, casquettes ; lancement « Restauration printemps » le 09/02) : commande reçue le lun. 08/02 | À fixer sur les ventes de janvier. Repère : passer ces 3 familles au niveau confortable = 318 pièces, 974 € |

**Renfort de janvier** (haute visibilité, vestes, sweats : les familles poussées en janvier, portées au niveau confortable avec la demande ambitieuse de janvier) :

| Vêtement | Couleurs | Pièces | Coût HT | Dans le renfort léger |
|---|---|---|---|---|
| Gilet HV Beta | Jaune fluo, Orange fluo | 34 | 392,16 € | oui |
| Parka HV Epsilon | Jaune fluo | 9 | 227,61 € | non |
| Sweat Clasica | Noir, Marine, Gris chiné, Blanc | 36 | 227,52 € | oui |
| Softshell Nebraska | Noir, Marine | 16 | 215,04 € | non |
| Veste HV Persei | Jaune fluo | 9 | 132,58 € | non |
| Sweat à capuche Urban | Noir, Marine | 16 | 126,08 € | non |
| Gilet HV Polux | Jaune fluo, Orange fluo | 33 | 102,30 € | oui |
| Polaire Himalaya | Noir, Marine | 13 | 59,41 € | non |
| Polo HV Polaris | Jaune fluo | 8 | 42,12 € | non |
| T-shirt HV Delta | Jaune fluo | 8 | 39,28 € | non |
| **Total** | | **182** | **1 564,10 €** | léger : 103 pièces, 721,98 € |

## 7. Trésorerie et risques

- **Argent immobilisé** : 1 355 € au départ avec le niveau recommandé ; en janvier, jusqu'à 2 077 € avec le renfort léger ou 2 919 € avec le renfort complet. Dans le médian, la simulation donne un stock moyen de 1 254 € sur les 12 semaines, 590 € de réassort acheté pendant la période, et 1 124 € de stock restant fin février. La TVA sur l'achat se récupère ; les conditions de paiement Roly sont à confirmer.
- **Rotation** (combien de fois par an le stock est vendu et racheté) : environ 2,5 fois dans le médian, 5,9 dans l'ambitieux, 0,6 dans le prudent. C'est lent, et c'est attendu pour un stock de service au démarrage ; c'est aussi pourquoi il ne faut pas aller au-delà du recommandé avant d'avoir des ventes.
- **Risque d'invendus** : dans le médian, 67 références sur 120 (608 €) n'auront rien vendu au bout de 12 semaines ; dans le prudent, 103 (1 077 €). Ce sont surtout les couleurs n° 3 et les tailles S et XXL, d'où une seule pièce par taille pour elles. Cet argent n'est pas perdu : ce sont des basiques Roly permanents, revendables en textile vierge et utilisables pour les échantillons et les photos. Risque saisonnier : bonnets après février, parkas, softshells et sweats après l'hiver (à garder pour l'hiver suivant).
- **Coût d'une rupture** (commande perdue) : la marge sur coûts variables (45 % du panier, `docs/ads-strategie.md` § 2.3) plus la publicité déjà payée pour l'obtenir. Médian : panier 113 €, marge 51 € + coût par commande 53 € = **≈ 104 €**. Prudent : 35 € + 113 €. Ambitieux : 69 € + 25 €. Une commande d'équipe de 10 polos perdue, c'est environ 79 € de marge (§ 2.2 de la stratégie).
- **Coût d'un Noël raté** : remboursement possible, et un avis négatif sur un site qui n'en a encore aucun. C'est le risque le plus cher, et le stock le supprime sur les produits stockés.
- **Gain de l'express** : 15 € HT (jusqu'à 10 pièces) à 60 € HT (plus de 30 pièces) par commande express, presque sans coût en plus si l'atelier a de la place. Il n'existe qu'avec du stock.
- **Comparaison simple** : le stock recommandé (1 355 €) correspond à environ 13 commandes perdues dans le médian. Mais il ne se dépense pas : il revient à la vente, alors qu'une commande perdue est perdue.

## 8. Réglages du site recommandés

> **Appliqués sur le site le 23/11** : points 2 (express seulement si tout le panier est en stock, contrôlé aussi au paiement), 3 (+1 jour ouvré pour l'imprimé sur commande, +5 pour le textile vierge, textes CGV, FAQ et assistant mis à jour), 4 (saisie du Polux « M/L », « XL/2XL ») et 6 (seuil d'alerte à 0 par défaut dans le code, e-mail « référence épuisée » ; aucune variable Netlify à créer).

1. **`PRODUCTION_DAYS = 7`, `EXPRESS_DAYS = 4`, `BLANK_DAYS = 2`, `TRANSIT_DAYS = 2` : ne pas toucher.** La promesse standard de 7 jours est vraie même sur commande, l'express à 4 jours est vrai depuis le stock (2 jours de marge), le textile vierge à 2 jours aussi.
2. **Express réservé au stock** : ne proposer l'express que si le suivi de stock est actif et que tout le panier est en stock (dans `CartView`, `anyOnOrder` existe déjà). Le refuser aussi côté serveur (`src/app/api/checkout/route.ts` accepte aujourd'hui `express` sans contrôle). Tant qu'aucun stock n'est saisi, l'express doit être masqué : ce sera le cas le jour du lancement (30/11) si le stock n'arrive que le 01/12.
3. **Délai « sur commande »** : n'ajouter que **1 jour de marge** à l'imprimé standard (les 5 jours Roly sont déjà dans les 7), et garder **+5 jours** pour le textile vierge. Par exemple, dans `deliveryDate` : `onOrder ? (blankOnly ? ON_ORDER_DAYS : 1) : 0`. Mettre à jour les messages « +5 jours ouvrés » (configurateur, panier, assistant) pour afficher le bon chiffre. Passer à 2 jours si vous regroupez les commandes Roly sur 2 jours fixes (§ 5.4).
4. **Corriger la saisie du stock du gilet Polux** : le contrôle des clés dans `setStock` (`src/lib/stock.ts`) refuse la barre « / », donc les tailles « M/L » et « XL/2XL » ne s'enregistrent pas (vérifié par script). Le Polux, produit A, resterait toujours « sur commande ». Autoriser « / » dans ce contrôle.
5. **Saisir tout le stock en une fois, à réception** (page atelier stock, clés `cle_site` du CSV). Dès la première saisie, tout ce qui n'est pas saisi devient « sur commande » : une saisie partielle afficherait des délais faux.
6. **`STOCK_ALERT = 0`** dans les variables Netlify (alerte à l'épuisement d'une référence ; § 5.3).
7. **Noël** : garder la date limite au 24/12 dans `src/lib/seasons.ts` (le site affiche déjà le 10/12, avec un jour de marge). Option de texte : « au plus tard le jeudi 10 décembre, avant 14 h », plus clair que « avant le ».
8. **Option, plus tard** : un message « Noël en express jusqu'au mercredi 16/12, articles en stock » si le stock est en place.

## 9. À confirmer avec Roly

1. **Frais de port** par envoi et **franco** (montant à partir duquel le port est offert) : ils décident du nombre de jours de commande (§ 5.4).
2. **Minimum de commande**, s'il existe.
3. **Heure limite** pour qu'une commande parte le jour même, et fiabilité des 5 jours ouvrés ; effet des jours fériés espagnols (8/12, 6/01) et **fermetures de fin d'année** (entre le 24/12 et le 01/01).
4. **Délai de réassort quand Roly est en rupture** sur une couleur ou une taille. Le client Roly du site (`src/lib/roly.ts`) sait lire le stock Roly et les arrivages prévus, et prévoit pour chaque article un minimum (`moq`) et un pas de commande (`stepqty`) : utile pour vérifier avant de promettre.
5. **Conditionnement des casquettes Mercury, Barny et Wizer** (absentes des grilles) ; pour le bonnet, vente possible à l'unité ou seulement par blister de 10 ; prix carton accordé par couleur et taille, ou en mélangeant les tailles d'une même couleur.
6. **Conditions de paiement** (comptant ou à 30 jours) et possibilité de **retour** d'un stock invendu.
7. **Tailles du gilet Beta** : la grille de prix indique « M/L – XL/2XL » et 3XL, la fiche produit et le site S à 3XL. Vérifier avant de saisir le stock.

## 10. Méthode et limites

- **Scripts** (hors du dépôt, dans le dossier de travail de la session, `scratchpad/stock/`) : `catalog_dump.ts` lit le vrai catalogue (`npx tsx`), `scen.py` lit les scénarios dans `docs/ads-strategie.md`, `roly_pack.py` et `packs.py` lisent les conditionnements dans les grilles Roly (lecture seule), `hyp.py` contient les hypothèses, `model.py` fait le classement et les 3 niveaux, `sim.py` la simulation, `dates.ts` les dates avec le code du site, `report.py` les chiffres et le CSV, `gen_doc.py` ce document.
- **Simulation** : pour chaque jour ouvré du 30/11 au 19/02, un nombre de commandes tiré au hasard autour de la moyenne de la semaine du scénario ; 35 % de commandes de particuliers (1 ou 2 pièces) ; 25 % de commandes avec deux vêtements ; pour les pros, une quantité variable autour du panier moyen de la semaine ; tailles et couleurs tirées selon les courbes ci-dessus ; réassort chaque lundi, reçu 5 jours ouvrés plus tard. 1 000 tirages par niveau et par scénario.
- **Limites** : aucune vente réelle ; les ventes du référencement naturel ne sont pas comptées ; les fermetures de Roly ne sont pas simulées ; la part de commandes qui prendront l'express est inconnue (la simulation donne seulement les commandes où c'est possible) ; les prix d'achat sont ceux du catalogue, les blancs Roly sont souvent un peu moins chers (non compté, plus prudent).
- **Le CSV `docs/stock-depart.csv`** (séparateur « ; », virgule décimale, s'ouvre dans Excel) : une ligne par référence de l'un des niveaux, avec classe, vêtement, référence Roly, couleur et code couleur, taille, conditionnement, coût unitaire, quantités et coûts des 3 niveaux et du renfort de janvier, seuil de recommande et max du niveau recommandé, et la clé à saisir sur le site.
- **Contrôle** : les totaux du CSV (328,20 €, 1 354,67 €, 3 927,29 €, 1 564,10 €) sont égaux à ceux des niveaux et du renfort complet.
