import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, GENERAL_FAQ, SECTORS, getCategory, productsIn } from '@/lib/catalog';
import { Breadcrumbs, Faq, LinkChips, MoreInfo, Perks, ProductCard } from '@/components/ui';
import { guidesFor } from '@/lib/guides';

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getCategory((await params).slug)!;
  return { title: c.title, description: c.intro, alternates: { canonical: `/vetements/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCategory((await params).slug);
  if (!c) notFound();
  const list = [...productsIn(c.slug)].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
  const sectors = SECTORS.filter((s) => s.categories.includes(c.slug));
  return (
    <>
      <Breadcrumbs items={[['Vêtements'], [c.name]]} />
      <section className="wrap">
        <div className="cat-head">
          <div><h1>{c.name} personnalisés</h1><p className="mt8">{c.intro}</p></div>
          <Perks items={[['one', 'Dès 1 pièce'], ['eye', 'Maquette en direct'], ['truck', '7 jours']]} />
        </div>
        <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        <div className="seo1">
          <LinkChips title="Par métier" links={sectors.map((s) => [`${c.name} ${s.name.toLowerCase()}`, `/metiers/${s.slug}`])} />
          <LinkChips title="Autres vêtements" links={CATEGORIES.filter((o) => o.slug !== c.slug).map((o) => [`${o.name} personnalisés`, `/vetements/${o.slug}`])} />
          <MoreInfo title={`Bien choisir son ${c.singular} personnalisé`}>{c.details?.map((d) => <p key={d.slice(0, 30)}>{d}</p>)}</MoreInfo>
          <h2 className="mt">Questions fréquentes</h2><Faq items={[...c.faq, ...GENERAL_FAQ.slice(0, 2)]} />
          <LinkChips title="Nos guides" links={guidesFor(c.slug).map((g) => [g.title, `/guides/${g.slug}`])} />
        </div>
      </section>
    </>
  );
}
