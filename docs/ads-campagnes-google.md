# Campagnes Google Ads alwaan : fiche de création

Compte Google Ads 251-489-2270 · validé par le gérant le 23/11/2026 · extrait de `docs/ads-strategie.md` (sections 5 et 6).

## Décisions de mise en place

**Lancement**
- Les 3 campagnes sont créées **en pause**. Le gérant les active le **lundi 30/11** au matin, après avoir vérifié que la bannière de cookies Shopify est active.
- Pas de date de début automatique : on garde la main si un prérequis manque le 30.

**Budgets quotidiens**

| Campagne | Budget |
|---|---|
| Search – Marque alwaan (existante) | 2 €/j |
| Search – Pro métiers × produit | **30 €/j** |
| Shopping standard – Catalogue | 8 €/j |

- **Réglages communs :**
  - zone France + Belgique, lieu de présence (pas d'intérêt) ;
  - langue français ;
  - enchères CPC manuel avec les CPC max des groupes, jusqu'à 15 conversions « Achat (serveur) », puis passage en « Maximiser les conversions » ;
  - Réseau Display désactivé ; partenaires du Réseau de Recherche désactivés.
- **Objectif de conversion :** « Achat (serveur) », seule action principale.

**Noël : périmètre exact de l'arrêt du 10/12 à 14 h (heure de Paris)**
- Tout ce qui parle de Noël est **regroupé dans un seul groupe d'annonces**, « Noël pro », de la campagne Search – Pro métiers : ses mots-clés, son annonce avec les titres « Cadeaux d'équipe à votre logo » et « Pour Noël : avant le 10/12 », et la description n° 11.
- **Aucun titre ni aucune description de Noël dans les autres groupes.**
- **Arrêt :** règle automatique « Mettre en veille le groupe d'annonces Noël pro », une seule fois, le **jeudi 10/12/2026 à 14 h**.

**Janvier**
- Créer le groupe « Janvier B2B » **en pause**, avec ses mots-clés, ses titres et la description n° 12.
- Règle automatique « Activer le groupe d'annonces Janvier B2B », une seule fois, le **lundi 04/01/2027 à 6 h**.

**Après Noël**
- **11/12 :** budget Search pro passé à 12 €/j.
- **21/12 :** 10 €/j au total.
- **04/01 :** retour à 30 €/j.

Ces changements de budget sont proposés au gérant au fil de l'eau ; ils ne sont pas automatisés.

**Shopping : répartition des produits par étiquette du flux Merchant**
- **Groupes de produits** subdivisés par « Type de produit » (catégorie) : Casquettes, Polos, T-shirts, Sweats, Vestes et polaires, Haute visibilité, Tabliers, Chemises. Les CPC sont dans l'arborescence plus bas.
- **Étiquettes disponibles dans le flux**, pour l'ajustement des enchères :
  - `custom_label_2` = marge : `haute`, `moyenne` ou `basse` ;
  - `custom_label_3` = saison : `hiver`, `ete`, `printemps` ou `toute-annee` ;
  - `custom_label_4` = cible : `pro` ou `mixte`.
- **Au lancement**, à l'intérieur de chaque catégorie : marge `haute` +20 % ; marge `basse` (t-shirts) −20 %.
- **Négatifs Shopping :** liste 5.3.

**Négatifs**
- Créer la liste partagée **« Négatifs alwaan »** (section 5.2) au niveau du compte et l'appliquer aux campagnes Search pro et Shopping.
- Ne pas l'appliquer à la campagne de marque.

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
├─ Search – Pro métiers × produit    30 €/j (30/11 → 10/12), 12 €/j (11 → 20/12), 10 €/j au total avec les autres (21/12 → 03/01), 30 €/j dès le 04/01
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
- Casquettes : « Casquette + logo 6 € HT », « Casquette à votre logo », « Dès 100 pièces : 3,50 € HT/pce »
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
9. Casquette Mercury à votre logo : 6 € HT l'unité, 5,20 € dès 10, 4,50 € dès 30 pièces.
10. Pas de broderie : une impression DTF nette, toutes couleurs, dégradés compris.
11. *(Noël, fin 10/12)* Noël : commandez avant le 10 décembre pour être livré au plus tard le 24, selon le site.
12. *(Janvier)* Nouvelle année, nouvelles tenues : équipez vos équipes dès 1 pièce, maquette en direct.

Interdits rappelés : « livraison 48 h », « livré en 3 jours », « brodé », faux avis, « n° 1 », fausse rareté, fausse réduction, nom de concurrent, code promo inventé. Le gilet HV peut dire « conforme EN ISO 20471 » parce que la fiche Roly l'indique : garder la preuve de conformité du fabricant.

---

