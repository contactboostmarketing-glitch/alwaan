// Petits composants partagés (serveur sauf mention).
import Link from 'next/link';
import type { ReactNode } from 'react';
import { defaultColor, fromPrice, type Product } from '@/lib/catalog';
import { colorName, href, productL, tr, type Lang } from '@/i18n';
import { SITE_URL } from '@/lib/site';
import { Garment } from './Garment';
import { Price } from './Price';
import { I } from './Icons';

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Fil d'Ariane visible + balisage BreadcrumbList. */
export function Breadcrumbs({ items, lang = 'fr' }: { items: [string, string?][]; lang?: Lang }) {
  const all: [string, string?][] = [[tr(lang, 'Accueil'), href(lang, '/')], ...items];
  return (
    <nav className="crumbs wrap" aria-label={tr(lang, 'Fil d\'Ariane')}>
      {all.map(([label, href], i) => (
        <span key={i}>{href && i < all.length - 1 ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}</span>
      ))}
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: all.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(href ? { item: SITE_URL + href } : {}) })),
      }} />
    </nav>
  );
}

/** FAQ visible + balisage FAQPage (utile au SEO et aux moteurs IA). */
export function Faq({ items, withSchema = true, schemaOnly = false }: { items: [string, string][]; withSchema?: boolean; schemaOnly?: boolean }) {
  return (
    <div className="faq">
      {!schemaOnly && items.map(([q, a]) => (
        <details key={q}><summary>{q}</summary><p>{a}</p></details>
      ))}
      {withSchema && <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }} />}
    </div>
  );
}

export function ProductCard({ p: base, lang = 'fr', blank = false }: { p: Product; lang?: Lang; blank?: boolean }) {
  const p = productL(lang, base);
  return (
    <Link className="pcard" href={`${href(lang, `/produits/${p.slug}`)}${blank ? '?vierge=1' : ''}`}>
      {p.bestseller && <span className="flag">Best-seller</span>}
      <div className="img"><Garment slug={p.slug} color={defaultColor(p)} /></div>
      <strong>{p.name}</strong>
      <small>{p.type}</small>
      <span className="price">{tr(lang, 'dès')} <Price ht={blank ? base.price : fromPrice(p)} />{!blank && <small> {tr(lang, 'dès 30 pièces')}</small>}</span>
      <span className="dots" aria-label={tr(lang, '{n} coloris', { n: p.colors.length })}>
        {p.colors.slice(0, 6).map((c) => <i key={c} style={{ background: c }} title={colorName(lang, c)} />)}
        {p.colors.length > 6 && <small>+{p.colors.length - 6}</small>}
      </span>
    </Link>
  );
}

/** Texte de fond (SEO, GEO) : présent dans la page et lisible par les moteurs, replié pour le client. */
export function MoreInfo({ title, children, level = 2 }: { title: string; children: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? 'h2' : 'h3';
  return <details className="more"><summary><H>{title}</H></summary><div className="more-body">{children}</div></details>;
}

/** Liens internes (maillage) en pastilles plutôt qu'en liste à lire. */
export function LinkChips({ title, links }: { title?: string; links: [string, string][] }) {
  if (!links.length) return null;
  return (
    <nav className="lchips" aria-label={title}>
      {title && <b>{title}</b>}
      <div>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
    </nav>
  );
}

/** Icône au trait (voir Icons.tsx). */
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <I name={name} size={size} className="ico" />;
}

/** Atouts en pictos + 2 ou 3 mots. */
export function Perks({ items }: { items: [string, ReactNode][] }) {
  return <ul className="perks">{items.map(([ic, t], i) => <li key={i}><Icon name={ic} />{t}</li>)}</ul>;
}

export function Checks({ items }: { items: ReactNode[] }) {
  return <div className="checks">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
}
