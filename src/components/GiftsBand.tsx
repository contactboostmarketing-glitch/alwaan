'use client';
// Accueil : bandeau « particuliers ». En mode Particulier, il passe en tête avec les occasions.
import Link from 'next/link';
import { OCCASIONS } from '@/lib/designs';
import { EventBanner } from './EventBanner';
import { useT } from '@/i18n/client';
import { useCart } from './CartProvider';

export function GiftsBand() {
  const { t, l, lang } = useT();
  const { pro } = useCart();
  const base = l('/idees-cadeaux');
  if (pro) return <><EventBanner compact /><Link className="gifts-strip" href={base}>🎁 <b>{t('Particulier ?')}</b> {t('Idées cadeaux, EVJF, anniversaires : designs prêts à personnaliser')} →</Link></>;
  return (
    <div className="gifts-band">
      <EventBanner />
      <h2>🎁 {t('Idées cadeaux à personnaliser')}</h2>
      <p className="muted">{t('Choisissez un design, écrivez votre texte, c\'est prêt. Dès 1 pièce.')}</p>
      <div className="occasions">{OCCASIONS.map((o) => <Link key={o.id} className="occasion" href={`${base}/${o.id}`}><span>{o.emoji}</span><b>{o[lang].name}</b><small>{o[lang].sub}</small></Link>)}</div>
    </div>
  );
}
