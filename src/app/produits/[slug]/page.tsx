import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, COLOR_NAMES, GENERAL_FAQ, PRODUCTS, SECTORS, fromPrice, getCategory, getProduct } from '@/lib/catalog';
import { Configurator } from '@/components/Configurator';
import { Breadcrumbs, Faq, JsonLd, ProductCard } from '@/components/ui';
import { SITE_URL } from '@/lib/site';

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug)!;
  return {
    title: `${p.name} personnalisé à votre logo`,
    description: `${p.name} : ${p.type.toLowerCase()}, ${p.colors.length} coloris, ${p.sizes === 'TU' ? 'taille unique' : p.sizes}. Marquage de votre logo dès 1 pièce, visuel gratuit, livraison en 7 jours.`,
    alternates: { canonical: `/produits/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const c = getCategory(p.category)!;
  const related = [...PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug), ...PRODUCTS.filter((x) => x.bestseller && x.category !== p.category)].slice(0, 4);
  return (
    <>
      <Breadcrumbs items={[[c.name, `/vetements/${c.slug}`], [p.name]]} />
      <section className="wrap">
        <Suspense><Configurator slug={p.slug} /></Suspense>
        <div className="asst-cta"><span><b>Pas le temps ?</b> Envoyez votre logo, notre assistant prépare toute la commande.</span><Link className="btn line small" href="/assistant">Commander avec l&apos;assistant</Link></div>
        <div className="seo">
          <div className="txt">
            <h2>Caractéristiques</h2>
            <dl className="spec">
              <dt>Composition</dt><dd>{p.composition}</dd>
              <dt>Tailles</dt><dd>{p.sizes === 'TU' ? 'Taille unique réglable' : p.sizes}</dd>
              <dt>Coloris</dt><dd>{p.colors.map((x) => COLOR_NAMES[x]).join(', ')}</dd>
              <dt>Marquage</dt><dd>Impression DTF haute définition : couleurs vives, dégradés, tous textiles</dd>
              <dt>Entretien</dt><dd>Lavage 40 °C sur l&apos;envers, pas de sèche-linge</dd>
            </dl>
            <h2 className="mt">Questions sur ce produit</h2>
            <Faq items={[...c.faq, GENERAL_FAQ[3]]} />
          </div>
          <div className="related">
            <b>Voir aussi</b>
            <Link href={`/vetements/${c.slug}`}>Tous les {c.name.toLowerCase()} personnalisés</Link>
            {SECTORS.filter((s) => s.categories.includes(c.slug)).map((s) => <Link key={s.slug} href={`/metiers/${s.slug}`}>Tenues {s.name.toLowerCase()}</Link>)}
            {CATEGORIES.filter((o) => o.slug !== c.slug).slice(0, 3).map((o) => <Link key={o.slug} href={`/vetements/${o.slug}`}>{o.name} personnalisés</Link>)}
          </div>
        </div>
        <div className="sec-head mt"><h2>Souvent commandés ensemble</h2></div>
        <div className="grid">{related.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: `${p.type}. ${p.composition}.`,
        brand: { '@type': 'Brand', name: 'alwaan' }, category: c.name, color: p.colors.map((x) => COLOR_NAMES[x]).join(', '), material: p.composition,
        offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (fromPrice(p) * 1.2).toFixed(2), highPrice: ((p.price + 13.2) * 1.2).toFixed(2), availability: 'https://schema.org/InStock', url: `${SITE_URL}/produits/${p.slug}` },
      }} />
    </>
  );
}
