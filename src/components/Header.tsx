'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/catalog';
import { qtyOf } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { useT } from '@/i18n/client';
import { categoryL, frPath, href } from '@/i18n';

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
  const { t, l, lang } = useT();
  const other = lang === 'en' ? frPath(path) : href('en', path);
  return (
    <>
      <div className="promo">{t('Livraison offerte dès 150 € · Maquette en direct avec votre logo · Dès 1 pièce')}</div>
      <header className="site">
        <div className="wrap hd">
          <Link className="logo" href={l('/')} aria-label={t('alwaan, accueil')}><Logo /><b>alwaan</b></Link>
          <Link className="langsw" href={other} hrefLang={lang === 'en' ? 'fr' : 'en'} aria-label={lang === 'en' ? 'Version française' : 'English version'}>{lang === 'en' ? 'FR' : 'EN'}</Link>
          <div className="mode" role="group" aria-label={t('Affichage des prix')}>
            <button aria-pressed={pro} onClick={() => setPro(true)}>Pro <span className="opt">· {t('HT')}</span></button>
            <button aria-pressed={!pro} onClick={() => setPro(false)}>{t('Particulier')} <span className="opt">· {t('TTC')}</span></button>
          </div>
          <Link className="acctlink" href={l('/compte')} aria-label={t('Mon compte')} title={t('Mon compte')}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" /></svg></Link>
          <Link className="cartlink" href={l('/panier')} aria-label={t('Panier, {n} pièces', { n: count })}><span className="opt">{t('Panier')}</span> <i>{count}</i></Link>
        </div>
        <nav className="wrap menu" aria-label={t('Catégories')}>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={l(`/vetements/${c.slug}`)} aria-current={path === l(`/vetements/${c.slug}`) ? 'page' : undefined}>{categoryL(lang, c).name}</Link>
          ))}
          <Link href={l('/idees-cadeaux')} aria-current={path.startsWith(l('/idees-cadeaux')) ? 'page' : undefined}>{t('Cadeaux')}</Link>
          <Link href={l('/devis')} aria-current={path === l('/devis') ? 'page' : undefined}>{t('Devis')}</Link>
          <Link className="menu-cta" href={l('/assistant')} aria-current={path === l('/assistant') ? 'page' : undefined}>{t('Créer ma tenue en 1 min')}</Link>
        </nav>
      </header>
    </>
  );
}
