import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory, getSector } from '@/lib/catalog';
import { GUIDES, getGuide } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';
import { Breadcrumbs, Faq, JsonLd } from '@/components/ui';

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug)!;
  return { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` }, openGraph: { type: 'article', title: g.title, description: g.description } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const main = getCategory(g.categories[0])!;
  return (
    <>
      <Breadcrumbs items={[['Guides', '/guides'], [g.title]]} />
      <article className="wrap guide">
        <h1>{g.title}</h1>
        <p className="lead-txt">{g.intro}</p>
        {g.sections.map((s) => (
          <section key={s.h2}><h2>{s.h2}</h2>{s.p.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</section>
        ))}
        <div className="asst-cta"><span><b>Prêt à créer votre tenue ?</b> Voyez votre logo sur le vêtement en direct.</span><Link className="btn cta small" href="/assistant">Créer ma tenue en 1 minute</Link></div>
        <h2>Questions fréquentes</h2>
        <Faq items={g.faq} />
        <nav className="guide-links" aria-label="Pour aller plus loin">
          <b>Nos vêtements</b>
          {g.categories.map((c) => <Link key={c} href={`/vetements/${c}`}>{getCategory(c)!.name} personnalisés</Link>)}
          {(g.sectors || []).map((s) => <Link key={s} href={`/metiers/${s}`}>{getSector(s)!.h1}</Link>)}
          <b>À lire aussi</b>
          {g.related.map((r) => { const x = getGuide(r); return x ? <Link key={r} href={`/guides/${r}`}>{x.title}</Link> : null; })}
        </nav>
      </article>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, inLanguage: 'fr', about: main.name,
        mainEntityOfPage: `${SITE_URL}/guides/${g.slug}`, publisher: { '@type': 'Organization', name: 'alwaan', url: SITE_URL } }} />
    </>
  );
}
