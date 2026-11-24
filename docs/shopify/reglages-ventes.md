# Réglages Shopify à faire (5 minutes)

## 1. Relance des paiements abandonnés (gratuit)
Paramètres → Notifications → Paiement abandonné : activer l'envoi automatique (1 h après, puis 10 h).

## 2. Paiement par virement
Paramètres → Paiements → Moyens de paiement manuels → Virement bancaire.
Texte conseillé : « La production démarre à réception du virement. Référence : numéro de commande. »

## 3. Lien « Recommander » dans l'email de confirmation
Paramètres → Notifications → Confirmation de commande → Modifier le code, ajouter avant le pied de page :

```liquid
{% for attr in attributes %}{% if attr.first == '_recommander' %}
<p style="text-align:center;margin:24px 0">
  <a href="{{ attr.last }}" style="background:#d12f7c;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Recommander en 1 clic</a>
</p>
{% endif %}{% endfor %}
```

## 4. Google Shopping
Merchant Center → Produits → Flux → Ajouter → URL planifiée : `https://alwaan.fr/feeds/google.xml` (France, puis Belgique).

## 5. Conversions Google Ads
Google Ads → Objectifs → Conversions → Importer → Google Analytics 4 → événement `purchase`.
Les ventes sont envoyées à GA4 par le serveur du site (webhook Shopify), même sans cookie.
