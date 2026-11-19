import Link from 'next/link';
import { CATEGORIES, SECTORS } from '@/lib/catalog';

export function Footer() {
  return (
    <footer className="site"><div className="wrap">
      <div className="fcols">
        <div><b>Vêtements</b>{CATEGORIES.map((c) => <Link key={c.slug} href={`/vetements/${c.slug}`}>{c.name} personnalisés</Link>)}</div>
        <div><b>Métiers</b>{SECTORS.map((s) => <Link key={s.slug} href={`/metiers/${s.slug}`}>{s.name}</Link>)}</div>
        <div><b>Aide</b><Link href="/livraison">Livraison et délais</Link><Link href="/retours">Retours et rétractation</Link><Link href="/faq">Questions fréquentes</Link><Link href="/devis">Demander un devis</Link></div>
        <div><b>Informations légales</b><Link href="/cgv">CGV</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/cookies">Cookies</Link><Link href="/mediation">Médiation</Link></div>
      </div>
      <div className="fbot"><span>alwaan · tenues professionnelles personnalisées</span><span>Paiement sécurisé · CB, Apple Pay, Google Pay</span></div>
    </div></footer>
  );
}
