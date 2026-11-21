'use client';
import Link from 'next/link';
import { CATEGORIES, SECTORS } from '@/lib/catalog';
import { CITIES } from '@/lib/cities';
import { categoryL, sectorL } from '@/i18n';
import { useT } from '@/i18n/client';

export function Footer() {
  const { t, l, lang } = useT();
  const fr = lang === 'en' ? ' (FR)' : '';
  return (
    <footer className="site"><div className="wrap">
      <div className="fcols">
        <div><b>{t('Vêtements')}</b>{CATEGORIES.map((c) => <Link key={c.slug} href={l(`/vetements/${c.slug}`)}>{lang === 'en' ? `Custom ${categoryL(lang, c).name.toLowerCase()}` : `${c.name} personnalisés`}</Link>)}<Link href={l('/textile-vierge')}>{t('Textile vierge')}</Link></div>
        <div><b>{t('Métiers')}</b>{SECTORS.map((s) => <Link key={s.slug} href={l(`/metiers/${s.slug}`)}>{sectorL(lang, s).name}</Link>)}</div>
        <div><b>{t('Aide')}</b><Link href="/livraison">{t('Livraison et délais')}{fr}</Link><Link href="/retours">{t('Retours et SAV')}{fr}</Link>{lang === 'fr' && <Link href="/guides">Guides et conseils</Link>}<Link href={l('/faq')}>{t('Questions fréquentes')}</Link><Link href={l('/notre-atelier')}>{t('Notre atelier')}</Link><Link href={l('/realisations')}>{t('Réalisations clients')}</Link><Link href={l('/clubs-associations')}>{t('Clubs et associations')}</Link><Link href={l('/devis')}>{t('Demander un devis')}</Link></div>
        <div><b>{t('Informations légales')}</b><Link href="/cgv">{t('CGV')}{fr}</Link><Link href="/mentions-legales">{t('Mentions légales')}{fr}</Link><Link href="/confidentialite">{t('Confidentialité')}{fr}</Link><Link href="/cookies">{t('Cookies')}{fr}</Link><Link href="/mediation">{t('Médiation')}{fr}</Link></div>
      </div>
      {lang === 'fr' && <p className="fcities"><b>Nous livrons</b> {CITIES.map((c, i) => <span key={c.slug}>{i ? ' · ' : ''}<Link href={`/vetements-personnalises/${c.slug}`}>{c.name}</Link></span>)}</p>}
      <div className="fbot"><span>{t('alwaan · tenues professionnelles personnalisées')}</span><span>{t('Paiement sécurisé · CB, Apple Pay, Google Pay')}</span></div>
    </div></footer>
  );
}
