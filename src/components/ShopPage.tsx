'use client';
// Boutique club / entreprise : chaque membre choisit son article et sa taille, puis paie lui-même.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProduct, sizesFor } from '@/lib/catalog';
import { toDataUrl } from '@/lib/mockup';
import { unitAt } from '@/lib/pricing';
import { colorName, productL } from '@/i18n';
import { useT } from '@/i18n/client';
import { useCart } from './CartProvider';
import { Price } from './Price';

type Item = { slug: string; color: string; zones: string[]; mockupId: string };
type Shop = { slug: string; name: string; logoId: string; items: Item[] };

export function ShopPage({ slug }: { slug: string }) {
  const { t, l, lang } = useT();
  const fresh = useSearchParams().get('nouvelle');
  const { add } = useCart();
  const [s, setS] = useState<Shop | null>(null);
  const [err, setErr] = useState('');
  const [logo, setLogo] = useState<string>();
  const [size, setSize] = useState<Record<string, string>>({});
  const [added, setAdded] = useState('');
  useEffect(() => {
    fetch(`/api/boutique/${slug}`).then(async (r) => { const d = await r.json(); if (!r.ok) { setErr(d.error); return; } setS(d); setLogo(await toDataUrl(`/api/logo/${d.logoId}?apercu`)); }).catch(() => setErr(t('Connexion impossible. Réessayez.')));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return <section className="wrap bat-page"><p className="muted">{err || t('Chargement…')}</p></section>;
  const link = typeof window !== 'undefined' ? `${window.location.origin}${l(`/boutique/${s.slug}`)}` : '';
  const buy = (it: Item) => {
    const p = getProduct(it.slug)!, sizes = sizesFor(p), sz = sizes.length === 1 ? sizes[0] : size[it.slug];
    if (!sz) return;
    add({ slug: it.slug, color: it.color, zones: it.zones, qty: { [sz]: 1 }, logo, logoId: s.logoId, logoStatus: 'uploaded', mockupId: it.mockupId, approvedAt: new Date().toISOString(), shop: s.slug });
    setAdded(productL(lang, p).name);
  };
  return (
    <section className="wrap shop">
      {fresh && (
        <div className="season-card mb">
          <h2>✓ {t('Votre boutique est en ligne')}</h2>
          <p className="muted small">{t('Partagez ce lien à vos membres :')}</p>
          <div className="asst-say"><input readOnly value={link} onFocus={(e) => e.target.select()} aria-label={t('Lien à partager')} /><button onClick={() => navigator.clipboard?.writeText(link)}>{t('Copier')}</button></div>
        </div>
      )}
      <div className="shop-head">{logo && <img src={logo} alt="" />}{/* eslint-disable-line @next/next/no-img-element */}<h1>{s.name}</h1></div>
      <div className="grid">{s.items.map((it) => {
        const p = getProduct(it.slug)!, pl = productL(lang, p), sizes = sizesFor(p);
        return (
          <div key={it.slug} className="pcard shop-item">
            <img src={`/api/logo/${it.mockupId}?apercu`} alt={pl.name} />{/* eslint-disable-line @next/next/no-img-element */}
            <strong>{pl.name}</strong><small>{colorName(lang, it.color)}</small>
            <span className="price"><Price ht={unitAt(it, 1)} /></span>
            {sizes.length > 1 && <div className="chips">{sizes.map((z) => <button key={z} className="chip" aria-pressed={size[it.slug] === z} onClick={() => setSize({ ...size, [it.slug]: z })}>{z}</button>)}</div>}
            <button className="btn cta small" disabled={sizes.length > 1 && !size[it.slug]} onClick={() => buy(it)}>{t('Ajouter au panier')}</button>
          </div>
        );
      })}</div>
      {added && <div className="toast" role="status">{t('{q} × {name} ajoutés au panier', { q: 1, name: added })} <Link href={l('/panier')}>{t('Voir le panier')}</Link></div>}
    </section>
  );
}
