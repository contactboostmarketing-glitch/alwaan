# Cocon sémantique alwaan.fr (France + Belgique)

Règle de maillage : chaque page fille renvoie vers sa page mère et vers 2-3 pages sœurs ;
chaque page mère renvoie vers ses filles. Les produits renvoient vers leur catégorie et leurs métiers.

## Niveau 1 : accueil
« Vêtements personnalisés pour professionnels » → page hub, catégories, métiers, assistant, guides.

## Niveau 1 bis : page hub (en ligne depuis le 23/11/2026)
| Page | Requêtes visées (Semrush, volume/mois) | Liens |
|---|---|---|
| /vetements-de-travail-personnalises (+ /en/custom-workwear) | vetement de travail personnalisé 480, vêtement personnalisé entreprise 590, personnalisation / personnalisable 210 + 210, tenue de travail personnalisée 110, vêtement logo entreprise 70 | Reçoit : accueil, pied de page, fil d'Ariane des catégories (« Vêtements »), guides, pages villes. Donne : 8 catégories, 4 métiers + clubs, 6 guides |

## Niveau 2 : pages mères (en ligne)
| Page | Requête principale visée | Guides rattachés |
|---|---|---|
| /vetements/polos-personnalises | polo personnalisé ; à viser : polo entreprise 390, polo personnalisé entreprise 390 (décembre) | grammage-polo-travail, dtf-ou-broderie, taille-vetement-equipe, prix-… |
| /vetements/t-shirts-personnalises | t-shirt personnalisé | t-shirt-personnalise-association-evenement, impression-dtf-avantages, prix-… |
| /vetements/chemises-personnalisees | chemise personnalisée logo ; à viser : chemise personnalisée entreprise 210 (décembre) | dtf-ou-broderie |
| /vetements/tabliers-personnalises | tablier personnalisé professionnel 320, tablier serveur personnalisé 170 (janvier) ; pas « tablier personnalisé » seul (cadeaux) | tablier-personnalise-quel-modele, tenue-restaurant-personnalisee, preparer-logo-impression |
| /vetements/casquettes-personnalisees | casquette personnalisée | impression-dtf-avantages, dtf-ou-broderie, t-shirt-… |
| /vetements/haute-visibilite-personnalisee | gilet de sécurité personnalisé 720, gilet jaune personnalisé 590, gilet haute visibilité personnalisé 260 (enrichie le 23/11/2026) | norme-en-iso-20471-haute-visibilite, taille-vetement-equipe |
| /metiers/restauration | tenue restaurant personnalisée | tenue-restaurant-personnalisee, grammage-polo-travail, tablier-… |
| /metiers/hotellerie | tenue hôtellerie personnalisée | grammage-polo-travail, tablier-… |
| /metiers/btp-logistique | vêtement de chantier personnalisé | norme-en-iso-20471-haute-visibilite |
| /metiers/evenementiel-associations | t-shirt association personnalisé | t-shirt-personnalise-association-evenement |

## Niveau 3 : guides (10 en ligne)
impression-dtf-avantages · dtf-ou-broderie · grammage-polo-travail · preparer-logo-impression ·
norme-en-iso-20471-haute-visibilite · tenue-restaurant-personnalisee · tablier-personnalise-quel-modele ·
t-shirt-personnalise-association-evenement · prix-vetement-personnalise-quantite · taille-vetement-equipe

## À créer (après validation des volumes de recherche)
- Ordre et volumes : voir « Priorités issues de Semrush » dans docs/seo-calendrier.md (textile publicitaire, Belgique, guides grammage t-shirt, « pas cher », DTF / flocage / sérigraphie).
- Pages catégories enrichies : `src/lib/categorySeo.ts` (title, H1, sections, prix calculés, FAQ).
- Nouvelles catégories quand la sélection Roly sera importée : sweats, vestes et gilets (gilet sans manches personnalisé, softshell personnalisée, polaire personnalisée).
- Métiers : boulangerie, artisans (plombier, électricien), auto-école, club sportif, mariage et EVJF, commerce, nettoyage, santé et esthétique.
- Guides : polo pas cher pour entreprise, sweat à capuche entreprise, vêtement de travail personnalisé petite quantité, entretien d'un vêtement imprimé, cadeau d'entreprise textile.
- Belgique : une page « livraison en Belgique » (délais, TVA, frais) ; pas de pages par ville sans contenu réellement local.

## SEA (Google Ads, Meta)
- Une campagne par métier et par catégorie, chaque groupe d'annonces renvoyant vers sa page mère.
- Campagne Performance Max / Shopping alimentée par le flux Shopify (application Google & YouTube).
- Meta : catalogue Shopify + audiences de relance (visiteurs de l'assistant, maquettes non validées).
- Conversions à suivre : maquette validée, ajout au panier, paiement (applications Google et Meta de Shopify), après consentement.

## GEO (moteurs IA)
- /llms.txt en ligne, FAQ balisées, chiffres précis, page À propos.
- À faire : compléter À propos (raison sociale, adresse, SIRET), Google Business Profile, avis clients.
