import Link from 'next/link';
import { Breadcrumbs, JsonLd } from '@/components/ui';
import { I } from '@/components/Icons';
import { href, type Lang } from '@/i18n';
import { COMPANY, SITE_URL } from '@/lib/site';

const T = {
  fr: {
    crumb: 'Notre atelier', kicker: 'Haubourdin · Nord',
    h1: 'Vos tenues sont imprimées dans notre atelier du Nord',
    lead: 'Pas de sous-traitance à l\'autre bout du monde : chaque pièce est imprimée, contrôlée et expédiée par notre équipe, près de Lille.',
    steps: [['upload', 'Votre logo', 'Fond retiré, netteté vérifiée'], ['eye', 'Votre maquette', 'Vous validez ce qui sera imprimé'], ['zap', 'Impression DTF', 'Couleurs vives, dégradés, tous textiles'], ['camera', 'Contrôle photo', 'Chaque commande photographiée avant envoi'], ['truck', 'Expédition', 'France et Belgique, suivi par email']],
    whyH: 'Pourquoi c\'est important pour vous',
    why: [['clock', 'Des délais tenus', '7 jours ouvrés, 4 en express : on maîtrise toute la chaîne.'], ['users', 'Une équipe joignable', 'Une question ? Ce sont les personnes qui impriment qui vous répondent.'], ['redo', 'Un défaut ? Refait', 'Signalé sous 7 jours avec photo : la pièce est refaite à nos frais.'], ['leaf', 'Moins de transport', 'Impression locale, à la demande : pas de stock invendu à détruire.']],
    dtfH: 'L\'impression DTF, en bref',
    dtf: 'Votre logo est imprimé sur un film, puis transféré à chaud sur le vêtement. Résultat : toutes les couleurs, les dégradés et les détails fins, sur coton comme sur polyester, dès 1 pièce et sans frais de préparation. Lavable à 40 °C sur l\'envers.',
    cta: 'Créer ma tenue en 1 minute', cta2: 'Voir les réalisations',
  },
  en: {
    crumb: 'Our workshop', kicker: 'Haubourdin · Northern France',
    h1: 'Your workwear is printed in our workshop in northern France',
    lead: 'No outsourcing to the other side of the world: every piece is printed, checked and shipped by our team, near Lille.',
    steps: [['upload', 'Your logo', 'Background removed, sharpness checked'], ['eye', 'Your mock-up', 'You approve what will be printed'], ['zap', 'DTF printing', 'Vivid colours, gradients, all fabrics'], ['camera', 'Photo check', 'Every order photographed before shipping'], ['truck', 'Shipping', 'France and Belgium, tracked by email']],
    whyH: 'Why it matters to you',
    why: [['clock', 'Reliable lead times', '7 business days, 4 with express: we control the whole chain.'], ['users', 'A team you can reach', 'Questions are answered by the people who print.'], ['redo', 'Defect? Reprinted', 'Reported within 7 days with a photo: reprinted at our cost.'], ['leaf', 'Less transport', 'Local, on-demand printing: no unsold stock to destroy.']],
    dtfH: 'DTF printing in short',
    dtf: 'Your logo is printed on a film, then heat-transferred onto the garment. Every colour, gradient and fine detail, on cotton or polyester, from 1 piece with no setup fee. Washable at 40 °C inside out.',
    cta: 'Create my outfit in 1 minute', cta2: 'See our work',
  },
};

export function WorkshopView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const video = process.env.NEXT_PUBLIC_ATELIER_VIDEO; // lien d'intégration YouTube (ex. https://www.youtube-nocookie.com/embed/…)
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t.crumb]]} />
      <section className="wrap workshop">
        <span className="season-kicker"><I name="home" size={16} /> {t.kicker}</span>
        <h1>{t.h1}</h1>
        <p className="lead">{t.lead}</p>
        {video && <div className="ws-video"><iframe src={video} title={t.dtfH} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>}
        <ol className="ws-steps">{t.steps.map(([ic, b, s], i) => <li key={b}><span className="ws-n">{i + 1}</span><span className="step-ic"><I name={ic} size={26} /></span><b>{b}</b><small>{s}</small></li>)}</ol>
        <h2 className="mt">{t.whyH}</h2>
        <div className="advantages">{t.why.map(([ic, b, s]) => <div key={b} className="adv"><span className="adv-ic"><I name={ic} size={22} /></span><b>{b}</b><small>{s}</small></div>)}</div>
        <h2 className="mt">{t.dtfH}</h2>
        <p>{t.dtf}</p>
        <div className="ctas mt"><Link className="btn cta" href={href(lang, '/assistant')}>{t.cta}</Link><Link className="btn line" href={href(lang, '/realisations')}>{t.cta2}</Link></div>
        <p className="muted small mt">{COMPANY.name} · {COMPANY.address}</p>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'alwaan', legalName: COMPANY.name, url: SITE_URL, email: COMPANY.email, telephone: COMPANY.phone,
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: COMPANY.hours.schema.days, opens: COMPANY.hours.schema.opens, closes: COMPANY.hours.schema.closes }],
        address: { '@type': 'PostalAddress', streetAddress: '121 rue Léon Gambetta', postalCode: '59320', addressLocality: 'Haubourdin', addressCountry: 'FR' },
        areaServed: ['FR', 'BE'], description: t.lead,
      }} />
    </>
  );
}
