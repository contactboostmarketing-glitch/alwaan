'use client';
import { eur } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { useLang } from '@/i18n/client';

/** Affiche un montant HT converti selon le mode (Pro = HT, Particulier = TTC). */
export function Price({ ht, suffix = true }: { ht: number; suffix?: boolean }) {
  const { vatFactor, label } = useCart();
  const lang = useLang();
  const lab = lang === 'en' ? (label === 'HT' ? 'excl. VAT' : 'incl. VAT') : label;
  return <>{eur(ht * vatFactor, lang)}{suffix ? ` ${lab}` : ''}</>;
}
