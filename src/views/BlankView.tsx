import Link from 'next/link';
import { CATEGORIES, PRODUCTS } from '@/lib/catalog';
import { BLANK_DAYS } from '@/lib/delivery';
import { Breadcrumbs, Faq, ProductCard } from '@/components/ui';
import { I } from '@/components/Icons';
import { categoryL, href, type Lang } from '@/i18n';

const T = {
  fr: {
    crumb: 'Textile vierge', kicker: 'Sans marquage',
    h1: 'Textile vierge, à l\'unité ou en gros',
    lead: 'Polos, t-shirts, chemises, tabliers, casquettes et haute visibilité, sans impression. Au prix du vêtement seul, pour les pros comme pour les particuliers.',
    perks: [['tag', 'Prix du vêtement seul', 'Aucun frais de marquage'], ['one', 'Dès 1 pièce', 'Toutes tailles, toutes couleurs'], ['truck', `Expédié sous ${BLANK_DAYS} jours`, 'Quand l\'article est en stock'], ['redo', '14 jours pour changer d\'avis', 'Particuliers : rétractation possible']],
    cta: 'Ajouter votre logo plus tard ? Faites-le en 1 minute', ctaBtn: 'Créer ma tenue',
    faq: [
      ['Puis-je commander du textile vierge sans logo ?', 'Oui. Sur chaque fiche produit, choisissez « Textile vierge » : vous payez le prix du vêtement seul, dès 1 pièce.'],
      ['Quels sont les délais pour du textile vierge ?', `Les articles en stock sont expédiés sous ${BLANK_DAYS} jours ouvrés. Une couleur ou une taille « sur commande » ajoute 5 jours ouvrés, c'est indiqué sur la fiche produit avant de payer.`],
      ['Y a-t-il des prix de gros ?', 'Le prix affiché est le même dès 1 pièce. Revendeurs et agences : -10 % sur tout après vérification du Kbis dans votre espace client. Pour un très gros volume, écrivez-nous.'],
      ['Puis-je retourner du textile vierge ?', 'Oui pour les particuliers : 14 jours de rétractation à réception, articles neufs et non portés. Les articles personnalisés, eux, ne sont ni repris ni échangés.'],
      ['Puis-je mélanger textile vierge et personnalisé ?', 'Oui, dans le même panier. La livraison est offerte dès 150 € HT au total.'],
    ] as [string, string][],
  },
  en: {
    crumb: 'Blank garments', kicker: 'Unprinted',
    h1: 'Blank garments, single pieces or bulk',
    lead: 'Polos, t-shirts, shirts, aprons, caps and hi-vis, with no printing. Garment price only, for businesses and individuals.',
    perks: [['tag', 'Garment price only', 'No printing fee'], ['one', 'From 1 piece', 'All sizes, all colours'], ['truck', `Ships within ${BLANK_DAYS} days`, 'When the item is in stock'], ['redo', '14 days to change your mind', 'Consumers: right of withdrawal']],
    cta: 'Want your logo after all? It takes 1 minute', ctaBtn: 'Create my outfit',
    faq: [
      ['Can I order blank garments without a logo?', 'Yes. On each product page choose "Blank garment": you pay the garment price only, from 1 piece.'],
      ['How fast are blank garments shipped?', `In-stock items ship within ${BLANK_DAYS} business days. A colour or size marked "made to order" adds 5 business days, shown before you pay.`],
      ['Are there bulk prices?', 'The price is the same from 1 piece. Resellers and agencies: -10% on everything once your company is verified. For very large volumes, contact us.'],
      ['Can I return blank garments?', 'Yes for consumers: 14-day withdrawal from delivery, items new and unworn. Personalised items cannot be returned or exchanged.'],
      ['Can I mix blank and printed items?', 'Yes, in the same cart. Free delivery from €150 excl. VAT in total.'],
    ] as [string, string][],
  },
};

export function BlankView({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t.crumb]]} />
      <section className="wrap blank-lp">
        <span className="season-kicker"><I name="shirt" size={16} /> {t.kicker}</span>
        <h1>{t.h1}</h1>
        <p className="lead">{t.lead}</p>
        <div className="advantages">{t.perks.map(([ic, b, s]) => <div key={b} className="adv"><span className="adv-ic"><I name={ic} size={22} /></span><b>{b}</b><small>{s}</small></div>)}</div>
        {CATEGORIES.map((c) => {
          const list = PRODUCTS.filter((p) => p.category === c.slug);
          return list.length ? (
            <div key={c.slug} className="blank-cat">
              <h2>{categoryL(lang, c).name}</h2>
              <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} lang={lang} blank />)}</div>
            </div>
          ) : null;
        })}
        <div className="nudge mt"><span>{t.cta}</span><Link className="btn cta small" href={href(lang, '/assistant')}>{t.ctaBtn}</Link></div>
        <h2 className="mt">FAQ</h2>
        <Faq items={t.faq} />
      </section>
    </>
  );
}
