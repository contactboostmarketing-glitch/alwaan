'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { LineConfig } from '@/lib/pricing';

type Ctx = {
  lines: LineConfig[];
  pro: boolean;
  promo: string | null;
  express: boolean;
  connected: boolean;
  reseller: boolean; // revendeur validé : -10 % sur tout (vérifié aussi côté serveur au paiement)
  setExpress: (v: boolean) => void;
  setPro: (v: boolean) => void;
  add: (l: LineConfig) => void;
  update: (i: number, l: LineConfig) => void;
  remove: (i: number) => void;
  setPromo: (c: string | null) => void;
  clear: () => void;
  vatFactor: number;
  label: 'HT' | 'TTC';
};

const CartContext = createContext<Ctx | null>(null);
const KEY = 'alwaan-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<LineConfig[]>([]);
  const [pro, setPro] = useState(true);
  const [promo, setPromo] = useState<string | null>(null);
  const [express, setExpress] = useState(false);
  const [account, setAccount] = useState({ connected: false, reseller: false });
  useEffect(() => { fetch('/api/compte/statut').then((r) => r.json()).then((d) => setAccount({ connected: !!d.connected, reseller: !!d.reseller })).catch(() => {}); }, []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s) { setLines(s.lines || []); setPro(s.pro !== false); setPromo(s.promo || null); setExpress(!!s.express); }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ lines, pro, promo, express })); } catch {}
  }, [lines, pro, promo, express, loaded]);

  const value: Ctx = {
    lines, pro, promo, setPro, setPromo, express, setExpress, connected: account.connected, reseller: account.reseller,
    add: (l) => setLines((x) => [...x, l]),
    update: (i, l) => setLines((x) => x.map((y, j) => (j === i ? l : y))),
    remove: (i) => setLines((x) => x.filter((_, j) => j !== i)),
    clear: () => { setLines([]); setPromo(null); },
    vatFactor: pro ? 1 : 1.2,
    label: pro ? 'HT' : 'TTC',
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart doit être utilisé dans CartProvider');
  return c;
}
