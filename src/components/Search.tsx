'use client';
// Recherche instantanée dans le catalogue, avec synonymes (gilet → haute visibilité, cuisine → tablier…).
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES, PRODUCTS } from '@/lib/catalog';
import { categoryL, productL, type Lang } from '@/i18n';
import { ProductCard } from './ui';

const SYN: Record<string, string> = {
  gilet: 'haute visibilité', parka: 'haute visibilité', veste: 'haute visibilité', chantier: 'haute visibilité', jaune: 'haute visibilité', fluo: 'haute visibilité', securite: 'haute visibilité', vest: 'haute visibilité', jacket: 'haute visibilité',
  cuisine: 'tablier', restaurant: 'tablier', serveur: 'tablier', apron: 'tablier', kitchen: 'tablier',
  tshirt: 't-shirt', tee: 't-shirt', teeshirt: 't-shirt', maillot: 't-shirt', sport: 't-shirt', club: 't-shirt',
  casquette: 'casquette', cap: 'casquette', hat: 'casquette', chapeau: 'casquette',
  chemise: 'chemise', shirt: 'chemise', bureau: 'chemise', accueil: 'polo',
};
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ');

export function Search({ lang }: { lang: Lang }) {
  const [q, setQ] = useState(useSearchParams().get('q') || '');
  const words = norm(q).split(' ').filter((w) => w.length > 1).map((w) => norm(SYN[w] || w));
  const hits = !words.length ? [] : PRODUCTS.filter((p0) => {
    const p = productL(lang, p0), c = CATEGORIES.find((x) => x.slug === p0.category)!;
    const hay = norm([p0.name, p.name, p0.type, p.type, p0.composition, c.name, categoryL(lang, c).name, p0.slug].join(' '));
    return words.every((w) => w.split(' ').every((x) => hay.includes(x)));
  });
  const en = lang === 'en';
  return (
    <section className="wrap" style={{ paddingBlock: 24 }}>
      <h1>{en ? 'Search' : 'Rechercher'}</h1>
      <input className="search-in" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={en ? 'Polo, apron, hi-vis vest…' : 'Polo, tablier, gilet jaune…'} aria-label={en ? 'Search the catalogue' : 'Rechercher dans le catalogue'} />
      {words.length > 0 && <p className="muted small" role="status">{en ? `${hits.length} result${hits.length > 1 ? 's' : ''}` : `${hits.length} résultat${hits.length > 1 ? 's' : ''}`}</p>}
      <div className="grid cat-grid mt">{hits.map((p) => <ProductCard key={p.slug} p={p} lang={lang} />)}</div>
      {words.length > 0 && !hits.length && <p className="mt">{en ? 'Nothing found. Ask us on WhatsApp or request a quote: we source other garments.' : 'Rien trouvé. Demandez-nous sur WhatsApp ou par devis : nous trouvons d\'autres vêtements.'}</p>}
    </section>
  );
}
