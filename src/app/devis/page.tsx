import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui';
import { QuoteForm } from './QuoteForm';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Demander un devis', description: 'Dès 50 pièces, plusieurs modèles ou une échéance précise : devis gratuit sous 24 h ouvrées.', alternates: alternates('fr', '/devis') };
export default function QuotePage() {
  return (
    <>
      <Breadcrumbs items={[['Devis']]} />
      <section className="wrap page-narrow">
        <h1>Demander un devis</h1>
        <p className="muted mt8">Dès 50 pièces, plusieurs modèles ou une échéance précise : on vous répond sous 24 h ouvrées avec un prix.</p>
        <QuoteForm />
      </section>
    </>
  );
}
