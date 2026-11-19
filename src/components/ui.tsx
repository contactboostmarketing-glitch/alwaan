// Petits composants partagés (serveur sauf mention).
import Link from 'next/link';
import type { ReactNode } from 'react';
import { COLOR_NAMES, defaultColor, fromPrice, type Product } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site';
import { Garment } from './Garment';
import { Price } from './Price';

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Fil d'Ariane visible + balisage BreadcrumbList. */
export function Breadcrumbs({ items }: { items: [string, string?][] }) {
  const all: [string, string?][] = [['Accueil', '/'], ...items];
  return (
    <nav className="crumbs wrap" aria-label="Fil d'Ariane">
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
export function Faq({ items, withSchema = true }: { items: [string, string][]; withSchema?: boolean }) {
  return (
    <div className="faq">
      {items.map(([q, a], i) => (
        <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
      ))}
      {withSchema && <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }} />}
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link className="pcard" href={`/produits/${p.slug}`}>
      {p.bestseller && <span className="flag">Best-seller</span>}
      <div className="img"><Garment slug={p.slug} color={defaultColor(p)} /></div>
      <strong>{p.name}</strong>
      <small>{p.type} · {p.sizes === 'TU' ? 'taille unique' : p.sizes}</small>
      <span className="price">dès <Price ht={fromPrice(p)} /></span>
      <span className="dots" aria-label={`${p.colors.length} coloris`}>
        {p.colors.slice(0, 6).map((c) => <i key={c} style={{ background: c }} title={COLOR_NAMES[c]} />)}
        {p.colors.length > 6 && <small>+{p.colors.length - 6}</small>}
      </span>
    </Link>
  );
}

export function Checks({ items }: { items: ReactNode[] }) {
  return <div className="checks">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
}
