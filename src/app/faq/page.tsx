import type { Metadata } from 'next';
import { CATEGORIES, GENERAL_FAQ } from '@/lib/catalog';
import { Breadcrumbs, Faq } from '@/components/ui';

export const metadata: Metadata = { title: 'Questions fréquentes', description: 'Minimum de commande, délais, logo, tailles, paiement, retours : toutes les réponses sur nos vêtements personnalisés.', alternates: { canonical: '/faq' } };
const SIZES: [string, string][] = [['Comment choisir la bonne taille ?', 'Nos vêtements suivent les tailles européennes standard. Mesurez un vêtement que vous portez déjà à plat, d\'une aisselle à l\'autre, et comparez au tableau de chaque modèle.'], ['Je ne connais pas encore les tailles de mon équipe.', 'Commandez la quantité totale : vous pourrez nous donner la répartition des tailles avant la production.']];
export default function FaqPage() {
  return (
    <>
      <Breadcrumbs items={[['Questions fréquentes']]} />
      <section className="wrap page-narrow">
        <h1>Questions fréquentes</h1>
        <h2 className="mt">Commande et livraison</h2><Faq items={GENERAL_FAQ} withSchema={false} />
        <h2 className="mt" id="tailles">Tailles</h2><Faq items={SIZES} withSchema={false} />
        {CATEGORIES.map((c) => <div key={c.slug}><h2 className="mt">{c.name}</h2><Faq items={c.faq} withSchema={false} /></div>)}
        <Faq items={[...GENERAL_FAQ, ...SIZES, ...CATEGORIES.flatMap((c) => c.faq)]} withSchema />
      </section>
    </>
  );
}
