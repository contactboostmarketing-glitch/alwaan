'use client';
// Pages particuliers : prix TTC (mode Particulier) une fois le panier chargé.
import { useEffect, useRef } from 'react';
import { useCart } from './CartProvider';

export function RetailMode() {
  const { loaded, pro, setPro } = useCart();
  const done = useRef(false);
  useEffect(() => { if (loaded && !done.current) { done.current = true; if (pro) setPro(false); } }, [loaded, pro, setPro]);
  return null;
}
