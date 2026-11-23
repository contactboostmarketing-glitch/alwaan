# Journal acquisition payante alwaan.fr

Entrée la plus récente en haut. Pas de donnée personnelle ici. Stratégie de référence : `docs/ads-strategie.md`.

## Tests en cours
Aucun.

## Demandes en attente
| Date | Pour | Demande | Priorité | État |
|---|---|---|---|---|
| 23/11/2026 | Informaticien | Conversion « Achat (serveur) » vers Google Ads depuis le webhook (gclid, valeur HT, n° de commande, virements compris, rétractations) ; pixel Shopify en secondaire | P0 | Ouvert |
| 23/11/2026 | Informaticien | GA4 : identifiants + API secret, vérification des événements | P0 | Ouvert |
| 23/11/2026 | Informaticien / gérant | Bannière de confidentialité Shopify active sur le checkout (FR, BE) ; pixel « Google Ads alwaan » connecté | P0 | Ouvert |
| 23/11/2026 | Informaticien | Conversion Stripe de secours : ajouter la valeur HT | P0 | Ouvert |
| 23/11/2026 | Informaticien + gérant | Achat test réel visible dans Google Ads, puis remboursement et rétractation | P0 | Ouvert |
| 23/11/2026 | Informaticien | Flux : custom_label 2/3/4 (marge, saison, cible), taille valide, images sur alwaan.fr, Offer au prix du flux (lowPrice 14,40 contre 16,32), diffusion BE | P1 | Ouvert |
| 23/11/2026 | Informaticien | Micro-conversions : devis /devis, lien d'équipe, boutique club, clic WhatsApp | P1 | Ouvert |
| 23/11/2026 | Informaticien | Pages : « Nouvelles tenues 2027 » (04/01), « Restauration printemps » (09/02) | P1 | Ouvert |
| 23/11/2026 | Gérant | Coût réel du marquage DTF et de la main-d'œuvre (hypothèses : 0,40 € / 1,50 € par zone, 1,00 € + 0,40 € par zone) ; port réel ; coûts Wizer et Barny ; tarifs Roly définitifs | — | Ouvert |
| 23/11/2026 | Gérant | Part acceptable de la marge pour la pub (35 % proposé ; équilibre accepté pendant l'apprentissage déc.–janv.) | — | Ouvert |
| 23/11/2026 | Gérant | Validation écrite du budget de décembre : 630 € (30/11 → 03/01) | — | Ouvert |
| 23/11/2026 | Gérant | Accord de principe pour créer le compte Meta Business (reciblage en janvier, 70 €) | — | Ouvert |

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
