import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SECTORS, getCategory, getSector, productsIn } from '@/lib/catalog';
import { Breadcrumbs, Checks, ProductCard } from '@/components/ui';

export const dynamicParams = false;
export const generateStaticParams = () => SECTORS.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getSector((await params).slug)!;
  return { title: s.h1, description: s.intro, alternates: { canonical: `/metiers/${s.slug}` } };
}

/** Pages métier : SEO local au métier et pages d'arrivée des campagnes Google Ads / Meta. */
export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getSector((await params).slug);
  if (!s) notFound();
  return (
    <>
      <Breadcrumbs items={[['Métiers'], [s.name]]} />
      <section className="wrap">
        <div className="cat-head">
          <div><h1>{s.h1}</h1><p className="mt8">{s.intro} Les mêmes modèles pour toute l&apos;équipe, du S au 5XL.</p></div>
          <Checks items={['Dès 1 pièce', 'Maquette en direct']} />
        </div>
        {s.categories.map((ck) => {
          const c = getCategory(ck)!;
          return (
            <div key={ck}>
              <div className="sec-head mt"><h2>{c.name}</h2><Link className="link" href={`/vetements/${ck}`}>Tous les {c.name.toLowerCase()}</Link></div>
              <div className="grid">{productsIn(ck).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
            </div>
          );
        })}
      </section>
    </>
  );
}
