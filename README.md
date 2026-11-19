# alwaan

Boutique en ligne de tenues professionnelles personnalisées (pros et particuliers), avec configurateur maison.

## Stack

- **Next.js 16** (App Router, TypeScript), pages générées statiquement pour la vitesse et le SEO
- **Stripe Checkout** pour le paiement (CB, Apple Pay, Google Pay), prix recalculés côté serveur
- **Netlify** pour l'hébergement

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner STRIPE_SECRET_KEY (clé de test)
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
- Configurateur : `src/components/Configurator.tsx`
- Panier et upsell : `src/components/CartView.tsx`
- Paiement : `src/app/api/checkout/route.ts`
- Textes légaux : `src/lib/site.ts` (à faire valider par un juriste)

## Reste à faire

- Photos détourées par coloris à la place des dessins (`Garment.tsx`)
- Stockage des fichiers logo (Netlify Blobs) et rattachement à la commande
- Webhook Stripe : enregistrement des commandes, email de confirmation, back-office
- Envoi des demandes de devis (email ou CRM) : `src/app/api/devis/route.ts`
- Balises Google Ads / Meta Pixel chargées seulement après consentement
- Flux produits Google Merchant Center
