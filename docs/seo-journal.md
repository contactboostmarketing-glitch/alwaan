# Journal SEO (tenu par l'agent seo-mensuel)

Entrée la plus récente en haut.

## 23/11/2026 : passage spécial Semrush (demandé par le gérant)
- **Voix du client** : `/api/insights?jours=90` répond (200), mais tout est vide : aucun avis, aucune question, aucun devis, aucun retour, aucune commande, aucune rupture. Le travail repose donc sur les données Semrush.
- **Classement** des 13 opportunités de `docs/ads-recalage-semrush.md` (section 8), plus 3 repérées dans les CSV : sweat personnalisé entreprise 480, cadeau client entreprise 590, polo personnalisé pas cher 480.
  - Méthode : volume × intention pro × faisabilité.
  - Résultat dans `docs/seo-calendrier.md` : plan détaillé de décembre à février (title, H1, mots-clés, URL, maillage).
- **Créé : page hub « Vêtements de travail personnalisés »**
  - Adresses : `/vetements-de-travail-personnalises` et `/en/custom-workwear`.
  - Requêtes visées : vetement de travail personnalisé 480, vêtement personnalisé entreprise 590, personnalisation et personnalisable 210 + 210, tenue de travail personnalisée 110.
  - Contenu : prix calculés depuis le catalogue, FAQ (7 questions), données structurées Service, FAQPage et fil d'Ariane.
  - Liens entrants : accueil, pied de page, fil d'Ariane des catégories, guides, pages villes, `llms.txt`, plan du site (FR et EN).
- **Enrichi : page haute visibilité**
  - Requêtes visées : gilet de sécurité personnalisé 720, gilet jaune personnalisé 590.
  - Title : « Gilet de sécurité et gilet jaune personnalisés ».
  - H1 : « Gilets de sécurité et vêtements haute visibilité personnalisés ».
  - Contenu ajouté : 5 sections (dont « gilet pour une association ou un événement »), tableau de prix calculé, 3 questions de FAQ.
  - Mécanisme réutilisable : `src/lib/categorySeo.ts`, en français uniquement. La version anglaise et le flux Shopping ne changent pas.
- **Corrigé** dans `llms.txt` : tailles de marquage alignées sur le code (dos et grand devant jusqu'à 27 × 27 cm). Ajout des sweats et des vestes.
- **Non réalisé (passage spécial)** : les contenus de novembre (guide « Commander avant Noël », bloc « dernière minute »). Pour 2026, c'est trop tard pour le référencement naturel, et les dates limites sont déjà affichées. Ils sont reportés à septembre-octobre 2027.
- **Reportés** (produit absent) : gilet sans manches (210), doudoune (210), bonnet (320). La page boulangerie (volume nul) est remplacée par la page Belgique en janvier.
- **À signaler au gérant** :
  - Grammages des t-shirts. `catalog.ts` indique Dogo 180 g/m² et Fox 160 g/m², alors que les fiches Roly affichées sur le site disent 165 et 150 g/m². Le texte de la catégorie t-shirts parle de « 180 g/m² et plus pour un t-shirt porté toute l'année ». À corriger avant le guide grammage de décembre.
  - Sur mobile, le lien panier de l'en-tête dépasse de 2 px sur toutes les pages. Ce défaut existait avant ce passage.
- **Ads** : l'URL finale du groupe « Vêtements de travail personnalisés » est à passer de `/` à `/vetements-de-travail-personnalises` après la mise en ligne.
- **Vérifié** :
  - `npx tsc --noEmit -p .` et `npm run build` passent.
  - Les pages FR et EN répondent en 200 (contrôle avec Playwright sur mobile et sur ordinateur).
  - Commit local, **non poussé** : le gérant regroupe les déploiements.

## Mise en place
- Plan annuel : docs/seo-calendrier.md. Cocon : docs/seo-cocon.md.
- En ligne : 10 guides, 6 catégories, 4 métiers, 14 pages locales, textile vierge, clubs et associations, notre atelier, réalisations, idées cadeaux.
