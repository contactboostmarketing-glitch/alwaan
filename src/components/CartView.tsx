'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES, COLOR_NAMES, COMPLETE_THE_LOOK, PRODUCTS, PROMO_CODES, defaultColor, getProduct, sizesFor, zonesFor } from '@/lib/catalog';
import { cartTotals, eur, lineTotal, logoKey, pools, qtyOf, unitAt, unitPrice, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';

function deliveryDate(days: number) {
  const d = new Date(); let k = 0;
  while (k < days) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) k++; }
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function CartView() {
  const { lines, remove, add, promo, setPromo, pro } = useCart();
  const [code, setCode] = useState('');
  const [cgv, setCgv] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  if (!lines.length) return (
    <section className="wrap empty"><h1>Votre panier est vide</h1><p className="muted">Choisissez un vêtement pour commencer.</p><Link className="btn cta" href="/">Voir les vêtements</Link></section>
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
    add({ slug, color: p.colors.includes(first.color) ? first.color : defaultColor(p), zones: ['heart'], qty, logo: first.logo, logoName: first.logoName, logoId: first.logoId, logoSourceId: first.logoSourceId, logoCut: first.logoCut, logoRework: first.logoRework, logoStatus: first.logoStatus, text: first.text, pack: true });
  };
  const applyCode = () => {
    const c = code.trim().toUpperCase();
    if (PROMO_CODES[c]) { setPromo(c); setMsg(''); } else setMsg('Ce code n\'existe pas ou a expiré.');
  };
  const checkout = async () => {
    if (!cgv) { setMsg('Cochez l\'acceptation des CGV pour continuer.'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, pro, lines: lines.map(({ logo, ...l }) => ({ ...l, hasLogoPreview: !!logo })) }) });
      const d = await r.json();
      if (d.url) window.location.href = d.url; else setMsg(d.error || 'Le paiement n\'est pas encore configuré.');
    } catch { setMsg('Connexion impossible. Réessayez dans un instant.'); }
    setBusy(false);
  };

  return (
    <section className="wrap">
      <h1>Votre panier</h1>
      <div className="cart">
        <div>
          {lines.map((l, i) => <CartLine key={i} l={l} i={i} pool={pool[i]} onRemove={() => remove(i)} />)}
          <div className="addmore">
            <span>Ajouter un autre vêtement avec le même logo :</span>
            <div className="chips">
              {CATEGORIES.map((c) => {
                const x = PRODUCTS.find((y) => y.category === c.slug && y.bestseller) ?? PRODUCTS.find((y) => y.category === c.slug)!;
                return <Link key={c.slug} className="chip" href={`/produits/${x.slug}?meme-logo=1`}>+ {c.name}</Link>;
              })}
            </div>
          </div>
          {ups.length > 0 && (
            <>
              <div className="sec-head mt"><h2>Complétez la tenue</h2><span className="muted">Même logo : les pièces se cumulent, le marquage baisse</span></div>
              <div className="ups">
                {ups.map((s) => {
                  const p = getProduct(s)!, q = qtyOf(first), color = p.colors.includes(first.color) ? first.color : defaultColor(p);
                  const u = unitAt({ slug: s, zones: ['heart'] }, firstPool + q);
                  return (
                    <div className="up" key={s}>
                      <div className="img"><Garment slug={s} color={color} zones={['heart']} logo={first.logo} /></div>
                      <div><strong>{p.name}</strong><small>{q} pièces avec votre logo · <Price ht={u} />/pc</small></div>
                      <button className="btn line small" onClick={() => addUp(s)}>Ajouter</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <aside className="summary" aria-label="Récapitulatif">
          <div className="ship">
            {t.remainingForFree > 0 ? <>Plus que <b><Price ht={t.remainingForFree} /></b> pour la livraison offerte</> : <b className="okc">Livraison offerte</b>}
            <div className="barx"><i style={{ width: `${Math.min(100, ((t.goods - t.discount) / 150) * 100)}%` }} /></div>
          </div>
          <div className="row"><span>Sous-total</span><span><Price ht={t.goods - t.rework} /></span></div>
          {t.rework > 0 && <div className="row"><span>Retouche logo (graphiste)</span><span><Price ht={t.rework} /></span></div>}
          {t.discount > 0 && <div className="row save"><span>Code {promo}</span><span>-<Price ht={t.discount} /></span></div>}
          <div className="row"><span>Livraison</span><span>{t.shipping ? <Price ht={t.shipping} /> : 'Offerte'}</span></div>
          {pro && <><div className="row"><span>Total HT</span><span>{eur(t.ht)}</span></div><div className="row"><span>TVA 20 %</span><span>{eur(t.vat)}</span></div></>}
          <div className="row tot"><span>Total TTC</span><span>{eur(t.ttc)}</span></div>
          {!pro && <p className="muted small">dont TVA {eur(t.vat)}</p>}
          {t.saved > 1 && <div className="row save"><span>Vous économisez</span><span><Price ht={t.saved} /></span></div>}
          <p className="small">Livraison estimée : <b>{deliveryDate(8)}</b>. Votre maquette validée part directement en production.</p>
          {!promo && (
            <div className="promo-in"><input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code promo" aria-label="Code promo" /><button className="btn line small" onClick={applyCode}>Appliquer</button></div>
          )}
          <label className="consent"><input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} /><span>J&apos;accepte les <Link href="/cgv">conditions générales de vente</Link> et je reconnais que les articles personnalisés ne bénéficient pas du droit de rétractation.</span></label>
          <button className="btn cta block" onClick={checkout} disabled={busy}>{busy ? 'Redirection…' : 'Commander avec obligation de paiement'}</button>
          {msg && <p className="err" role="alert">{msg}</p>}
          <div className="paylogos"><span>CB</span><span>Visa</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span></div>
          <p className="muted small">Votre carte est débitée à la commande. La production démarre aussitôt à partir de la maquette que vous avez validée.</p>
          <Link className="link" href="/devis">Besoin d&apos;un devis PDF pour votre entreprise ?</Link>
        </aside>
      </div>
    </section>
  );
}

function CartLine({ l, i, pool, onRemove }: { l: LineConfig; i: number; pool: number; onRemove: () => void }) {
  const p = getProduct(l.slug);
  if (!p) return null;
  const q = qtyOf(l);
  const logo = l.logoStatus === 'text' ? `Texte : « ${l.text} »` : l.logoLowRes ? 'Logo fourni (petite définition)' : 'Logo fourni';
  const bat = l.logoRework ? 'Retouche graphiste' : l.mockupId ? 'Maquette validée' : 'Maquette à valider';
  return (
    <div className="line">
      <div className="img"><Garment slug={l.slug} color={l.color} zones={l.zones} logo={l.logo} /></div>
      <div>
        <Link href={`/produits/${p.slug}`}><strong>{p.name}</strong></Link>
        <small>{COLOR_NAMES[l.color]} · {zonesFor(p).filter((z) => l.zones.includes(z.id)).map((z) => z.name).join(' + ')}{pool > q ? ` · ${pool} pièces au même logo` : ''}</small>
        <small>{Object.entries(l.qty).filter(([, v]) => v).map(([s, v]) => `${s} ×${v}`).join(', ')}</small>
        <small>{logo} · {bat}</small>
        <div className="acts"><Link className="link" href={`/produits/${p.slug}?modifier=${i}`}>Modifier</Link><button className="link mutedl" onClick={onRemove}>Supprimer</button></div>
      </div>
      <div className="pr"><Price ht={lineTotal(l, pool)} /><small>{q} pcs · <Price ht={unitPrice(l, pool)} suffix={false} />/pc</small></div>
    </div>
  );
}
