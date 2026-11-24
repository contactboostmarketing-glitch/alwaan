import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/catalog';
import { DESIGNS, OCCASIONS, designsOf, type Design } from '@/lib/designs';
import { designDataUrl, designZone } from '@/lib/designArt';
import { unitAt } from '@/lib/pricing';
import { Garment } from '@/components/Garment';
import { Price } from '@/components/Price';
import { RetailMode } from '@/components/RetailMode';
import { EventBanner } from '@/components/EventBanner';
import { Breadcrumbs, Perks } from '@/components/ui';
import { href, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { I } from '@/components/Icons';

export const giftsMeta = (lang: Lang, occasion?: string): Metadata => {
  const o = occasion ? OCCASIONS.find((x) => x.id === occasion) : null;
  const path = `/idees-cadeaux${o ? `/${o.id}` : ''}`;
  return lang === 'en'
    ? { title: o ? `${o.en.name}: custom t-shirts and gifts` : 'Custom gift ideas: t-shirts and caps with your text', description: 'Ready-made designs to personalise with a name, a date or an age: hen and stag parties, birthdays, family, Christmas. Printed from 1 piece.', alternates: alternates(lang, path) }
    : { title: o ? `${o.fr.name} : t-shirts et cadeaux personnalisés` : 'Idées cadeaux personnalisés : t-shirts et casquettes à votre texte', description: 'Des designs prêts à personnaliser avec un prénom, une date ou un âge : EVJF, EVG, anniversaires, famille, Noël. Imprimé dès 1 pièce.', alternates: alternates(lang, path) };
};

function DesignCard({ d, lang }: { d: Design; lang: Lang }) {
  const p = getProduct(d.products[0])!, color = d.colors?.find((c) => p.colors.includes(c)) ?? p.colors[0];
  return (
    <Link className="pcard design-card" href={`${href(lang, '/idees-cadeaux')}/creer/${d.id}`}>
      <div className="img"><Garment slug={p.slug} color={color} zones={[designZone(p)]} logo={designDataUrl(d, color)} /></div>
      <strong>{d[lang]}</strong>
      <span className="price">{tr(lang, 'dès')} <Price ht={unitAt({ slug: p.slug, zones: [designZone(p)], design: d.id }, 1)} /></span>
    </Link>
  );
}

export function GiftsView({ lang, occasion }: { lang: Lang; occasion?: string }) {
  const o = occasion ? OCCASIONS.find((x) => x.id === occasion) : null;
  if (occasion && !o) notFound();
  const list = o ? designsOf(o.id) : DESIGNS;
  const t = (s: string) => tr(lang, s);
  return (
    <>
      <Breadcrumbs lang={lang} items={o ? [[t('Idées cadeaux'), href(lang, '/idees-cadeaux')], [o[lang].name]] : [[t('Idées cadeaux')]]} />
      <section className="wrap gifts">
        <RetailMode />
        <span className="season-kicker"><I name="gift" size={16} /> {t('Pour les particuliers')}</span>
        <h1>{o ? o[lang].name : t('Idées cadeaux à personnaliser')}</h1>
        <p className="lead">{t('Choisissez un design, écrivez votre texte, c\'est prêt. Dès 1 pièce.')}</p>
        <Perks items={[['eye', t('Aperçu en direct')], ['one', t('Dès 1 pièce')], ['truck', t('Expédié en 7 jours ouvrés')]]} />
        <EventBanner />
        <div className="occasions">{OCCASIONS.map((x) => (
          <Link key={x.id} className="occasion" aria-current={x.id === occasion ? 'page' : undefined} href={`${href(lang, '/idees-cadeaux')}/${x.id}`}><span className="occ-ic"><I name={x.icon} size={22} /></span><b>{x[lang].name}</b><small>{x[lang].sub}</small></Link>
        ))}</div>
        <div className="grid g6 mt">{list.map((d) => <DesignCard key={d.id} d={d} lang={lang} />)}</div>
        <p className="muted small mt">{t('Votre propre logo ou une commande d\'équipe ?')} <Link className="link" href={href(lang, '/assistant')}>{t('Créer ma tenue en 1 minute')}</Link></p>
      </section>
    </>
  );
}
