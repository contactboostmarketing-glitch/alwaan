import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, GENERAL_FAQ, PRODUCTS, SECTORS, defaultColor, fromPrice, getCategory, getProduct, topPrice, customName } from '@/lib/catalog';
import { Configurator } from '@/components/Configurator';
import { Garment } from '@/components/Garment';
import { Price } from '@/components/Price';
import { ReviewList } from '@/components/ReviewList';
import { publishedReviews, stats } from '@/lib/reviews';
import { Breadcrumbs, Faq, Icon, JsonLd, LinkChips, MoreInfo, ProductCard } from '@/components/ui';
import { SITE_URL } from '@/lib/site';
import { categoryL, colorName, generalFaq, href, productL, sectorL, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';

export function productMeta(lang: Lang, slug: string): Metadata {
  const p0 = getProduct(slug); if (!p0) return {};
  const p = productL(lang, p0);
  const sizes = p.sizes === 'TU' ? tr(lang, 'taille unique') : p.sizes;
  return {
    title: lang === 'en' ? `Custom ${p.name} with your logo` : `${p.name} personnalisable à votre logo`,
    description: lang === 'en'
      ? `${p.name}: ${p.type.toLowerCase()}, ${p.colors.length} colours, ${sizes}. Your logo printed from 1 piece, live mock-up, shipped in 7 business days.`
      : `${p.name} : ${p.type.toLowerCase()}, ${p.colors.length} coloris, ${sizes}. Marquage de votre logo dès 1 pièce, maquette en direct, expédition en 7 jours ouvrés.`,
    alternates: alternates(lang, `/produits/${p.slug}`),
  };
}

export async function ProductView({ lang, slug }: { lang: Lang; slug: string }) {
  const p0 = getProduct(slug);
  if (!p0) notFound();
  const p = productL(lang, p0);
  const c = categoryL(lang, getCategory(p.category)!);
  const t = (s: string, v?: Record<string, string | number>) => tr(lang, s, v);
  const related = [...PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug), ...PRODUCTS.filter((x) => x.bestseller && x.category !== p.category)].slice(0, 4);
  const [mat, weight] = p.composition.split('·').map((x) => x.trim());
  // Avis publiés : ceux du produit, sinon ceux de la boutique (affichés comme tels).
  const reviews = await publishedReviews();
  const rs = stats(reviews, p.slug);
  return (
    <>
      <Breadcrumbs lang={lang} items={[[c.name, href(lang, `/vetements/${c.slug}`)], [p.name]]} />
      <section className="wrap">
        {/* Rendu serveur de l'en-tête de la fiche (H1, prix, visuel) à la place du configurateur le temps qu'il charge : pas de saut de mise en page. */}
        <Suspense fallback={
          <div className="pdp pdp-skel">
            <div className="gallery"><div className="stage"><Garment slug={p.slug} color={defaultColor(p0)} /></div></div>
            <div className="buy">
              <div>
                <h1 className="pdp-title">{p.name}</h1>
                <p className="muted">{p.type} · {p.composition}</p>
                <p className="from">{t('dès')} <b><Price ht={fromPrice(p0)} /></b> {t('la pièce, logo compris')}</p>
              </div>
              <div className="skel-block" aria-hidden="true" />
            </div>
          </div>
        }><Configurator slug={p.slug} /></Suspense>
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
            ...CATEGORIES.filter((o) => o.slug !== c.slug).slice(0, 3).map((o): [string, string] => { const x = categoryL(lang, o); return [lang === 'en' ? `Custom ${x.name.toLowerCase()}` : customName(x), href(lang, `/vetements/${o.slug}`)]; }),
          ]} />
        </div>
        <ReviewList reviews={reviews} slug={p.slug} lang={lang} />
        <div className="sec-head mt"><h2>{t('Souvent commandés ensemble')}</h2></div>
        <div className="grid">{related.map((x) => <ProductCard key={x.slug} p={x} lang={lang} />)}</div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: `${p.type}. ${p.composition}.`, inLanguage: lang,
        brand: { '@type': 'Brand', name: 'alwaan' }, category: c.name, color: p.colors.map((x) => colorName(lang, x)).join(', '), material: p.composition,
        ...(rs.count ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: rs.avg, reviewCount: rs.count, bestRating: 5, worstRating: 1 },
          review: rs.list.slice(0, 5).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.name }, datePublished: r.createdAt.slice(0, 10), reviewBody: r.text, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 } })),
        } : {}),
        offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (fromPrice(p) * 1.2).toFixed(2), highPrice: (topPrice(p) * 1.2).toFixed(2), availability: 'https://schema.org/InStock', url: `${SITE_URL}${href(lang, `/produits/${p.slug}`)}` },
      }} />
    </>
  );
}
