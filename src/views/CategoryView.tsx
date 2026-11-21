import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { I } from '@/components/Icons';
import { CATEGORIES, GENERAL_FAQ, SECTORS, getCategory, productsIn } from '@/lib/catalog';
import { Breadcrumbs, Faq, LinkChips, MoreInfo, Perks, ProductCard } from '@/components/ui';
import { guidesFor } from '@/lib/guides';
import { categoryL, generalFaq, href, sectorL, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';

export function categoryMeta(lang: Lang, slug: string): Metadata {
  const c0 = getCategory(slug); if (!c0) return {};
  const c = categoryL(lang, c0);
  return { title: c.title, description: c.intro, alternates: alternates(lang, `/vetements/${c.slug}`) };
}

export function CategoryView({ lang, slug }: { lang: Lang; slug: string }) {
  const c0 = getCategory(slug);
  if (!c0) notFound();
  const c = categoryL(lang, c0);
  const t = (s: string, v?: Record<string, string | number>) => tr(lang, s, v);
  const list = [...productsIn(c.slug)].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
  const sectors = SECTORS.filter((s) => s.categories.includes(c.slug)).map((s) => sectorL(lang, s));
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t('Vêtements')], [c.name]]} />
      <section className="wrap">
        <div className="cat-head">
          <div><h1>{lang === 'en' ? `Custom ${c.name.toLowerCase()}` : `${c.name} personnalisés`}</h1><p className="mt8">{c.intro}</p></div>
          <Perks items={[['one', t('Dès 1 pièce')], ['eye', t('Maquette en direct')], ['truck', t('7 jours')]]} />
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
          <LinkChips title={t('Par métier')} links={sectors.map((s) => [`${c.name} · ${s.name.toLowerCase()}`, href(lang, `/metiers/${s.slug}`)])} />
          <LinkChips title={t('Autres vêtements')} links={CATEGORIES.filter((o) => o.slug !== c.slug).map((o) => { const x = categoryL(lang, o); return [lang === 'en' ? `Custom ${x.name.toLowerCase()}` : `${x.name} personnalisés`, href(lang, `/vetements/${o.slug}`)]; })} />
          <MoreInfo title={lang === 'en' ? `Choosing your custom ${c.singular}` : `Bien choisir son ${c.singular} personnalisé`}>{c.details?.map((d) => <p key={d.slice(0, 30)}>{d}</p>)}</MoreInfo>
          <h2 className="mt">{t('Questions fréquentes')}</h2><Faq items={[...c.faq, ...generalFaq(lang, GENERAL_FAQ).slice(0, 2)]} />
          {lang === 'fr' && <LinkChips title="Nos guides" links={guidesFor(c.slug).map((g) => [g.title, `/guides/${g.slug}`])} />}
        </div>
      </section>
    </>
  );
}
