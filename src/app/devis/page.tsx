import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui';
import { QuoteForm } from './QuoteForm';

export const metadata: Metadata = { title: 'Demander un devis', description: 'Plus de 250 pièces, plusieurs modèles ou une échéance précise : devis gratuit sous 2 h ouvrées.', alternates: { canonical: '/devis' } };
export default function QuotePage() {
  return (
    <>
      <Breadcrumbs items={[['Devis']]} />
      <section className="wrap page-narrow">
        <h1>Demander un devis</h1>
        <p className="muted mt8">Plus de 250 pièces, plusieurs modèles ou une échéance précise : on vous répond sous 2 h ouvrées avec un prix.</p>
        <QuoteForm />
      </section>
    </>
  );
}
