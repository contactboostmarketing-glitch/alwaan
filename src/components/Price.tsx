'use client';
import { eur } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { RESELLER_RATE } from '@/lib/catalog';
import { useLang } from '@/i18n/client';

/** Affiche un montant HT converti selon le mode (Pro = HT, Particulier = TTC). */
/** raw : sans la remise revendeur (le panier l'affiche sur une ligne à part). */
export function Price({ ht, suffix = true, raw = false }: { ht: number; suffix?: boolean; raw?: boolean }) {
  const { vatFactor, label, reseller } = useCart();
  const lang = useLang();
  const lab = lang === 'en' ? (label === 'HT' ? 'excl. VAT' : 'incl. VAT') : label;
  return <>{eur(ht * vatFactor * (reseller && !raw ? 1 - RESELLER_RATE : 1), lang)}{suffix ? ` ${lab}` : ''}</>;
}
