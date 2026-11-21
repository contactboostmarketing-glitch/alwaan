'use client';
// Stock atelier côté navigateur : chargé une fois par visite, partagé entre fiche produit et panier.
import { useEffect, useState } from 'react';
import type { Stock } from './stockTypes';

let cache: Promise<Stock | null> | null = null;
const load = () => (cache ??= fetch('/api/stock').then((r) => (r.ok ? r.json() : null)).catch(() => null));

export function useStock(): Stock | null {
  const [s, setS] = useState<Stock | null>(null);
  useEffect(() => { let on = true; load().then((d) => on && setS(d)); return () => { on = false; }; }, []);
  return s;
}
