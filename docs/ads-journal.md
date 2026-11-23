# Journal acquisition payante alwaan.fr

Entrée la plus récente en haut. Pas de donnée personnelle ici. Stratégie de référence : `docs/ads-strategie.md`.

## Tests en cours
Aucun.

## Demandes en attente
| Date | Pour | Demande | Priorité | État |
|---|---|---|---|---|
| 23/11/2026 | Informaticien | Conversion « Achat (serveur) » vers Google Ads depuis le webhook (gclid, valeur HT, n° de commande, virements compris, rétractations) ; pixel Shopify en secondaire | P0 | Fait le 23/11 (import planifié). Restent les rétractations (I8) et gbraid/wbraid (I3) |
| 23/11/2026 | Informaticien | GA4 : identifiants + API secret, vérification des événements | P0 | Ouvert |
| 23/11/2026 | Informaticien / gérant | Bannière de confidentialité Shopify active sur le checkout (FR, BE) ; pixel « Google Ads alwaan » connecté | P0 | Ouvert |
| 23/11/2026 | Informaticien | Conversion Stripe de secours : ajouter la valeur HT | P0 | Ouvert |
| 23/11/2026 | Informaticien + gérant | Achat test réel visible dans Google Ads, puis remboursement et rétractation | P0 | Ouvert |
| 23/11/2026 | Informaticien | Flux : custom_label 2/3/4 (marge, saison, cible), taille valide, images sur alwaan.fr, Offer au prix du flux (lowPrice 14,40 contre 16,32), diffusion BE | P1 | Labels et Offer faits le 23/11 ; restent taille (I9) et images (I6) |
| 23/11/2026 | Informaticien | Micro-conversions : devis /devis, lien d'équipe, boutique club, clic WhatsApp | P1 | Ouvert |
| 23/11/2026 | Informaticien | Pages : « Nouvelles tenues 2027 » (04/01), « Restauration printemps » (09/02) | P1 | Ouvert |
| 23/11/2026 | Gérant | Coût réel du marquage DTF et de la main-d'œuvre (hypothèses : 0,40 € / 1,50 € par zone, 1,00 € + 0,40 € par zone) ; port réel ; coûts Wizer et Barny ; tarifs Roly définitifs | — | Marquage reçu (≈ 2 € par zone) ; restent port réel, Wizer, Barny, tarifs Roly |
| 23/11/2026 | Gérant | Part acceptable de la marge pour la pub (35 % proposé ; équilibre accepté pendant l'apprentissage déc.–janv.) | — | Validé le 23/11 |
| 23/11/2026 | Gérant | Validation écrite du budget de décembre : 630 € (30/11 → 03/01) | — | Validé le 23/11, relevé à 30 €/j sur Search pro ; total 800 ou 980 € à confirmer (audit B3) |
| 23/11/2026 | Gérant | Accord de principe pour créer le compte Meta Business (reciblage en janvier, 70 €) | — | Ouvert |
| 23/11/2026 | Informaticien | I1 : ventes par utm_campaign / utm_content / utm_term, avec ou sans gclid (ROAS réel malgré le refus de consentement) | P0 | Ouvert |
| 23/11/2026 | Informaticien | I2 : fiche produit, « dès … la pièce » avec la quantité + prix à 1 pièce et paliers visibles sans interaction | P0 | Ouvert |
| 23/11/2026 | Informaticien | I3 bis : bandeau date limite de Noël sur les pages catégorie, métiers et villes jusqu'au 10/12 | P0 | Ouvert |
| 23/11/2026 | Informaticien | I3 : colonnes GBRAID / WBRAID dans l'export des conversions (ou API) | P1 | Ouvert |
| 23/11/2026 | Informaticien | I4 : conversion secondaire « Demande de devis » + attribution jointe aux demandes de devis | P1 | Ouvert |
| 23/11/2026 | Informaticien | I6 à I11 : images via le CDN, page hub travail, rétractations, tailles, TVA B2B Belgique, réassurance (voir `docs/ads-audit-prelancement.md`) | P2 | Ouvert |
| 23/11/2026 | Agent navigateur | Check-list C1 à C12 de `docs/ads-audit-prelancement.md` avant le 30/11 (campagnes en pause) | — | Ouvert |
| 23/11/2026 | Gérant | Décisions audit : budget décembre 800 ou 980 € ; seuils par groupe à 1,5 × CPA d'équilibre ; CPC Clubs 1,20 € ; « Maximiser la valeur » au lieu de « Maximiser les conversions » ; pixel Shopify déconnecté si la bannière n'est pas prête | — | Ouvert |
| 23/11/2026 | Agent navigateur | Check-list C13 à C22 de `docs/ads-recalage-semrush.md` (restructuration en 7 groupes, campagne Génériques à 3 €/j, nouveaux mots-clés, négatifs, annonces, règles), après C1 à C12 | — | Ouvert |
| 23/11/2026 | Gérant | Décisions recalage : 7 groupes + suppression de Local, Noël et Janvier ; option Noël par annonces ; Génériques 3 €/j (Search pro 27 €/j, total inchangé) ; CPC T-shirts 1,50 € ; polos 1,30 puis 1,50 € | — | Ouvert |
| 23/11/2026 | Agent SEO | 13 opportunités SEO (section 8 de `docs/ads-recalage-semrush.md`), en priorité la page hub vêtements de travail, la page HV « gilet de sécurité / gilet jaune » et la page polos « entreprise » | — | Ouvert |

---

## 23/11/2026 (nuit) : recalage sur les données Semrush

**Données lues (Semrush, environ 7 700 unités consommées sur ce passage, 40 150 restantes)** : volumes Belgique sur 36 mots-clés ; concurrents payants de maboutiquepro.com ; mots-clés achetés par th4.com, teamshirts.fr et vetementpro.com (30 chacun) ; variantes en requête large de « vetement de travail personnalisé », « polo entreprise », « gilet personnalisé », « logo entreprise vetement », « tablier personnalisé » ; volumes FR de 42 mots-clés candidats ; 10 textes d'annonces de maboutiquepro.com. Plus les données du coordinateur (57 mots-clés FR, annonceurs, maboutiquepro et graphywest). Bruts dans `docs/semrush/`.

**Constats**
- Groupes sans volume : Restauration (sauf tabliers pros), Clubs, Local Nord/BE, Noël pro, Janvier B2B. Ils n'auraient reçu aucun clic.
- Vraie demande pro ≈ 13 000 recherches/mois (FR + BE) :
  - HV ≈ 4 200 (gilet de sécurité 720, gilet jaune 590) ;
  - vêtements de travail personnalisés ≈ 2 600 ;
  - polos « entreprise » ≈ 2 400 ;
  - t-shirts entreprise et textile publicitaire ≈ 2 000 ;
  - tabliers pros ≈ 860 ; sweats et vestes ≈ 800.
- Belgique : demande pro faible (de 20 à 50 par terme), terme local « horeca ». Pas de groupe dédié.
- Génériques « vêtement de travail / vêtement pro » : achats de vêtements non marqués (vetementpro.com), à exclure en exact.
- « tablier personnalisé » (5 400) = cadeaux de particuliers, confirmé par les variantes (homme, photo, barbecue).
- La demande pro solvable ne consomme qu'environ **14 à 18 €/j** sur les 30 €/j de Search. Décembre réel probable ≈ 550 à 650 €.
- Concurrents :
  - maboutiquepro : « dès 1 pièce, sans frais fixes, imprimé en France » ;
  - graphywest : « N°1, dès 10 pièces » ;
  - th4 et teamshirts : marques concurrentes, transferts DTF, maillots.
  - Nos angles : maquette et prix en direct, lien d'équipe, sans frais de préparation, atelier à Haubourdin, devis PDF, express en 4 jours ouvrés (option).

**Décisions proposées (campagnes toujours en pause)**
- Search pro en 7 groupes ; Local, Noël et Janvier supprimés ; Noël et Janvier passent par des annonces étiquetées avec des règles.
- Campagne « Search – Génériques », en exact, plafonnée à 3 €/j : [polo personnalisé], [casquette personnalisée], [sweat personnalisé], [polaire personnalisée], [casquette logo].
- CPC max : HV 1,50 ; Vêtements de travail 1,40 ; Polos entreprise 1,30 ; T-shirts 1,50 (à valider) ; Sweats et vestes 1,50 ; Casquettes 0,90 ; Tabliers 0,90. Ces valeurs remplacent l'audit.
- Négatifs : sérigraphie, transferts, gilets hors sujet, polo automobile, sport, 18 marques concurrentes, vêtements de travail génériques en exact.

**Budgets validés** : inchangés. Le total Search reste à 30 €/j (27 + 3), et rien n'est dépensé.

**Prochaine étape** :
- validation du gérant (section 9 de `docs/ads-recalage-semrush.md`) ;
- l'agent navigateur applique C1 à C22 ;
- le 30/11 : activation et test de bout en bout ;
- après 7 jours : comparer les clics réels aux estimations de la section 6.

---

## 23/11/2026 (soir) : audit pré-lancement des campagnes Google Ads

**Données lues** : `docs/ads-campagnes-google.md` (décisions validées) ; état rapporté par l'agent navigateur (3 campagnes en pause, « Achat (serveur) » principale en import planifié, Merchant « compte pas encore configuré », extrait « Types », plus de ciblage par langue, brouillon à supprimer, bannière Shopify non confirmée) ; `src/lib/adsConversions.ts`, `track.ts`, `CookieBanner.tsx`, `QuoteForm.tsx`, `Configurator.tsx` ; flux relu (labels 2/3/4 présents, une seule valeur de marge par catégorie, tailles encore en plages) ; 16 pages d'atterrissage (200, 0,2 à 0,36 s ; accueil 0,75 s ; `/metiers` et `/vetements-personnalises` en 404).

**Marges recalculées** avec le coût réel du marquage (≈ 2 € par zone ; Mercury 1,12 € tout compris) : taux moyen ≈ 43 % ; ROAS d'équilibre ≈ 2,3, cible (35 %) ≈ 6,6. Casquettes de 57 à 65 % ; t-shirts Atomic à 50 pièces : 29 %.

**Constats principaux** (détail et check-list dans `docs/ads-audit-prelancement.md`)
- Mesure : le gclid n'est transmis qu'avec l'accord publicité, donc 30 à 45 % des ventes payantes sont attendues hors de « Achat (serveur) ». Correctif : suffixe UTM au niveau du compte + ventilation UTM dans les insights (I1). gbraid et wbraid ne sont pas exportés (I3). Aucun test de bout en bout : prévu le 30/11 avec une commande réelle utile.
- Mots-clés génériques à forte part de particuliers ([polo personnalisé], casquette personnalisée, tablier personnalisé, tablier logo, sweat personnalisé logo noël) : estimés à 30 à 40 % de la dépense Search pro en décembre, pour un ROAS d'environ 0,4.
- Négatif « 1 € » : risque de bloquer « 1 pièce ». À supprimer.
- Automatismes Google (recommandations auto, ressources générées, AI Max) à désactiver.
- Règle Noël : passer de 14 h à 12 h (exécution possible jusqu'à 1 h après l'heure prévue). Baisses de budget à automatiser par des règles.
- Prix d'annonce non visibles sur les pages (13,60 €, 5,50 €, 8,78 €) : à remplacer par des prix « dès … (quantité) » visibles. Fiche produit : « dès … la pièce » sans quantité (I2, promesse).
- Le groupe Noël pointe vers une page sans la date limite : URL → accueil.
- Shopping : bloqué par Merchant. Les étiquettes de marge n'ont qu'une valeur par catégorie, donc les « +20 % / −20 % » sont sans effet : enchères par catégorie à la place.
- Seuil « 60 € par groupe » trop serré : environ 50 % de chances de couper un groupe rentable à l'équilibre. Proposé : 1,5 × CPA d'équilibre par groupe ; le seuil de compte de 400 € reste inchangé.
- « Maximiser les conversions » favoriserait les petites commandes de particuliers. Proposé : « Maximiser la valeur de conversion », puis un ROAS cible de 250 % à partir de 30 conversions.
- Écart de budget de décembre : 800 € (fiche) contre 980 € (journal).

**Décisions prises (baisses autorisées, à appliquer par l'agent navigateur, campagnes toujours en pause)** :
- CPC max : Tenue 1,20 ; Polos 1,00 ; Restauration 1,00 ; Casquettes 0,70 ; Janvier 1,20 ; [polo personnalisé] et « casquette personnalisée » 0,55 ;
- pause de « tablier personnalisé » et « tablier logo » jusqu'au 15/01 ;
- enchères Shopping par catégorie (0,20 à 0,50 €) ;
- mobile −20 %, week-end −30 %, nuit exclue ;
- zones Nord, Pas-de-Calais, Hainaut et Bruxelles à +15 % (ajustement géographique à confirmer par le gérant, car c'est une hausse ciblée).

**En attente de validation du gérant** :
- budget de décembre, 800 ou 980 € ;
- seuils révisés ;
- CPC Clubs 1,20 € ;
- stratégie « Maximiser la valeur » ;
- +15 % géographique ;
- pixel Shopify déconnecté si la bannière n'est pas prête lundi.

**Impact estimé des correctifs (30/11 → 20/12)** : ROAS d'environ 1,45 à environ 1,85 ; marge nette d'environ −235 € à environ −115 €, soit environ +120 €.

**Budgets validés** : inchangés (rien n'est dépensé, campagnes en pause).

**Prochaine étape** :
- vérifier la check-list C1 à C12 ;
- le 30/11 : activation, puis test de bout en bout ;
- du 01 au 02/12 : contrôle de l'import ;
- le 04/12 : 1er bilan hebdomadaire.

---

## 23/11/2026 : premier passage (audit et stratégie de lancement)

**Données lues**
- Insights 90 j (depuis le 25/08) : saison `noel` ; 0 commande, 0 avis, 0 devis, 0 question, 0 rupture. La commande test #1001 (payée puis annulée) est exclue.
- Flux Merchant : 95 articles, 23 modèles, tous en stock. Prix TTC à 1 pièce avec logo cœur, cohérents avec `catalog.ts` (ex. Polo Pegaso 16,32 € TTC, Mercury 6,60 € TTC).
- Code : `catalog.ts`, `pricing.ts`, `seasons.ts`, `delivery.ts`, `Tracking.tsx`, `track.ts`, `conversions.ts`, webhook Shopify, pixel Shopify, `merci/Conversion.tsx`.
- Site : « Commandez avant le jeu. 10 déc. pour être livré au plus tard le 24 décembre ». Données structurées produit : AggregateOffer lowPrice 14,40 €.

**Constats**
- Mesure insuffisante pour dépenser. Checkout Shopify sur un autre domaine : le pixel n'a pas le gclid, il dépend du consentement côté Shopify, et les commandes par virement ne sont pas captées. Pas d'envoi serveur vers Google Ads. GA4 et Meta inactifs (variables absentes). Conversion Stripe sans valeur.
- Marge sur coûts variables d'environ 45 % (hypothèses DTF et main-d'œuvre non validées). ROAS d'équilibre 2,2, ROAS cible 6,3 (35 %). CPA max pour un panier pro de 10 pièces : 28 à 57 € ; pour un particulier à 1 ou 2 pièces : 3 à 6 €.

**Décisions (propositions, rien n'est activé)**
- Aucune dépense tant qu'un achat n'est pas visible côté serveur dans Google Ads.
- Le payant cible les pros et les clubs. Pas de Search « cadeau particulier ». Particuliers seulement via Shopping avec des enchères basses.
- Shopping standard plutôt que Performance Max au lancement (comparaison en mars, après 30 conversions).
- Campagne « Search – Marque alwaan » laissée **en pause** ; réactivation proposée à 2 €/j après validation.
- Annonces « Noël » limitées au 10/12, 14 h (date du site).

**Budgets proposés (à valider)**
- Décembre (30/11 → 03/01) : 630 € Google (marque 2 €/j, Search pro 15 €/j, Shopping 8 €/j, puis 10 €/j au total du 21/12 au 03/01).
- Janvier : 1 050 € (Google 980 €, Meta reciblage 70 € si pixel). Février : 1 225 € (Google 910 €, Meta 315 €). Total sur 12 semaines : 2 905 €.
- Prévisions sur 12 semaines : prudent −1 238 € de marge nette (seuils déclenchés, 1 785 € dépensés) ; médian −115 € (55 commandes, 6 200 € HT) ; ambitieux +5 108 € (116 commandes, 17 806 € HT).

**Budgets validés** : aucun.

**Seuils d'arrêt retenus** : 400 € cumulés sans commande payée → tout en pause sauf la marque ; groupe Search à 60 € sans commande ni devis → pause ; ROAS 14 j < 1,0 → budget −50 %.

**Apprentissages** : aucun pour l'instant (pas de données).

**Prochaine étape** : vérifier l'avancement des P0 et l'achat test ; contrôler les CPC estimés du Planificateur de mots-clés ; lancement possible le lundi 30/11 si tout est validé.

---

## 23/11/2026 (suite) : validations du gérant

**Validé par écrit par le gérant**
- Budgets du plan : décembre, janvier et février **validés**.
- **Décembre relevé** : Search pro à **30 €/j** (au lieu de 15 €/j). Budget de décembre recalculé :
  - du 30/11 au 20/12 (21 jours) : marque 2 €/j + Search pro 30 €/j + Shopping 8 €/j = 40 €/j, soit **840 €** ;
  - du 21/12 au 03/01 (14 jours) : 10 €/j au total, soit **140 €** ;
  - **total décembre ≈ 980 €** (au lieu de 630 €). Janvier 1 050 €, février 1 225 € inchangés. Total 12 semaines ≈ **3 255 €**.
- **Coût réel marquage** : environ **4 € HT** de main-d'œuvre + impression pour un **cœur + dos** (≈ 2 € par zone). Remplace les hypothèses DTF + main-d'œuvre de la section 2.1 (plus favorable sur les grands visuels).
- Casquette Mercury : coût réel **1,12 € HT avec marquage**.
- Part de la marge accordée à la pub : 35 % (cible), équilibre accepté pendant l'apprentissage de décembre.

**Mis en place sur le site (P0/P1, 23/11)**
- Conversion « Achat » côté serveur : chaque commande payée (carte ou virement pro reçu) enregistre gclid/gbraid/wbraid et la date de paiement. Fichier d'import planifié pour Google Ads : `/api/ads/conversions?k=…` (adresse complète : `GET /api/ads/conversions?url` avec la clé de synchro). Commandes annulées exclues automatiquement (webhook orders/cancelled).
- Flux Merchant : `custom_label_2` marge (haute / moyenne / basse), `custom_label_3` saison, `custom_label_4` cible (pro / mixte) ; description des casquettes avec le prix dégressif.
- Données structurées produit : `Offer` au prix TTC du flux (1 pièce, logo à l'emplacement par défaut), fin de l'écart avec Merchant Center.

**Reste à faire avant la première dépense (côté gérant, dans les comptes)**
- Google Ads : créer l'action « Achat (serveur) » (Importer > Clics, principale), passer « Achat » (pixel Shopify) en secondaire, programmer l'import quotidien depuis l'URL HTTPS.
- Shopify : activer la bannière de confidentialité (France, Belgique) et vérifier que le pixel « Google Ads alwaan » est « Connecté ».
- Achat test après clic sur annonce, puis vérification dans Google Ads (jusqu'à 24 h).
- Création des campagnes selon la section 6, réactivation de « Marque alwaan » à 2 €/j.

**Seuils d'arrêt** : inchangés (400 € sans commande → pause sauf marque ; 60 € par groupe sans commande ni devis → pause ; ROAS 14 j < 1,0 → −50 %). Avec 30 €/j sur le Search pro, le seuil de 400 € peut être atteint vers le 10/12 : point obligatoire à cette date.

**23/11 (fin de journée) : mesure serveur en place**
- Google Ads : action « Achat (serveur) » créée (principale, hors ligne, valeurs différentes, toutes les conversions) ; « Achat » (balise / pixel Shopify) passée en secondaire.
- Import planifié via le Gestionnaire de données : connexion HTTPS « alwaan - ventes (serveur) », fichier `/feeds/conversions/<clé>-ventes.csv`, chaque jour entre 3 h et 4 h (Paris). Colonnes : Google Click ID, Conversion Time (ISO avec fuseau), Conversion Value (HT), Conversion Currency, Order ID.
- Tant qu'il n'y a aucune vente issue d'une annonce, le fichier contient une ligne d'exemple au GCLID invalide (rejetée chaque jour, aucune conversion comptée) : avertissement normal.
- Campagne « Marque alwaan » toujours en pause. Reste : bannière de confidentialité Shopify, création des campagnes (section 6), lancement prévu le 30/11.

**23/11 (soir) : demandes P0 de l'audit réalisées sur le site**
- I1 : chaque commande enregistre ses UTM (source, medium, campagne, groupe = utm_content, mot-clé = utm_term). Insights : `commandes.parCampagne` (commandes, CA HT, avec / sans gclid). « google / cpc » compté en Google Ads même sans gclid. Suffixe d'URL finale à poser au niveau du compte : `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}`.
- I2 : fiche produit « dès X € HT la pièce à partir de N pièces, logo compris · Y € HT à l'unité » (aussi dans le rendu serveur) ; tableau des paliers inchangé.
- I3 bis : bandeau « Noël : commandez avant le … pour être livré au plus tard le 24 décembre » sur les pages produits, catégories, métiers et villes (FR et EN), calculé à la date du jour ; disparaît après la date limite.
- En attente du gérant : budget de décembre (800 € recommandé ou 980 €), seuils par groupe, hausses CPC Clubs / zones Nord-Belgique, bannière cookies Shopify.

**23/11 (nuit) : décisions finales avant lancement**
- Budget de décembre **980 €** retenu par le gérant : 40 €/j du 30/11 au 20/12 (Search pro 30 €, Shopping 8 €, Marque 2 €), pas de baisse le 11/12.
- Règles automatiques (exécution unique, e-mail à chaque exécution) : 21/12 0 h → 6 € / 3 € / 1 € (10 €/j) ; 04/01 6 h → 30 € / 8 € / 2 €.
- Point de contrôle obligatoire le **10/12** : à 40 €/j, le seuil de 400 € sans commande payée peut être atteint ce jour-là.
- Livraison : point relais Mondial Relay 4,90 € HT (5,88 € TTC dans Merchant, prix le plus bas affiché par Shopping), domicile 9,90 € HT, offerts dès 150 € HT, France et Belgique. Expédition depuis l'atelier, 121 rue Léon Gambetta, Haubourdin (Sendcloud).
