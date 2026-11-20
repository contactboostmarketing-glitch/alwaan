import { CATEGORIES, GENERAL_FAQ } from '@/lib/catalog';
import { Breadcrumbs, Faq } from '@/components/ui';
import { categoryL, generalFaq, tr, type Lang } from '@/i18n';

const SIZES: Record<Lang, [string, string][]> = {
  fr: [['Comment choisir la bonne taille ?', 'Nos vêtements suivent les tailles européennes standard. Mesurez un vêtement que vous portez déjà à plat, d\'une aisselle à l\'autre, et comparez au tableau de chaque modèle.'], ['Je ne connais pas encore les tailles de mon équipe.', 'Commandez la quantité totale : vous pourrez nous donner la répartition des tailles avant la production.']],
  en: [['How do I choose the right size?', 'Our garments follow standard European sizes. Lay a garment you already wear flat, measure from armpit to armpit and compare with each model’s size chart.'], ['I don’t know my team’s sizes yet.', 'Order the total quantity: you can send us the size breakdown before production.']],
};

export function FaqView({ lang }: { lang: Lang }) {
  const t = (s: string) => tr(lang, s);
  const general = generalFaq(lang, GENERAL_FAQ), cats = CATEGORIES.map((c) => categoryL(lang, c));
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t('Questions fréquentes')]]} />
      <section className="wrap page-narrow">
        <h1>{t('Questions fréquentes')}</h1>
        <h2 className="mt">{t('Commande et livraison')}</h2><Faq items={general} withSchema={false} />
        <h2 className="mt" id="tailles">{t('Tailles')}</h2><Faq items={SIZES[lang]} withSchema={false} />
        {cats.map((c) => <div key={c.slug}><h2 className="mt">{c.name}</h2><Faq items={c.faq} withSchema={false} /></div>)}
        <Faq items={[...general, ...SIZES[lang], ...cats.flatMap((c) => c.faq)]} schemaOnly />
      </section>
    </>
  );
}
