import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { I } from '@/components/Icons';
import { CATEGORIES, GENERAL_FAQ, SECTORS, getCategory, productsIn, customName } from '@/lib/catalog';
import { Breadcrumbs, Faq, LinkChips, MoreInfo, Perks, ProductCard } from '@/components/ui';
import { guidesFor } from '@/lib/guides';
import { CATEGORY_SEO } from '@/lib/categorySeo';
import { PriceExamples } from '@/components/PriceExamples';
import { categoryL, generalFaq, href, sectorL, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';

export function categoryMeta(lang: Lang, slug: string): Metadata {
  const c0 = getCategory(slug); if (!c0) return {};
  const c = categoryL(lang, c0);
  const seo = lang === 'fr' ? CATEGORY_SEO[slug] : undefined; // title et description travaillés (mots-clés Semrush)
  return { title: seo?.title ?? c.title, description: seo?.description ?? c.intro, alternates: alternates(lang, `/vetements/${c.slug}`) };
}

export function CategoryView({ lang, slug }: { lang: Lang; slug: string }) {
  const c0 = getCategory(slug);
  if (!c0) notFound();
  const c = categoryL(lang, c0);
  const t = (s: string, v?: Record<string, string | number>) => tr(lang, s, v);
  const list = [...productsIn(c.slug)].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
  const sectors = SECTORS.filter((s) => s.categories.includes(c.slug)).map((s) => sectorL(lang, s));
  const seo = lang === 'fr' ? CATEGORY_SEO[c.slug] : undefined;
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t('Vêtements'), href(lang, '/vetements-de-travail-personnalises')], [c.name]]} />
      <section className="wrap">
        <div className="cat-head">
          <div><h1>{lang === 'en' ? `Custom ${c.name.toLowerCase()}` : seo?.h1 ?? customName(c)}</h1><p className="mt8">{seo?.lead ?? c.intro}</p></div>
          <Perks items={[['one', t('Dès 1 pièce')], ['eye', t('Maquette en direct')], ['truck', t('Expédié en 7 jours ouvrés')]]} />
        </div>
        <div className="grid cat-grid">
          {list.map((p) => <ProductCard key={p.slug} p={p} lang={lang} />)}
          <Link className="cat-cta" href={href(lang, '/assistant')}>
            <span className="cat-cta-ic"><I name="sparkles" size={26} /></span>
            <b>{tr(lang, 'Créer ma tenue en 1 minute')}</b>
            <small>{tr(lang, 'Votre logo sur le vêtement, en direct')}</small>
            <span className="btn cta small">{tr(lang, 'Commencer')} <I name="arrow" size={16} /></span>
          </Link>
          <Link className="cat-cta alt" href={href(lang, '/lien-equipe')}>
            <span className="cat-cta-ic"><I name="users" size={26} /></span>
            <b>{tr(lang, 'Lien d\'équipe')}</b>
            <small>{tr(lang, 'Chacun donne sa taille, votre panier se remplit seul')}</small>
            <span className="btn line small">{tr(lang, 'Découvrir')} <I name="arrow" size={16} /></span>
          </Link>
        </div>
        <div className="seo1">
          {seo?.sections.map((x) => (
            <section key={x.h2}>
              <h2 className="mt">{x.h2}</h2>
              {x.p.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              {x.prices && <PriceExamples rows={x.prices} lang={lang} />}
              {x.links && <LinkChips links={x.links} />}
            </section>
          ))}
          <LinkChips title={t('Par métier')} links={sectors.map((s) => [`${c.name} · ${s.name.toLowerCase()}`, href(lang, `/metiers/${s.slug}`)])} />
          <LinkChips title={t('Autres vêtements')} links={CATEGORIES.filter((o) => o.slug !== c.slug).map((o) => { const x = categoryL(lang, o); return [lang === 'en' ? `Custom ${x.name.toLowerCase()}` : customName(x), href(lang, `/vetements/${o.slug}`)]; })} />
          <MoreInfo title={lang === 'en' ? `Choosing your custom ${c.singular}` : `Bien choisir : ${c.name.toLowerCase()}`}>{c.details?.map((d) => <p key={d.slice(0, 30)}>{d}</p>)}</MoreInfo>
          <h2 className="mt">{t('Questions fréquentes')}</h2><Faq items={[...(seo?.faq ?? []), ...c.faq, ...generalFaq(lang, GENERAL_FAQ).slice(0, 2)]} />
          {lang === 'fr' && <LinkChips title="Nos guides" links={guidesFor(c.slug).map((g) => [g.title, `/guides/${g.slug}`])} />}
        </div>
      </section>
    </>
  );
}
