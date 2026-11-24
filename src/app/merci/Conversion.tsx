'use client';
import { useEffect } from 'react';
import { GADS_PURCHASE } from '@/components/Tracking';

/** Paiement de secours (Stripe) terminé sur alwaan.fr : conversion « Achat » Google Ads (les paiements Shopify passent par le pixel Shopify). */
export function Conversion() {
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('session');
    if (!id) return;
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    const t = setTimeout(() => w.gtag?.('event', 'conversion', { send_to: GADS_PURCHASE, transaction_id: id, currency: 'EUR' }), 1500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
