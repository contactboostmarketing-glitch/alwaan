'use client';
// La prochaine fête (fête des mères, des grands-pères, Noël…) avec ses designs et la date limite de commande.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProduct } from '@/lib/catalog';
import { getDesign } from '@/lib/designs';
import { designDataUrl, designZone } from '@/lib/designArt';
import { nextGiftEvent } from '@/lib/giftEvents';
import { useT } from '@/i18n/client';
import { Garment } from './Garment';

export function EventBanner({ compact = false }: { compact?: boolean }) {
  const { t, l, lang } = useT();
  const [ev, setEv] = useState<ReturnType<typeof nextGiftEvent>>(null);
  useEffect(() => setEv(nextGiftEvent()), []);
  if (!ev) return null;
  const fmt = (d: Date) => d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const name = lang === 'en' ? ev.en : ev.fr;
  const deadline = ev.orderBy ? t('Commandez avant le {d} pour l\'avoir à temps', { d: fmt(ev.orderBy) }) : t('Encore possible en production express');
  const base = l('/idees-cadeaux');
  if (compact) return <Link className="gifts-strip event-strip" href={`${base}/${ev.occasion}`}>{ev.emoji} <b>{name} · {fmt(ev.date)}</b> · {deadline} →</Link>;
  return (
    <div className="event-banner">
      <div><b className="event-title">{ev.emoji} {name} · {fmt(ev.date)}</b><span className="season-deadline">⏰ {deadline}</span></div>
      <div className="event-designs">{ev.designs.map((id) => { const d = getDesign(id); if (!d) return null; const p = getProduct(d.products[0])!; const c = d.colors?.find((x) => p.colors.includes(x)) ?? p.colors[0];
        return <Link key={id} href={`${base}/creer/${id}`} className="event-design"><Garment slug={p.slug} color={c} zones={[designZone(p)]} logo={designDataUrl(d, c)} /><small>{d[lang]}</small></Link>; })}</div>
    </div>
  );
}
