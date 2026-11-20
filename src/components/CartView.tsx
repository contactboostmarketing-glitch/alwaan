'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES, COLOR_NAMES, COMPLETE_THE_LOOK, PRODUCTS, PROMO_CODES, defaultColor, getProduct, sizesFor, zonesFor, defaultZone } from '@/lib/catalog';
import { attributionForCheckout, track } from '@/lib/track';
import { deliveryDate, fmtDay } from '@/lib/delivery';
import { cartTotals, eur, lineTotal, logoKey, pools, qtyOf, unitAt, unitPrice, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';
import { useT } from '@/i18n/client';
import { categoryL, colorName, productL, zonesL } from '@/i18n';


export function CartView() {
  const { lines, remove, add, promo, setPromo, pro } = useCart();
  const { t: tx, l: lk, lang } = useT();
  const [code, setCode] = useState('');
  const [cgv, setCgv] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  if (!lines.length) return (
    <section className="wrap empty"><h1>{tx('Votre panier est vide')}</h1><p className="muted">{tx('Choisissez un vêtement pour commencer.')}</p><Link className="btn cta" href={lk('/')}>{tx('Voir les vêtements')}</Link></section>
  );

  const t = cartTotals(lines, promo);
  const pool = pools(lines);
  const firstPool = lines.reduce((a, l) => a + (logoKey(l) === logoKey(lines[0]) ? qtyOf(l) : 0), 0);
  const first = lines[0];
  const firstProd = getProduct(first.slug)!;
  const ups = (COMPLETE_THE_LOOK[firstProd.category] || []).filter((s) => !lines.some((l) => l.slug === s));
  const addUp = (slug: string) => {
    const p = getProduct(slug)!;
    const sizes = sizesFor(p), q = qtyOf(first);
    let qty: Record<string, number> = sizes.length === 1 ? { [sizes[0]]: q } : Object.fromEntries(sizes.map((s) => [s, first.qty[s] || 0]));
    if (!Object.values(qty).some(Boolean)) qty = { [sizes[0]]: q };
    add({ slug, color: p.colors.includes(first.color) ? first.color : defaultColor(p), zones: [defaultZone(p)], qty, logo: first.logo, logoName: first.logoName, logoId: first.logoId, logoSourceId: first.logoSourceId, logoCut: first.logoCut, logoRework: first.logoRework, logoStatus: first.logoStatus, text: first.text, pack: true });
  };
  const applyCode = () => {
    const c = code.trim().toUpperCase();
    if (PROMO_CODES[c]) { setPromo(c); setMsg(''); } else setMsg(tx('Ce code n\'existe pas ou a expiré.'));
  };
  const downloadQuote = async () => {
    setQuoting(true); setMsg('');
    try {
      const r = await fetch('/api/devis-panier', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, company, lines: lines.map(({ logo, ...l }) => l) }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setMsg(d.error || tx('Devis impossible.')); return; }
      const blob = await r.blob(), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = (r.headers.get('Content-Disposition') || '').match(/filename="(.+)"/)?.[1] || 'devis-alwaan.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      track('generate_lead', { value: t.ht });
    } catch { setMsg(tx('Connexion impossible. Réessayez.')); }
    finally { setQuoting(false); }
  };
  const checkout = async () => {
    if (!cgv) { setMsg(tx('Cochez l\'acceptation des CGV pour continuer.')); return; }
    setBusy(true); setMsg('');
    track('begin_checkout', { value: t.ht, items: lines.map((l) => ({ item_id: l.slug, item_name: getProduct(l.slug)?.name || l.slug, quantity: qtyOf(l) })) });
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, pro, lang, attribution: attributionForCheckout(), lines: lines.map(({ logo, ...l }) => ({ ...l, hasLogoPreview: !!logo })) }) });
      const d = await r.json();
      if (d.url) window.location.href = d.url; else setMsg(d.error || tx('Le paiement n\'est pas encore configuré.'));
    } catch { setMsg(tx('Connexion impossible. Réessayez dans un instant.')); }
    setBusy(false);
  };

  return (
    <section className="wrap">
      <h1>{tx('Votre panier')}</h1>
      <div className="cart">
        <div>
          {lines.map((l, i) => <CartLine key={i} l={l} i={i} pool={pool[i]} onRemove={() => remove(i)} />)}
          <div className="addmore">
            <span>{tx('Ajouter un autre vêtement avec le même logo :')}</span>
            <div className="chips">
              {CATEGORIES.map((c) => {
                const x = PRODUCTS.find((y) => y.category === c.slug && y.bestseller) ?? PRODUCTS.find((y) => y.category === c.slug)!;
                return <Link key={c.slug} className="chip" href={`${lk(`/produits/${x.slug}`)}?meme-logo=1`}>+ {categoryL(lang, c).name}</Link>;
              })}
            </div>
          </div>
          {ups.length > 0 && (
            <>
              <div className="sec-head mt"><h2>{tx('Complétez la tenue')}</h2><span className="muted">{tx('Même logo : les pièces se cumulent, le marquage baisse')}</span></div>
              <div className="ups">
                {ups.map((s) => {
                  const p = getProduct(s)!, q = qtyOf(first), color = p.colors.includes(first.color) ? first.color : defaultColor(p);
                  const u = unitAt({ slug: s, zones: [defaultZone(p)] }, firstPool + q);
                  return (
                    <div className="up" key={s}>
                      <div className="img"><Garment slug={s} color={color} zones={[defaultZone(p)]} logo={first.logo} /></div>
                      <div><strong>{productL(lang, p).name}</strong><small>{tx('{q} pièces avec votre logo', { q })} · <Price ht={u} />/pc</small></div>
                      <button className="btn line small" onClick={() => addUp(s)}>{tx('Ajouter')}</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <aside className="summary" aria-label={tx('Récapitulatif')}>
          <div className="ship">
            {t.remainingForFree > 0 ? <>{tx('Plus que')} <b><Price ht={t.remainingForFree} /></b> {tx('pour la livraison offerte')}</> : <b className="okc">{tx('Livraison offerte')}</b>}
            <div className="barx"><i style={{ width: `${Math.min(100, ((t.goods - t.discount) / 150) * 100)}%` }} /></div>
          </div>
          <div className="row"><span>{tx('Sous-total')}</span><span><Price ht={t.goods - t.rework} /></span></div>
          {t.rework > 0 && <div className="row"><span>{tx('Retouche logo (graphiste)')}</span><span><Price ht={t.rework} /></span></div>}
          {t.discount > 0 && <div className="row save"><span>{tx('Code')} {promo}</span><span>-<Price ht={t.discount} /></span></div>}
          <div className="row"><span>{tx('Livraison')}</span><span>{t.shipping ? <Price ht={t.shipping} /> : tx('Offerte')}</span></div>
          {pro && <><div className="row"><span>{tx('Total HT')}</span><span>{eur(t.ht, lang)}</span></div><div className="row"><span>{tx('TVA 20 %')}</span><span>{eur(t.vat, lang)}</span></div></>}
          <div className="row tot"><span>{tx('Total TTC')}</span><span>{eur(t.ttc, lang)}</span></div>
          {!pro && <p className="muted small">{tx('dont TVA')} {eur(t.vat, lang)}</p>}
          {t.saved > 1 && <div className="row save"><span>{tx('Vous économisez')}</span><span><Price ht={t.saved} /></span></div>}
          <p className="eta">🚚 {tx('Reçu vers le {d}', { d: fmtDay(deliveryDate(), lang) })}</p>
          {!promo && (
            <div className="promo-in"><input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={tx('Code promo')} aria-label={tx('Code promo')} /><button className="btn line small" onClick={applyCode}>{tx('Appliquer')}</button></div>
          )}
          <label className="consent"><input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} /><span>{tx('J\'accepte les')} <Link href="/cgv">{tx('CGV')}</Link> {tx('(articles personnalisés : pas de rétractation)')}</span></label>
          <button className="btn cta block" onClick={checkout} disabled={busy}>{tx(busy ? 'Redirection…' : 'Commander avec obligation de paiement')}</button>
          {msg && <p className="err" role="alert">{msg}</p>}
          <div className="paylogos"><span>CB</span><span>Visa</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span></div>
          {!quoteOpen ? <button className="btn line block" onClick={() => setQuoteOpen(true)}>{tx('Télécharger un devis PDF')}</button> : (
            <div className="quote-box">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={tx('Société (facultatif)')} aria-label={tx('Société')} />
              <button className="btn line block" disabled={quoting} onClick={downloadQuote}>{tx(quoting ? 'Préparation…' : 'Télécharger le devis')}</button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function CartLine({ l, i, pool, onRemove }: { l: LineConfig; i: number; pool: number; onRemove: () => void }) {
  const { t: tx, l: lk, lang } = useT();
  const p0 = getProduct(l.slug);
  if (!p0) return null;
  const p = productL(lang, p0);
  const q = qtyOf(l);
  const logo = l.logoStatus === 'text' ? `${tx('Texte')} : « ${l.text} »` : tx(l.logoLowRes ? 'Logo fourni (petite définition)' : 'Logo fourni');
  const bat = tx(l.logoRework ? 'Retouche graphiste' : l.mockupId ? 'Maquette validée' : 'Maquette à valider');
  return (
    <div className="line">
      <div className="img"><Garment slug={l.slug} color={l.color} zones={l.zones} logo={l.logo} /></div>
      <div>
        <Link href={lk(`/produits/${p.slug}`)}><strong>{p.name}</strong></Link>
        <small>{colorName(lang, l.color)} · {zonesL(lang, p0).filter((z) => l.zones.includes(z.id)).map((z) => z.name).join(' + ')}{pool > q ? ` · ${tx('{n} pièces au même logo', { n: pool })}` : ''}</small>
        <small>{Object.entries(l.qty).filter(([, v]) => v).map(([s, v]) => `${s} ×${v}`).join(', ')}</small>
        <small>{logo} · {bat}</small>
        <div className="acts"><Link className="link" href={`${lk(`/produits/${p.slug}`)}?modifier=${i}`}>{tx('Modifier')}</Link><button className="link mutedl" onClick={onRemove}>{tx('Supprimer')}</button></div>
      </div>
      <div className="pr"><Price ht={lineTotal(l, pool)} /><small>{q} pcs · <Price ht={unitPrice(l, pool)} suffix={false} />/pc</small></div>
    </div>
  );
}
