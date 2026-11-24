// Tableau d'exemples de prix par pièce (1, 10, 30 pièces au même logo), calculés comme au panier.
// Le montant suit l'affichage choisi en haut de page (Pro HT / Particulier TTC).
import { unitAt } from '@/lib/pricing';
import type { PriceRow } from '@/lib/categorySeo';
import type { Lang } from '@/i18n';
import { Price } from './Price';

export function PriceExamples({ rows, qtys = [1, 10, 30], lang = 'fr' }: { rows: PriceRow[]; qtys?: number[]; lang?: Lang }) {
  const qLabel = (q: number) => (lang === 'en' ? `${q} piece${q > 1 ? 's' : ''}` : `${q} pièce${q > 1 ? 's' : ''}`);
  return (
    <div className="price-ex">
      <table className="size-tbl">
        <thead><tr><th>{lang === 'en' ? 'Price per piece' : 'Prix par pièce'}</th>{qtys.map((q) => <th key={q}>{qLabel(q)}</th>)}</tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={`${r.slug}-${r.zones.join('-')}`}><td>{r.label}</td>{qtys.map((q) => <td key={q}><Price ht={unitAt({ slug: r.slug, zones: r.zones }, q)} /></td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
