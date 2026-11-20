// Petits composants partagés (serveur sauf mention).
import Link from 'next/link';
import type { ReactNode } from 'react';
import { defaultColor, fromPrice, type Product } from '@/lib/catalog';
import { colorName, href, productL, tr, type Lang } from '@/i18n';
import { SITE_URL } from '@/lib/site';
import { Garment } from './Garment';
import { Price } from './Price';

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

export function ProductCard({ p: base, lang = 'fr' }: { p: Product; lang?: Lang }) {
  const p = productL(lang, base);
  return (
    <Link className="pcard" href={href(lang, `/produits/${p.slug}`)}>
      {p.bestseller && <span className="flag">Best-seller</span>}
      <div className="img"><Garment slug={p.slug} color={defaultColor(p)} /></div>
      <strong>{p.name}</strong>
      <small>{p.type}</small>
      <span className="price">{tr(lang, 'dès')} <Price ht={fromPrice(p)} /></span>
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

const ICONS: Record<string, string> = {
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  one: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 13h-2V10H9.5V8.5L12.3 8H13v8Z',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Zm5-4.5A1.5 1.5 0 1 0 8 10.5 1.5 1.5 0 0 0 8 7.5Z',
  truck: 'M2 6h11v9H2zM13 9h4l3 3v3h-7zM6 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  shirt: 'M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.7-2 3-4 3S8.5 4.7 8 3Z',
  upload: 'M12 3 7 8h3v6h4V8h3l-5-5ZM4 17v3h16v-3h-2v1H6v-1H4Z',
  check: 'M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z',
  lock: 'M7 10V8a5 5 0 0 1 10 0v2h1v11H6V10h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z',
  redo: 'M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z',
};
export function Icon({ name, size = 18 }: { name: keyof typeof ICONS | string; size?: number }) {
  return <svg className="ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[name] || ICONS.check} fill="currentColor" /></svg>;
}

/** Atouts en pictos + 2 ou 3 mots. */
export function Perks({ items }: { items: [string, ReactNode][] }) {
  return <ul className="perks">{items.map(([ic, t], i) => <li key={i}><Icon name={ic} />{t}</li>)}</ul>;
}

export function Checks({ items }: { items: ReactNode[] }) {
  return <div className="checks">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
}
