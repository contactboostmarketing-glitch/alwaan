'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/catalog';
import { qtyOf } from '@/lib/pricing';
import { useCart } from './CartProvider';

export function Logo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stopColor="#1fb2d4" /><stop offset=".5" stopColor="#2b63d9" /><stop offset="1" stopColor="#d12f7c" /></linearGradient></defs>
      <path d="M20 3 L37 36 L27 36 L20 21 L13 36 L3 36 Z" fill="url(#lg)" />
    </svg>
  );
}

export function Header() {
  const { pro, setPro, lines } = useCart();
  const path = usePathname();
  const count = lines.reduce((a, l) => a + qtyOf(l), 0);
  return (
    <>
      <div className="promo">Livraison offerte dès 150 € · Visuel gratuit avant production · Dès 1 pièce</div>
      <header className="site">
        <div className="wrap hd">
          <Link className="logo" href="/" aria-label="alwaan, accueil"><Logo /><b>alwaan</b></Link>
          <div className="mode" role="group" aria-label="Affichage des prix">
            <button aria-pressed={pro} onClick={() => setPro(true)}>Pro <span className="opt">· HT</span></button>
            <button aria-pressed={!pro} onClick={() => setPro(false)}>Particulier <span className="opt">· TTC</span></button>
          </div>
          <Link className="cartlink" href="/panier" aria-label={`Panier, ${count} pièces`}><span className="opt">Panier</span> <i>{count}</i></Link>
        </div>
        <nav className="wrap menu" aria-label="Catégories">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/vetements/${c.slug}`} aria-current={path === `/vetements/${c.slug}` ? 'page' : undefined}>{c.name}</Link>
          ))}
          <Link href="/devis" aria-current={path === '/devis' ? 'page' : undefined}>Devis</Link>
        </nav>
      </header>
    </>
  );
}
