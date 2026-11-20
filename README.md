# alwaan

Boutique en ligne de tenues professionnelles personnalisées (pros et particuliers), avec configurateur maison.

## Stack

- **Next.js 16** (App Router, TypeScript), pages générées statiquement pour la vitesse et le SEO
- **Shopify** (Storefront API) pour le panier, le paiement, les commandes et le back office ; Stripe en repli
- Prix toujours recalculés côté serveur : un code de remise unique par panier aligne le prix Shopify sur le prix affiché
- **Netlify** pour l'hébergement

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner SHOPIFY_STORE_DOMAIN et SHOPIFY_STOREFRONT_TOKEN
npm run dev
```

## Arborescence

| URL | Rôle |
| --- | --- |
| `/` | Accueil |
| `/vetements/[categorie]` | 6 catégories (polos, t-shirts, chemises, tabliers, casquettes, haute visibilité) |
| `/produits/[produit]` | Fiche produit avec configurateur |
| `/metiers/[metier]` | Pages métier, aussi pages d'arrivée Google Ads / Meta |
| `/panier`, `/merci` | Panier et confirmation (non indexés) |
| `/devis`, `/faq` | Devis et questions fréquentes |
| `/cgv`, `/mentions-legales`, `/confidentialite`, `/cookies`, `/mediation`, `/livraison`, `/retours` | Pages légales |

## Où modifier quoi

- Produits, catégories, métiers, zones de marquage, paliers de prix : `src/lib/catalog.ts`
- Calcul des prix (partagé navigateur / serveur) : `src/lib/pricing.ts`

### Grille de prix (HT)

- Vêtement : prix d'achat × 2, sans remise de quantité.
- Marquage par pièce : cœur ou anti-cœur 10 × 10 cm 4 €, dos 26 × 26 cm 6 €, grand devant 28 × 30 cm 8 € (prix fixe), nuque et épaules 2,50 €.
  Cœur et dos à 5 € quand le prix de vente du textile dépasse 25 €.
- Remise sur le marquage (hors grand devant) : -15 % dès 5 pièces, -20 % dès 10, -40 % dès 30. Les pièces au même logo se cumulent.
- Shopify doit avoir les mêmes prix : `POST /api/shopify/setup` (en-tête `x-sync-key`, `?dry=1` pour simuler) crée les produits de marquage et aligne les prix.
- Configurateur : `src/components/Configurator.tsx`
- Panier et upsell : `src/components/CartView.tsx`
- Paiement : `src/app/api/checkout/route.ts`, `src/lib/shopify.ts` (panier) et `src/lib/shopifyAdmin.ts` (remise exacte)
- Textes légaux : `src/lib/site.ts` (à faire valider par un juriste)

## Reste à faire

- Photos détourées par coloris à la place des dessins (`Garment.tsx`)
- Stockage des fichiers logo (Netlify Blobs) et rattachement à la commande
- Envoi des demandes de devis (email ou CRM) : `src/app/api/devis/route.ts`
- Balises Google Ads / Meta Pixel chargées seulement après consentement
- Flux produits Google Merchant Center
