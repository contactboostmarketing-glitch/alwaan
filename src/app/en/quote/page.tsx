import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui';
import { QuoteForm } from '@/app/devis/QuoteForm';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Request a quote', description: 'From 50 pieces, several models or a tight deadline: free quote within 24 business hours.', alternates: alternates('en', '/devis') };
export default function QuotePage() {
  return (
    <>
      <Breadcrumbs lang="en" items={[['Quote']]} />
      <section className="wrap page-narrow">
        <h1>Request a quote</h1>
        <p className="muted mt8">From 50 pieces, several models or a tight deadline: we reply within 24 business hours with a price.</p>
        <QuoteForm />
      </section>
    </>
  );
}
