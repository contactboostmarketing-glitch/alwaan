import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, COLOR_NAMES, GENERAL_FAQ, PRODUCTS, SECTORS, fromPrice, getCategory, getProduct, topPrice } from '@/lib/catalog';
import { Configurator } from '@/components/Configurator';
import { Breadcrumbs, Faq, Icon, JsonLd, LinkChips, MoreInfo, ProductCard } from '@/components/ui';
import { SITE_URL } from '@/lib/site';

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug)!;
  return {
    title: `${p.name} personnalisé à votre logo`,
    description: `${p.name} : ${p.type.toLowerCase()}, ${p.colors.length} coloris, ${p.sizes === 'TU' ? 'taille unique' : p.sizes}. Marquage de votre logo dès 1 pièce, maquette en direct, livraison en 7 jours.`,
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
        <div className="asst-cta"><span><b>Pas le temps ?</b> L&apos;assistant fait tout.</span><Link className="btn line small" href="/assistant">Essayer</Link></div>
        <div className="seo1">
          <div className="spec-ic">
            <span><Icon name="shirt" /><b>{p.composition.split('·')[0].trim()}</b></span>
            {p.composition.includes('·') && <span><Icon name="tag" /><b>{p.composition.split('·')[1].trim()}</b></span>}
            <span><Icon name="one" /><b>{p.sizes === 'TU' ? 'Taille unique' : p.sizes}</b></span>
            <span><Icon name="redo" /><b>40 °C</b></span>
          </div>
          <MoreInfo title="Caractéristiques">
            <dl className="spec">
              <dt>Composition</dt><dd>{p.composition}</dd>
              <dt>Tailles</dt><dd>{p.sizes === 'TU' ? 'Taille unique réglable' : p.sizes}</dd>
              <dt>Coloris</dt><dd>{p.colors.map((x) => COLOR_NAMES[x]).join(', ')}</dd>
              <dt>Marquage</dt><dd>Impression DTF haute définition : couleurs vives, dégradés, tous textiles</dd>
              <dt>Entretien</dt><dd>Lavage 40 °C sur l&apos;envers, pas de sèche-linge</dd>
            </dl>
          </MoreInfo>
          <h2 className="mt">Questions</h2>
          <Faq items={[...c.faq, GENERAL_FAQ[3]]} />
          <LinkChips title="Voir aussi" links={[[`Tous les ${c.name.toLowerCase()}`, `/vetements/${c.slug}`], ...SECTORS.filter((s) => s.categories.includes(c.slug)).map((s): [string, string] => [`Tenues ${s.name.toLowerCase()}`, `/metiers/${s.slug}`]), ...CATEGORIES.filter((o) => o.slug !== c.slug).slice(0, 3).map((o): [string, string] => [`${o.name} personnalisés`, `/vetements/${o.slug}`])]} />
        </div>
        <div className="sec-head mt"><h2>Souvent commandés ensemble</h2></div>
        <div className="grid">{related.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: `${p.type}. ${p.composition}.`,
        brand: { '@type': 'Brand', name: 'alwaan' }, category: c.name, color: p.colors.map((x) => COLOR_NAMES[x]).join(', '), material: p.composition,
        offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (fromPrice(p) * 1.2).toFixed(2), highPrice: (topPrice(p) * 1.2).toFixed(2), availability: 'https://schema.org/InStock', url: `${SITE_URL}/produits/${p.slug}` },
      }} />
    </>
  );
}
