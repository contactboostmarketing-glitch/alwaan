# Référencement naturel : plan annuel alwaan.fr

Principe : publier **6 à 8 semaines avant** chaque pic de recherche (Google met du temps à classer une page),
et entretenir chaque mois ce qui existe. Tout contenu nouveau suit le cocon (docs/seo-cocon.md) :
lien vers sa page mère + 2 à 3 pages sœurs.

## Routine mensuelle (2 à 3 h)
1. **Search Console** : requêtes en hausse, pages en position 5 à 15 (à enrichir en priorité), pages non indexées.
2. **2 guides** du calendrier ci-dessous (1 200 à 1 800 mots, FAQ, liens vers produits et métiers).
3. **1 page** métier, ville ou besoin (selon les requêtes vues dans la Search Console).
4. **Rafraîchir 2 pages** existantes : prix, délais, saison, nouvelles questions des clients (chat IA, WhatsApp).
5. **Maillage** : relier les nouveautés depuis l'accueil saisonnier, les catégories et le pied de page.
6. **Avis** : relire et publier (étoiles Google), répondre aux avis Google Business.
7. **Google Business Profile** : 1 publication par semaine (réalisation, nouveauté, offre).
8. **Liens entrants** : 1 à 2 par mois (annuaires locaux, CCI, clubs et associations clients, fournisseurs, presse locale).
9. **GEO (moteurs IA)** : réponses courtes et factuelles en tête de page, FAQ balisée, chiffres à jour.

---

## Priorités issues de Semrush (analyse du 23/11/2026)

Sources : `docs/ads-recalage-semrush.md` (section 8, 13 opportunités) et `docs/semrush/*.csv` (volumes FR et BE, variantes, mots-clés des concurrents).
Volumes = recherches mensuelles moyennes. KD = difficulté organique Semrush (0 à 100).

**Méthode de classement.** Potentiel = volume FR + BE × intention pro × faisabilité.
- Intention pro : 1 = pro (« entreprise », « travail », « professionnel », « sécurité ») ; 0,5 = mixte (pros et particuliers) ; 0,2 = particuliers.
- Faisabilité : 1 = produits et faits disponibles sur le site ; 0 = produit absent du catalogue (reporté).
- À potentiel proche, la marge d'une commande type (docs/ads-recalage-semrush.md, 2.3) et la difficulté (KD) départagent.

**Comment enrichir une page catégorie.** Ajouter une entrée dans `src/lib/categorySeo.ts` (`CATEGORY_SEO`) : title, H1, description, chapeau, sections visibles, tableau de prix calculé, FAQ. La version anglaise et le flux Google Shopping ne changent pas. Ne jamais saisir un prix à la main : utiliser `unitEur()` ou une ligne `prices`.

### Classement (13 opportunités de l'analyse + 3 repérées dans les CSV)

| Rang | Opportunité | Mots-clés cibles (volume/mois) | Vol. FR+BE | KD | Intention | Potentiel | Marge cde | Page | Quand |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Gilets de sécurité, haute visibilité | gilet de sécurité personnalisé 720 · gilet jaune personnalisé 590 (+ graphies 260 + 260) · personnaliser gilet jaune 390 · gilet fluo personnalisé 320 (+ 170 + 170) · gilet haute visibilité personnalisé 260 · gilet sécurité personnalisé 170 · gilet de sécurité / HV personnalisable 140 + 140 · gilet fluorescent personnalisé 140 · gilet personnalisé association 140 · gilet personnalisé entreprise 90 · gilet réfléchissant personnalisé 90 · gilet orange (fluo) personnalisé 70 + 70 · BE 110 | ≈ 4 200 | 6–16 | pro | 4 200 | 137 € | `/vetements/haute-visibilite-personnalisee` | **Fait le 23/11** |
| 2 | Page hub vêtements de travail | vetement de travail personnalisé 480 (BE 50) · vêtement personnalisé entreprise 590 (BE 40) · personnalisation vetement de travail 210 · vetement de travail personnalisable 210 · vetements de travail personnalisé(s) 90 + 90 · tenue de travail personnalisée 110 · vêtements professionnels personnalisés 90 · vetement de travail personnalisé en ligne / pas cher / professionnel 70 + 70 + 70 · vetement logo entreprise 70 (+ variantes ≈ 200) | ≈ 2 600 | 7–19 | pro | 2 600 | 80 € | `/vetements-de-travail-personnalises` (nouvelle, + `/en/custom-workwear`) | **Fait le 23/11** |
| 3 | Polos d'entreprise | polo entreprise 390 · polo personnalisé entreprise 390 · polos personnalisés entreprise 260 · polo avec logo entreprise 210 · polo entreprise personnalisé 210 · polo(s) publicitaire(s) 210 · polo personnalisé pour entreprise 170 · polo pour entreprise 170 · polo personnalisé avec logo entreprise 110 · polo personnalisé logo 90 · polo personnalisable entreprise 90 · polo floqué entreprise 70 · polo de travail personnalisé 70 | ≈ 2 400 | 7–20 | pro | 2 400 | 72 € | `/vetements/polos-personnalises` | Décembre |
| 4 | Textile publicitaire | textile publicitaire 720 (transactionnel, concurrence 0,42) · vêtement publicitaire 320 · textile pro 140 | ≈ 1 180 | 18–31 | pro | 1 180 | 110 € | nouvelle page `/textile-publicitaire` | Décembre |
| 5 | Tabliers pros et tenue de restaurant | tablier personnalisé professionnel 320 · tablier professionnel personnalisable 260 · tablier serveur personnalisé 170 · tenue restaurant 140 · polo serveur 50 · tablier restaurant / barista personnalisé 20 + 20 · BE : tablier horeca 20, polo horeca 10 | ≈ 1 010 | 5–19 | pro | 1 010 | 40 € | `/vetements/tabliers-personnalises` + `/metiers/restauration` | Janvier |
| 6 | T-shirts d'entreprise et d'association | tee shirt personnalisé entreprise 320 · t-shirt personnalisé entreprise 260 · t shirt personnalisé professionnel 140 · t shirt association 90 · flocage tee shirt pour entreprise 70 · tee shirt personnalisé association 30 | ≈ 910 | 6–34 | pro | 910 | 110 € | `/vetements/t-shirts-personnalises` | Février |
| 7 | Polaires et softshells | polaire personnalisée 720 (mixte) · softshell personnalisée 140 (BE 20) · veste softshell personnalisée 70 · softshell / polaire personnalisée entreprise 30 + 20 | ≈ 1 000 | 10 | mixte / pro | 640 | 110 € | `/vetements/vestes-personnalisees` | Décembre |
| 8 | Casquettes d'entreprise | casquette logo 480 (mixte) · casquette personnalisée logo 170 · casquette personnalisée entreprise 90 · casquette logo entreprise 30 | ≈ 770 | 10–14 | mixte / pro | 530 | 50 € | `/vetements/casquettes-personnalisees` | Février |
| 9 | *Repérée* : sweats d'entreprise | sweat personnalisé entreprise 480 (BE 10) · sweat logo entreprise 30 | ≈ 520 | n.c. | pro | 520 | 110 € | `/vetements/sweats-personnalises` | Décembre |
| 10 | *Repérée* : cadeau client d'entreprise | cadeau client entreprise 590 · cadeau salarié fin d'année 70 | ≈ 660 | 10–18 | mixte (cadeau pas toujours textile) | 330 | n.c. | guide « Cadeau d'entreprise textile » (septembre) | Septembre 2027 |
| 11 | *Repérée* : « pas cher » | polo personnalisé pas cher 480 · gilet de sécurité personnalisé pas cher 90 · vetement de travail personnalisé pas cher 70 | ≈ 640 | 5–18 | mixte | 320 | 72 € | nouveau guide | Décembre |
| 12 | EVJF | tee shirt evjf 1 300 (CPC 0,37) · sweat evjf 30 | ≈ 1 330 | 21 | particuliers (groupes) | 270 | 35 € | `/idees-cadeaux/evjf-evg` | Février |
| 13 | Chemises d'entreprise | chemise personnalisée entreprise 210 | 210 | 8 | pro | 210 | n.c. | `/vetements/chemises-personnalisees` | Décembre |
| 14 | Belgique | t shirt personnalisé belgique 260 (BE) · vetement de travail belgique 70 (BE) · vêtement personnalisé belgique 20 · vetement de travail personnalisé belgique 20 · tablier horeca 20 · polo horeca 10 | ≈ 400 | 0 | mixte | ≈ 200 | — | nouvelle page `/vetements-personnalises-belgique` | Janvier |
| 15 | Grammage des t-shirts | grammage tee shirt 210 · grammage t shirt 170 (th4 1er avec un guide) | 380 | n.c. | informationnelle | 190 | — | nouveau guide `/guides/grammage-t-shirt` | Décembre |
| 16 | Techniques : DTF, flocage, sérigraphie | impression dtf textile 210 · flocage dtf 90 · t shirt dtf 70 · BE : flocage t-shirt 40, flocage textile 40 (« flocage tee shirt » 4 400 : surtout des particuliers qui veulent acheter un flocage) | ≈ 450 | 12–18 | mixte | ≈ 200 | — | nouveau guide comparatif + guide `impression-dtf-avantages` | Janvier |

### Reportés : produit absent du catalogue
- **Gilet sans manches** (bodywarmer) : gilet sans manche personnalisé 210 (KD 6), gilet sans manche personnalisable 70, gilet de travail sans manche personnalisable 50. À créer avec la catégorie, quand la sélection Roly sera importée (le guide de février est reporté d'autant).
- **Doudoune** : doudoune personnalisable entreprise 210. **Bonnet** : bonnet personnalisable 320.

### Écartés
- Vêtements de travail **génériques** non marqués : vetement pro 8 100, vetement de travail 4 400, vêtements de travail 2 400 (KD 59), vetements pour professionnels 1 900. Ce sont des achats d'EPI et de chaussures.
- **Goodies** : goodies personnalisés 4 400, goodies entreprise 3 600 (KD 48 à 69, hors offre).
- **Tabliers cadeaux** : tablier personnalisé 5 400, tablier de cuisine personnalisé 1 900, variantes homme, photo, enfant, barbecue.
- **Transferts DTF** : impression dtf 1 600, papier transfert textile 3 600 (acheteurs de transferts).
- **Broderie et sérigraphie** : alwaan n'en fait pas. On peut seulement les comparer honnêtement au DTF.
- **Volume nul** (pas de page dédiée) :
  - tenue nouvel employé, uniforme entreprise personnalisé ;
  - cadeau de noël salarié, cadeau salarié personnalisé ;
  - tablier boulanger personnalisé, tenue serveur personnalisée ;
  - t-shirt ou polo personnalisé 1 pièce ;
  - pages villes : Lille 10, Bruxelles 20, Liège 20, Tournai et Roubaix 0.

### Ce que les données changent au calendrier
- **Noël 2026** : trop tard pour le référencement naturel. Les dates limites s'affichent déjà sur l'accueil et sur la page hub. Le guide et le bloc « dernière minute » de novembre sont reportés à septembre-octobre 2027, avec « cadeau client entreprise » (590).
- **Janvier B2B** : les guides « Renouveler les tenues » et « Tenue des nouveaux arrivants » visent des requêtes à volume nul. La demande réelle de janvier passe par la page hub, les polos, les sweats et les polaires. Ces pages doivent donc être en ligne en décembre.
- **Page métier boulangerie** : volume nul mesuré. Elle est reportée et remplacée par la page Belgique.
- **Printemps restauration** : les mots « restaurant » ont un volume nul. Ce sont « tablier professionnel », « tablier serveur », « tenue restaurant » et « horeca » qui portent la demande. À publier en janvier, pour être classé avant l'ouverture des terrasses (mi-février à juin).
- **EVJF** : le « Tee-shirt EVJF » (1 300) se travaille sur la page existante `/idees-cadeaux/evjf-evg`, pas avec un guide qui lui ferait concurrence.

---

## Plan des 3 prochains mois

### Fait le 23/11/2026 (passage spécial Semrush)
1. **Page hub** `/vetements-de-travail-personnalises`, version anglaise `/en/custom-workwear` (priorité 1 de la section 8 de `docs/ads-recalage-semrush.md`, demande I7 de l'audit Ads).
   - Title : « Vêtements de travail personnalisés pour entreprise ».
   - H1 : « Vêtements de travail personnalisés à votre logo ».
   - Contenu : réponse directe en tête, 8 catégories avec prix « dès », vêtements par métier, tableau de prix calculé (1, 10 et 30 pièces), commande d'équipe, paiement par virement et devis PDF, 7 questions de FAQ.
   - Données structurées : Service, FAQPage, fil d'Ariane.
   - Liens entrants : accueil, pied de page, fil d'Ariane des 8 catégories, tous les guides, 14 pages villes, page haute visibilité, `llms.txt`.
   - **Ads** : passer l'URL finale du groupe « Vêtements de travail personnalisés » de `/` à cette page, après la mise en ligne.
2. **Page haute visibilité** `/vetements/haute-visibilite-personnalisee`, enrichie via `CATEGORY_SEO`.
   - Title : « Gilet de sécurité et gilet jaune personnalisés ».
   - H1 : « Gilets de sécurité et vêtements haute visibilité personnalisés ».
   - 5 sections : jaune ou orange, emplacement du logo, prix, association et événement, classe 2 ou 3.
   - Tableau de prix calculé et 3 questions de FAQ.
   - Liens : guide EN ISO 20471, préparer son logo, clubs et associations, lien d'équipe, métiers événementiel et BTP, page hub.

### Décembre 2026 (en ligne avant le 18/12, classé pour janvier : renouvellement B2B, hiver)
| Type | Contenu | URL | Title / H1 | Mots-clés (volume) | Maillage |
|---|---|---|---|---|---|
| Page | **Textile publicitaire** (rang 4) : t-shirts, casquettes, sweats et polos pour salons, lancements et événements ; prix calculés (T-shirt Atomic 150 le plus économique) ; FAQ ; version anglaise `/en/promotional-clothing`, comme la page hub | `/textile-publicitaire` | « Textile publicitaire personnalisé dès 1 pièce » / « Textile publicitaire à votre logo » | textile publicitaire 720, vêtement publicitaire 320, textile pro 140, polo publicitaire 210 | Depuis : page hub, t-shirts, casquettes, métier événementiel, pied de page. Vers : t-shirts, casquettes, polos, sweats, guide t-shirt association, clubs |
| Rafraîchir | **Polos d'entreprise** (rang 3) : section « Polo publicitaire ou polo de travail », tableau de prix (Polo Pegaso : 13,60 € HT à l'unité, 12,00 € HT dès 30, calculé), FAQ « polo avec logo d'entreprise » et « brodé ou imprimé ? » (DTF uniquement) | `/vetements/polos-personnalises` | « Polos d'entreprise personnalisés à votre logo » / « Polos personnalisés pour entreprise » | polo entreprise 390, polo personnalisé entreprise 390, polos personnalisés entreprise 260, polo avec logo entreprise 210, polo publicitaire 210 | Vers : guide grammage-polo-travail, métiers restauration et hôtellerie, page hub, future page textile publicitaire |
| Rafraîchir | **Polaires et softshells** (rang 7) : « polaire » dans le title et le H1, section « polaire, softshell ou veste », tableau de prix | `/vetements/vestes-personnalisees` | « Polaire personnalisée, softshell et veste à logo » / « Polaires, softshells et vestes personnalisées » | polaire personnalisée 720, softshell personnalisée 140, veste softshell personnalisée 70 | Vers : métier BTP, haute visibilité, sweats |
| Rafraîchir (rapide) | **Sweats d'entreprise** (rang 9) : title, H1, chapeau, 2 questions | `/vetements/sweats-personnalises` | « Sweat personnalisé entreprise à votre logo » / « Sweats personnalisés pour entreprise » | sweat personnalisé entreprise 480, sweat logo entreprise 30 | Vers : vestes, page hub |
| Rafraîchir (rapide) | **Chemises d'entreprise** (rang 13) : title, H1, chapeau | `/vetements/chemises-personnalisees` | « Chemises d'entreprise personnalisées à votre logo » / « Chemises personnalisées pour entreprise » | chemise personnalisée entreprise 210 | Vers : métier hôtellerie, polos |
| Guide | **Quel grammage pour un t-shirt ?** (rang 15) : repères de grammage et usage (ponctuel ou quotidien), avec les grammages réels du catalogue lus dans `rolyInfo.ts` (Atomic 150 et Fox 150 g/m², Dogo 165 g/m² ; `catalog.ts` indique encore 160 et 180 g/m² : à corriger avant d'écrire) | `/guides/grammage-t-shirt` | « Quel grammage choisir pour un t-shirt personnalisé ? » | grammage tee shirt 210, grammage t shirt 170 | Catégories : t-shirts. Voisins : grammage-polo-travail, t-shirt-personnalise-association-evenement, prix-vetement-personnalise-quantite (et réciproquement) |
| Guide | **Polo personnalisé pas cher : ce qui fait vraiment le prix** (rang 11) : leviers réels (modèle, emplacements, palier de 30 pièces, cumul au même logo) ; aucune promesse de prix plancher | `/guides/polo-personnalise-pas-cher` | « Polo personnalisé pas cher : comment payer le juste prix » | polo personnalisé pas cher 480, gilet de sécurité personnalisé pas cher 90, vetement de travail personnalisé pas cher 70 | Catégories : polos, t-shirts. Voisins : prix-vetement-personnalise-quantite, grammage-polo-travail, taille-vetement-equipe |
| Bilan | Bilan annuel (Search Console) : positions de la page hub et de la page haute visibilité | — | — | — | — |

### Janvier 2027 (classé pour mars et avril : printemps restauration, terrasses, saisonniers)
| Type | Contenu | URL | Title / H1 | Mots-clés (volume) | Maillage |
|---|---|---|---|---|---|
| Page | **Vêtements personnalisés en Belgique** (rang 14) : mêmes tarifs de livraison (`catalog.ts`), TVA en autoliquidation pour les pros avec un numéro valide (`legalTexts.ts`), horeca, liens vers Tournai, Mouscron, Bruxelles (remplace la page boulangerie, et la page « Livraison en Belgique » d'avril) | `/vetements-personnalises-belgique` | « Vêtements personnalisés en Belgique, livrés depuis le Nord » / « Vêtements personnalisés livrés en Belgique » | t shirt personnalisé belgique 260 (BE), vetement de travail belgique 70 (BE), vêtement personnalisé belgique 20, vetement de travail personnalisé belgique 20, tablier horeca 20, polo horeca 10 | Depuis : pied de page (« Nous livrons »), pages Tournai, Mouscron, Bruxelles, page hub (FAQ Belgique). Vers : page hub, tabliers, restauration |
| Rafraîchir | **Tabliers professionnels** (rang 5) : sections « tablier de serveur, de bar ou de cuisine », mention horeca, tableau de prix (Tablier Benoit et Tablier Mini, calculés), FAQ. Ne pas viser les requêtes cadeaux | `/vetements/tabliers-personnalises` | « Tablier personnalisé professionnel à votre logo » / « Tabliers professionnels personnalisés » | tablier personnalisé professionnel 320, tablier professionnel personnalisable 260, tablier serveur personnalisé 170, tablier horeca 20 | Vers : guide tablier-personnalise-quel-modele, métier restauration, polos |
| Rafraîchir | **Métier restauration** : créer `SECTOR_SEO`, sur le même modèle que `CATEGORY_SEO`, dans `SectorView` ; H1 et chapeau orientés « tenue de restaurant », FAQ polo serveur et horeca | `/metiers/restauration` | « Tenue de restaurant personnalisée : polos, tabliers, casquettes » | tenue restaurant 140, polo serveur 50, polo horeca 10 | Vers : tabliers, polos, guide tenue-restaurant-personnalisee (ajouter une question sur le polo serveur) |
| Guide | **DTF, flocage ou sérigraphie : quelle différence ?** (rang 16) : comparaison honnête ; alwaan n'imprime qu'en DTF ; enrichir aussi `impression-dtf-avantages` (questions « flocage DTF », « t-shirt DTF ») | `/guides/dtf-flocage-serigraphie` | « DTF, flocage ou sérigraphie : quelle technique pour vos t-shirts ? » | flocage dtf 90, t shirt dtf 70, impression dtf textile 210, flocage textile 40 (BE) | Voisins : impression-dtf-avantages, dtf-ou-broderie, preparer-logo-impression |
| Guide | **Renouveler les tenues et équiper les nouveaux arrivants** : fusion des 2 guides de janvier ; volume mesuré nul, priorité basse ; utile au message Ads de janvier. Si le temps manque : guide « Entretenir un vêtement imprimé » (préventif) | `/guides/renouveler-tenues-de-travail` | « Renouveler les tenues de travail : quand et comment » | (long terme, sans volume mesuré) | Catégories : polos, sweats. Voisins : taille-vetement-equipe, prix-…, page hub |

### Février 2027 (classé pour avril et mai : événements, festivals, EVJF, beaux jours)
| Type | Contenu | URL | Title / H1 | Mots-clés (volume) | Maillage |
|---|---|---|---|---|---|
| Page | **Métier artisans** (prévu au calendrier) : à créer seulement si la Search Console montre des requêtes ; le volume Semrush est faible (vetement de travail batiment personnalisé 30). Sinon, la remplacer par une page « Festival et événements » | `/metiers/artisans` | « Vêtements de travail personnalisés pour artisans » | à confirmer | Vers : page hub, haute visibilité, polos, vestes |
| Rafraîchir | **T-shirts d'entreprise et d'association** (rang 6) : section « t-shirts d'entreprise », section « t-shirts d'association » ; KD 31 à 34, à commencer tôt | `/vetements/t-shirts-personnalises` | « T-shirts personnalisés entreprise et association » / « T-shirts personnalisés dès 1 pièce » (garder) | tee shirt personnalisé entreprise 320, t-shirt personnalisé entreprise 260, t shirt personnalisé professionnel 140, t shirt association 90 | Vers : clubs et associations, guide t-shirt-personnalise-association-evenement, future page textile publicitaire |
| Rafraîchir | **Casquettes d'entreprise** (rang 8) : « casquette logo entreprise » dans le title, prix dégressif jusqu'à 100 pièces (calculé) | `/vetements/casquettes-personnalisees` | « Casquette personnalisée logo entreprise » / « Casquettes personnalisées à votre logo » | casquette logo 480, casquette personnalisée logo 170, casquette personnalisée entreprise 90 | Vers : t-shirts, textile publicitaire, métier restauration |
| Rafraîchir | **EVJF** (rang 12) : title et H1 « Tee-shirt EVJF personnalisé », date limite pour les mariages de mai et juin | `/idees-cadeaux/evjf-evg` | « Tee-shirt EVJF personnalisé : Team Bride et Team Groom » | tee shirt evjf 1 300 | Vers : t-shirts, casquettes |
| Guide | **Casquette personnalisée : modèles et marquage** (avancé de mai) : informatif, sans concurrencer la page casquettes | `/guides/casquette-personnalisee-modeles` | « Casquette personnalisée : quel modèle et quel marquage ? » | casquette logo 480 (part informative) | Voisins : impression-dtf-avantages, t-shirt-personnalise-association-evenement |
| Guide | **T-shirts pour festival et bénévoles** (avancé d'avril) : en ligne 8 semaines avant les festivals | `/guides/t-shirts-festival-benevoles` | « T-shirts pour festival et bénévoles : modèles, délais, budget » | t shirt association 90 (part informative) | Voisins : t-shirt-personnalise-association-evenement, grammage-t-shirt, taille-vetement-equipe |

---

## Calendrier éditorial (date = mise en ligne)

| Mois | Pic visé | Contenus à publier |
|---|---|---|
| Janvier | Printemps restauration, Belgique | Voir « Plan des 3 prochains mois » (page Belgique, tabliers pros, métier restauration, guide DTF, flocage ou sérigraphie, guide renouvellement) |
| Février | Événements, EVJF, beaux jours | Voir « Plan des 3 prochains mois » (t-shirts d'entreprise, casquettes, EVJF, guides casquette et festival). ~~Guide « Gilet sans manches »~~ reporté : produit absent |
| Mars | Mariages, EVJF, fin de saison des clubs | Guide « Vêtement de travail en petite quantité » (sans concurrencer la page hub) · ~~Guide « T-shirts EVJF et EVG »~~ remplacé par la page EVJF (février) |
| Avril | Festivals, événements d'été, fête des mères | Guide « Polo de serveur et tenue de saisonnier » (avancé de juillet) · ~~Page « Livraison en Belgique »~~ faite en janvier |
| Mai | Fête des pères, été, kermesses | Guide « T-shirts de kermesse et fin d'année scolaire » · ~~Guide « Casquette »~~ avancé en février |
| Juin | Rentrée des clubs (licences en septembre), chantiers l'été | Guide « Équiper son club pour la nouvelle saison » · Guide « Tenue de chantier en été : t-shirts haute visibilité » |
| Juillet | Rentrée des pros, saisonniers | Rafraîchir pages restauration et hôtellerie |
| Août | Forums des associations (septembre) | Guide « Association : financer ses tenues avec une boutique en ligne » · Rafraîchir page clubs et associations |
| Septembre | Cadeaux d'entreprise de Noël, Halloween, sweats | Guide « Cadeau d'entreprise textile : idées et budget » (cadeau client entreprise 590, cadeau salarié fin d'année 70) · Guide « Sweat à capuche personnalisé pour entreprise » (sweat personnalisé entreprise 480) |
| Octobre | Noël (pros et particuliers), marchés de Noël | Guide « Tenues de fêtes et marchés de Noël » · Rafraîchir idées cadeaux (dates limites de commande) |
| Novembre | Dernière ligne droite de Noël | Guide « Commander avant Noël : les dates à retenir » · Page ou bloc « Cadeau de dernière minute » (2026 : remplacés par le passage Semrush, voir ci-dessus) |
| Décembre | Nouvelle année | Voir « Plan des 3 prochains mois » (textile publicitaire, polos, polaires, sweats, chemises, guides grammage et « pas cher ») · Bilan annuel (Search Console) |

## Pages locales
14 villes en ligne (/vetements-personnalises/…). En ajouter seulement quand la Search Console montre
des recherches réelles (ex. « t-shirt personnalisé Béthune »), avec un angle local vrai.
Semrush (11/2026) : volumes nuls ou presque pour les villes (Lille 10, Bruxelles 20, Liège 20). La page Belgique (janvier) sert de hub aux 3 villes belges.

## À débloquer
- Catalogue vestes sans manches (gilet sans manches personnalisé 210, KD 6), doudounes (210), bonnets (320) → catégories et guides associés.
- Vraies photos produits et réalisations → images optimisées (texte alternatif, nom de fichier).

## Indicateurs (tableau de bord + Search Console)
Clics et impressions organiques, pages en top 3 / top 10, commandes de source « direct / organique »,
nombre d'avis publiés et note moyenne.
Suivi spécifique Semrush : positions de « gilet de sécurité personnalisé », « gilet jaune personnalisé »,
« vetement de travail personnalisé », « vêtement personnalisé entreprise », « polo entreprise » (relevé mensuel dans la Search Console).
