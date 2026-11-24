// Pixel client Shopify : conversion « Achat » Google Ads d'alwaan.
// À coller dans Shopify > Paramètres > Événements clients > Ajouter un pixel personnalisé
// (nom : « Google Ads alwaan »), puis « Enregistrer » et « Connecter ».
// Autorisation : Marketing (le pixel ne s'exécute qu'avec le consentement publicitaire du client).
const AW = 'AW-18590441820';
const SEND_TO = 'AW-18590441820/wv8oCPSexL0dENzCzqBF';

const s = document.createElement('script');
s.src = 'https://www.googletagmanager.com/gtag/js?id=' + AW;
s.async = true;
document.head.appendChild(s);
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', AW);

analytics.subscribe('checkout_completed', (event) => {
  const c = event.data.checkout;
  gtag('event', 'conversion', {
    send_to: SEND_TO,
    // Valeur HT des articles (hors port et TVA), en euros.
    value: Number(c.subtotalPrice?.amount || c.totalPrice?.amount || 0),
    currency: c.currencyCode || 'EUR',
    transaction_id: c.order?.id || c.token,
  });
});
