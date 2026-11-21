// Avis clients publiés (rendu serveur, pour Google) : note moyenne, avis récents, photos des clients.
import type { PublicReview } from '@/lib/reviews';
import { stats } from '@/lib/reviews';
import { tr, type Lang } from '@/i18n';

export const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <span className="stars" style={{ ['--pct' as string]: `${(value / 5) * 100}%`, fontSize: size }} aria-label={`${value} / 5`}><span>★★★★★</span><span aria-hidden="true">★★★★★</span></span>
);

export function ReviewList({ reviews, slug, lang = 'fr', max = 6 }: { reviews: PublicReview[]; slug?: string; lang?: Lang; max?: number }) {
  const s = stats(reviews, slug);
  const list = (s.count ? s.list : slug ? [] : reviews).slice(0, max);
  if (!list.length) return null;
  const all = stats(reviews);
  const shown = s.count ? s : all;
  return (
    <section className="reviews" id="avis">
      <div className="reviews-head">
        <h2>{tr(lang, 'Avis clients')}</h2>
        <span className="reviews-avg"><b>{shown.avg.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR')}</b><Stars value={shown.avg} /><small>{tr(lang, '{n} avis vérifiés', { n: shown.count })}</small></span>
      </div>
      <div className="reviews-list">
        {list.map((r) => (
          <figure key={r.id} className="review">
            {r.photoId && <img src={`/api/logo/${r.photoId}?apercu`} alt={tr(lang, 'Photo du client')} loading="lazy" />}
            <Stars value={r.rating} size={14} />
            <blockquote>{r.text}</blockquote>
            <figcaption><b>{r.name}</b>{[r.company, r.city].filter(Boolean).length ? ` · ${[r.company, r.city].filter(Boolean).join(', ')}` : ''}</figcaption>
            {r.reply && <p className="review-reply"><b>alwaan</b> · {r.reply}</p>}
          </figure>
        ))}
      </div>
      <p className="muted small">{tr(lang, 'Avis de clients ayant commandé, relus avant publication. Un code de remise est offert pour tout avis, positif ou négatif.')}</p>
    </section>
  );
}
