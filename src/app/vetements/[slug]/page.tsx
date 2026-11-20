import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, GENERAL_FAQ, SECTORS, getCategory, productsIn } from '@/lib/catalog';
import { Breadcrumbs, Checks, Faq, ProductCard } from '@/components/ui';

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
          <Checks items={['Dès 1 pièce', 'Maquette en direct', 'Livré en 7 jours']} />
        </div>
        <p className="muted small mb">{list.length} modèles · prix dès 250 pièces, logo compris</p>
        <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        <div className="seo">
          <div className="txt"><h2>Bien choisir son {c.singular} personnalisé</h2><Faq items={[...c.faq, ...GENERAL_FAQ.slice(0, 2)]} /></div>
          <div className="related">
            <b>Par métier</b>
            {sectors.map((s) => <Link key={s.slug} href={`/metiers/${s.slug}`}>{c.name} pour la {s.name.toLowerCase()}</Link>)}
            <b className="mt">Autres vêtements</b>
            {CATEGORIES.filter((o) => o.slug !== c.slug).map((o) => <Link key={o.slug} href={`/vetements/${o.slug}`}>{o.name} personnalisés</Link>)}
          </div>
        </div>
      </section>
    </>
  );
}
