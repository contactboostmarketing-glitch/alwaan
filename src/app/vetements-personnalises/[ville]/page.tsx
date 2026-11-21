import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, PRODUCTS, SECTORS, customName } from '@/lib/catalog';
import { CITIES, getCity } from '@/lib/cities';
import { deliveryDate, fmtDay } from '@/lib/delivery';
import { Breadcrumbs, Faq, JsonLd, LinkChips, ProductCard } from '@/components/ui';
import { I } from '@/components/Icons';
import { SITE_URL } from '@/lib/site';

export const dynamicParams = false;
export const revalidate = 86400;
export const generateStaticParams = () => CITIES.map((c) => ({ ville: c.slug }));
export async function generateMetadata({ params }: { params: Promise<{ ville: string }> }): Promise<Metadata> {
  const c = getCity((await params).ville);
  if (!c) return {};
  return { title: `Vêtements personnalisés à ${c.name} : polos, t-shirts, tabliers à votre logo`, description: `Vêtements de travail et t-shirts personnalisés à votre logo pour ${c.name} (${c.area}) : dès 1 pièce, maquette en direct, imprimés dans notre atelier du Nord et livrés en quelques jours.`, alternates: { canonical: `/vetements-personnalises/${c.slug}` } };
}

export default async function Page({ params }: { params: Promise<{ ville: string }> }) {
  const c = getCity((await params).ville);
  if (!c) notFound();
  const products = c.focus.flatMap((cat) => { const l = PRODUCTS.filter((p) => p.category === cat); const x = l.find((p) => p.bestseller) ?? l[0]; return x ? [x] : []; });
  const others = CITIES.filter((x) => x.slug !== c.slug && x.country === c.country).slice(0, 6);
  const when = fmtDay(deliveryDate());
  const faq: [string, string][] = [
    [`Livrez-vous à ${c.name} ?`, `Oui. Nous livrons partout ${c.country === 'BE' ? 'en Belgique' : 'en France'}, ${c.name} compris. Délai indicatif : production en 7 jours ouvrés après validation de la maquette, puis 1 à 3 jours de transport${c.near ? ', souvent moins vers ' + c.name + ', toute proche de notre atelier' : ''}. En express : 4 jours ouvrés de production.`],
    ['Y a-t-il un minimum de commande ?', 'Non, dès 1 pièce. Le marquage devient moins cher à partir de 5, 10 et 30 pièces au même logo.'],
    ['Où sont imprimés les vêtements ?', 'Dans notre atelier à Haubourdin, près de Lille. Chaque commande est photographiée avant l\'envoi.'],
    ['Comment récupérer les tailles de toute l\'équipe ?', 'Avec le lien d\'équipe : vous le partagez, chacun entre son nom, son prénom et sa taille, et votre panier se remplit seul.'],
  ];
  return (
    <>
      <Breadcrumbs items={[[`Vêtements personnalisés à ${c.name}`]]} />
      <section className="wrap">
        <span className="season-kicker"><I name="truck" size={16} /> {c.area}</span>
        <h1>Vêtements personnalisés à {c.name}</h1>
        <p className="lead">{c.angle}</p>
        <ul className="perks"><li><I name="eye" className="ico" /> Maquette en direct</li><li><I name="one" className="ico" /> Dès 1 pièce</li><li><I name="truck" className="ico" /> Commandé aujourd&apos;hui, reçu vers le {when}</li><li><I name="home" className="ico" /> Imprimé dans le Nord</li></ul>
        <div className="ctas mt"><Link className="btn cta" href="/assistant">Créer ma tenue en 1 minute</Link><Link className="btn line" href="/lien-equipe"><I name="users" size={18} /> Lien d&apos;équipe</Link></div>
        <h2 className="mt">Les plus demandés à {c.name}</h2>
        <div className="grid g4">{products.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        <LinkChips title="Par métier" links={SECTORS.filter((s) => c.sectors.includes(s.slug)).map((s) => [`Tenues ${s.name.toLowerCase()}`, `/metiers/${s.slug}`] as [string, string])} />
        <LinkChips title="Tous nos vêtements" links={CATEGORIES.map((x) => [customName(x), `/vetements/${x.slug}`] as [string, string])} />
        <h2 className="mt">Questions fréquentes</h2>
        <Faq items={faq} />
        <LinkChips title="Autres villes" links={others.map((x) => [x.name, `/vetements-personnalises/${x.slug}`] as [string, string])} />
      </section>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: `Vêtements personnalisés à ${c.name}`, provider: { '@type': 'LocalBusiness', name: 'alwaan', url: SITE_URL, address: { '@type': 'PostalAddress', addressLocality: 'Haubourdin', postalCode: '59320', addressCountry: 'FR' } }, areaServed: { '@type': 'City', name: c.name }, url: `${SITE_URL}/vetements-personnalises/${c.slug}` }} />
    </>
  );
}
