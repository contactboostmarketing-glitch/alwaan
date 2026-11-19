'use client';
import { eur } from '@/lib/pricing';
import { useCart } from './CartProvider';

/** Affiche un montant HT converti selon le mode (Pro = HT, Particulier = TTC). */
export function Price({ ht, suffix = true }: { ht: number; suffix?: boolean }) {
  const { vatFactor, label } = useCart();
  return <>{eur(ht * vatFactor)}{suffix ? ` ${label}` : ''}</>;
}
