import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, GENERAL_FAQ, PRODUCTS, SECTORS, fromPrice, getCategory, getProduct, topPrice } from '@/lib/catalog';
import { Configurator } from '@/components/Configurator';
import { Breadcrumbs, Faq, Icon, JsonLd, LinkChips, MoreInfo, ProductCard } from '@/components/ui';
import { SITE_URL } from '@/lib/site';
import { categoryL, colorName, generalFaq, href, productL, sectorL, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';

export function productMeta(lang: Lang, slug: string): Metadata {
  const p0 = getProduct(slug); if (!p0) return {};
  const p = productL(lang, p0);
  const sizes = p.sizes === 'TU' ? tr(lang, 'taille unique') : p.sizes;
  return {
    title: lang === 'en' ? `Custom ${p.name} with your logo` : `${p.name} personnalisé à votre logo`,
    description: lang === 'en'
      ? `${p.name}: ${p.type.toLowerCase()}, ${p.colors.length} colours, ${sizes}. Your logo printed from 1 piece, live mock-up, delivered in 7 days.`
      : `${p.name} : ${p.type.toLowerCase()}, ${p.colors.length} coloris, ${sizes}. Marquage de votre logo dès 1 pièce, maquette en direct, livraison en 7 jours.`,
    alternates: alternates(lang, `/produits/${p.slug}`),
  };
}

export function ProductView({ lang, slug }: { lang: Lang; slug: string }) {
  const p0 = getProduct(slug);
  if (!p0) notFound();
  const p = productL(lang, p0);
  const c = categoryL(lang, getCategory(p.category)!);
  const t = (s: string, v?: Record<string, string | number>) => tr(lang, s, v);
  const related = [...PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug), ...PRODUCTS.filter((x) => x.bestseller && x.category !== p.category)].slice(0, 4);
  const [mat, weight] = p.composition.split('·').map((x) => x.trim());
  return (
    <>
      <Breadcrumbs lang={lang} items={[[c.name, href(lang, `/vetements/${c.slug}`)], [p.name]]} />
      <section className="wrap">
        <Suspense><Configurator slug={p.slug} /></Suspense>
        <div className="asst-cta"><span><b>{t('Pas le temps ?')}</b> {t('L\'assistant fait tout.')}</span><Link className="btn line small" href={href(lang, '/assistant')}>{t('Essayer')}</Link></div>
        <div className="seo1">
          <div className="spec-ic">
            <span><Icon name="shirt" /><b>{mat}</b></span>
            {weight && <span><Icon name="tag" /><b>{weight}</b></span>}
            <span><Icon name="one" /><b>{p.sizes === 'TU' ? t('Taille unique') : p.sizes}</b></span>
            <span><Icon name="redo" /><b>40 °C</b></span>
          </div>
          <MoreInfo title={t('Caractéristiques')}>
            <dl className="spec">
              <dt>{t('Composition')}</dt><dd>{p.composition}</dd>
              <dt>{t('Tailles')}</dt><dd>{p.sizes === 'TU' ? t('Taille unique réglable') : p.sizes}</dd>
              <dt>{t('Coloris')}</dt><dd>{p.colors.map((x) => colorName(lang, x)).join(', ')}</dd>
              <dt>{t('Marquage')}</dt><dd>{t('Impression DTF haute définition : couleurs vives, dégradés, tous textiles')}</dd>
              <dt>{t('Entretien')}</dt><dd>{t('Lavage 40 °C sur l\'envers, pas de sèche-linge')}</dd>
            </dl>
          </MoreInfo>
          <h2 className="mt">{t('Questions')}</h2>
          <Faq items={[...c.faq, generalFaq(lang, GENERAL_FAQ)[3]]} />
          <LinkChips title={t('Voir aussi')} links={[
            [lang === 'en' ? `All ${c.name.toLowerCase()}` : `Tous les ${c.name.toLowerCase()}`, href(lang, `/vetements/${c.slug}`)],
            ...SECTORS.filter((s) => s.categories.includes(c.slug)).map((s0): [string, string] => { const s = sectorL(lang, s0); return [lang === 'en' ? `${s.name} uniforms` : `Tenues ${s.name.toLowerCase()}`, href(lang, `/metiers/${s.slug}`)]; }),
            ...CATEGORIES.filter((o) => o.slug !== c.slug).slice(0, 3).map((o): [string, string] => { const x = categoryL(lang, o); return [lang === 'en' ? `Custom ${x.name.toLowerCase()}` : `${x.name} personnalisés`, href(lang, `/vetements/${o.slug}`)]; }),
          ]} />
        </div>
        <div className="sec-head mt"><h2>{t('Souvent commandés ensemble')}</h2></div>
        <div className="grid">{related.map((x) => <ProductCard key={x.slug} p={x} lang={lang} />)}</div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: `${p.type}. ${p.composition}.`, inLanguage: lang,
        brand: { '@type': 'Brand', name: 'alwaan' }, category: c.name, color: p.colors.map((x) => colorName(lang, x)).join(', '), material: p.composition,
        offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (fromPrice(p) * 1.2).toFixed(2), highPrice: (topPrice(p) * 1.2).toFixed(2), availability: 'https://schema.org/InStock', url: `${SITE_URL}${href(lang, `/produits/${p.slug}`)}` },
      }} />
    </>
  );
}
