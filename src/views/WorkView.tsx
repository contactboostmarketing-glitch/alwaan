import Link from 'next/link';
import { getProduct } from '@/lib/catalog';
import { publishedReviews, stats } from '@/lib/reviews';
import { Breadcrumbs } from '@/components/ui';
import { I } from '@/components/Icons';
import { ReviewList, Stars } from '@/components/ReviewList';
import { href, tr, type Lang } from '@/i18n';

/** Tant qu'il n'y a pas de photo client, la page présente ce que reçoit le client (et n'est pas indexée). */
export async function workIndexable() { return (await publishedReviews()).some((r) => r.photoId); }

/** Réalisations : photos de tenues portées envoyées par les clients (avec leur accord), puis les avis. */
export async function WorkView({ lang }: { lang: Lang }) {
  const t = (s: string, v?: Record<string, string | number>) => tr(lang, s, v);
  const reviews = await publishedReviews();
  const photos = reviews.filter((r) => r.photoId);
  const s = stats(reviews);
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t('Réalisations clients')]]} />
      <section className="wrap">
        <span className="season-kicker"><I name="camera" size={16} /> {t(photos.length ? 'Photos de nos clients' : 'Nos réalisations')}</span>
        <h1>{t(photos.length ? 'Ils portent leurs tenues alwaan' : 'Vos tenues, de la maquette à la livraison')}</h1>
        {s.count > 0 && <p className="reviews-avg"><b>{s.avg.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR')}</b><Stars value={s.avg} /><small>{t('{n} avis vérifiés', { n: s.count })}</small></p>}
        {photos.length ? (
          <div className="work-grid">{photos.map((r) => (
            <figure key={r.id} className="work">
              <img src={`/api/logo/${r.photoId}?apercu`} alt={`${r.company || r.name} · ${r.slugs.map((x) => getProduct(x)?.name).filter(Boolean).join(', ')}`} loading="lazy" />
              <figcaption><b>{r.company || r.name}</b>{r.city ? ` · ${r.city}` : ''}<small>{r.slugs.map((x) => getProduct(x)?.name).filter(Boolean).join(', ')}</small></figcaption>
            </figure>
          ))}</div>
        ) : (
          <div className="mt">
            <p>{t('Avant chaque envoi, notre atelier photographie vos pièces imprimées et vous les montre. Voici ce que vous recevez :')}</p>
            <ul className="mt8">
              <li>{t('Une maquette à valider avant toute impression : rien n\'est lancé sans votre accord.')}</li>
              <li>{t('Une impression DTF haute définition : couleurs vives, détails fins, résiste aux lavages.')}</li>
              <li>{t('La photo de contrôle de vos pièces avant expédition.')}</li>
              <li>{t('Un échantillon offert avant la série dès 150 pièces.')}</li>
            </ul>
            <div className="ctas mt"><Link className="btn cta" href={href(lang, '/assistant')}>{t('Créer ma tenue en 1 minute')}</Link><Link className="btn line" href={href(lang, '/notre-atelier')}>{t('Voir notre atelier')}</Link></div>
          </div>
        )}
        <ReviewList reviews={reviews} lang={lang} max={12} />
      </section>
    </>
  );
}
