import Link from 'next/link';
import { getProduct } from '@/lib/catalog';
import { publishedReviews, stats } from '@/lib/reviews';
import { Breadcrumbs } from '@/components/ui';
import { I } from '@/components/Icons';
import { ReviewList, Stars } from '@/components/ReviewList';
import { href, tr, type Lang } from '@/i18n';

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
        <span className="season-kicker"><I name="camera" size={16} /> {t('Photos de nos clients')}</span>
        <h1>{t('Ils portent leurs tenues alwaan')}</h1>
        {s.count > 0 && <p className="reviews-avg"><b>{s.avg.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR')}</b><Stars value={s.avg} /><small>{t('{n} avis vérifiés', { n: s.count })}</small></p>}
        {photos.length ? (
          <div className="work-grid">{photos.map((r) => (
            <figure key={r.id} className="work">
              <img src={`/api/logo/${r.photoId}?apercu`} alt={`${r.company || r.name} · ${r.slugs.map((x) => getProduct(x)?.name).filter(Boolean).join(', ')}`} loading="lazy" />
              <figcaption><b>{r.company || r.name}</b>{r.city ? ` · ${r.city}` : ''}<small>{r.slugs.map((x) => getProduct(x)?.name).filter(Boolean).join(', ')}</small></figcaption>
            </figure>
          ))}</div>
        ) : (
          <div className="acct-empty mt"><p className="muted">{t('Les premières photos de nos clients arrivent. Votre équipe pourrait être la première !')}</p><Link className="btn cta" href={href(lang, '/assistant')}>{t('Créer ma tenue en 1 minute')}</Link></div>
        )}
        <ReviewList reviews={reviews} lang={lang} max={12} />
      </section>
    </>
  );
}
