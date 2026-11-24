import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '@/lib/guides';
import { Breadcrumbs } from '@/components/ui';

export const metadata: Metadata = { title: 'Guides et conseils vêtements personnalisés', description: 'Impression DTF, choix des modèles, tailles, normes, prix : nos guides pour bien choisir vos vêtements professionnels personnalisés.', alternates: { canonical: '/guides' } };
export default function Guides() {
  return (
    <>
      <Breadcrumbs items={[['Guides']]} />
      <section className="wrap page-narrow">
        <h1>Guides et conseils</h1>
        <p className="muted mt8">Tout pour choisir, préparer et commander vos vêtements personnalisés.</p>
        <div className="guide-list">{GUIDES.map((g) => <Link key={g.slug} href={`/guides/${g.slug}`}><strong>{g.title}</strong><span>{g.description}</span></Link>)}</div>
      </section>
    </>
  );
}
