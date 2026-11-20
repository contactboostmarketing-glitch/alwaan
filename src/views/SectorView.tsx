import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSector, productsIn } from '@/lib/catalog';
import { Breadcrumbs, LinkChips, Perks, ProductCard } from '@/components/ui';
import { guidesForSector } from '@/lib/guides';
import { categoryBySlug, href, sectorL, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';

export function sectorMeta(lang: Lang, slug: string): Metadata {
  const s0 = getSector(slug); if (!s0) return {};
  const s = sectorL(lang, s0);
  return { title: s.h1, description: s.intro, alternates: alternates(lang, `/metiers/${s.slug}`) };
}

/** Pages métier : SEO local au métier et pages d'arrivée des campagnes Google Ads / Meta. */
export function SectorView({ lang, slug }: { lang: Lang; slug: string }) {
  const s0 = getSector(slug);
  if (!s0) notFound();
  const s = sectorL(lang, s0);
  const t = (x: string) => tr(lang, x);
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t('Métiers')], [s.name]]} />
      <section className="wrap">
        <div className="cat-head">
          <div><h1>{s.h1}</h1><p className="mt8">{s.intro}</p></div>
          <Perks items={[['one', t('Dès 1 pièce')], ['eye', t('Maquette en direct')], ['truck', t('7 jours')]]} />
        </div>
        {s.categories.map((ck) => {
          const c = categoryBySlug(lang, ck)!;
          return (
            <div key={ck}>
              <div className="sec-head mt"><h2>{c.name}</h2><Link className="link" href={href(lang, `/vetements/${ck}`)}>{lang === 'en' ? `All ${c.name.toLowerCase()}` : `Tous les ${c.name.toLowerCase()}`}</Link></div>
              <div className="grid">{productsIn(ck).map((p) => <ProductCard key={p.slug} p={p} lang={lang} />)}</div>
            </div>
          );
        })}
        {lang === 'fr' && guidesForSector(s.slug).length > 0 && (
          <LinkChips title="Nos conseils" links={guidesForSector(s.slug).map((g) => [g.title, `/guides/${g.slug}`])} />
        )}
      </section>
    </>
  );
}
