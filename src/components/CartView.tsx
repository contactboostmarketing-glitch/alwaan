'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { printDims, CATEGORIES, COLOR_NAMES, COMPLETE_THE_LOOK, PRODUCTS, PROMO_CODES, defaultColor, getProduct, sizesFor, zonesFor, defaultZone, expressFee, SAMPLE_EXTRA_DAYS, SAMPLE_MIN, RELAY_HT } from '@/lib/catalog';
import { attributionForCheckout, track } from '@/lib/track';
import { deliveryDate, fmtDay } from '@/lib/delivery';
import { ON_ORDER_DAYS, onOrder, shortSizes } from '@/lib/stockTypes';
import { useStock } from '@/lib/useStock';
import type { Stock } from '@/lib/stockTypes';
import { namesAllowed, cartTotals, eur, lineTotal, logoKey, pools, qtyOf, unitAt, unitPrice, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';
import { useT } from '@/i18n/client';
import { categoryL, colorName, productL, zonesL } from '@/i18n';
import { I } from './Icons';


export function CartView() {
  const { lines, remove, add, promo, setPromo, pro, express, setExpress, reseller, sample, setSample, voucher, setVoucher, connected, clear } = useCart();
  const [transfer, setTransfer] = useState<{ name: string; total: number; iban?: string; bic?: string; holder: string } | null>(null);
  const { t: tx, l: lk, lang } = useT();
  const stock = useStock();
  // Panier uniquement en textile vierge : pas d'impression, donc ni production express ni délai d'atelier.
  const blankOnly = lines.length > 0 && lines.every((l) => l.logoStatus === 'blank');
  useEffect(() => { if (blankOnly && express) setExpress(false); }, [blankOnly, express, setExpress]);
  const [code, setCode] = useState('');
  const [cgv, setCgv] = useState(false), [cgvErr, setCgvErr] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  if (transfer) return (
    <section className="wrap empty transfer-ok">
      <h1 className="with-ic"><I name="check" size={28} /> {tx('Commande {n} enregistrée', { n: transfer.name })}</h1>
      <p>{tx('Montant à régler par virement')} : <b>{eur(transfer.total, lang)} {tx('TTC')}</b></p>
      {transfer.iban ? <div className="iban"><span>{tx('Bénéficiaire')} : <b>{transfer.holder}</b></span><span>IBAN : <b>{transfer.iban}</b></span>{transfer.bic && <span>BIC : <b>{transfer.bic}</b></span>}<span>{tx('Référence')} : <b>{transfer.name}</b></span></div>
        : <p className="muted">{tx('Nos coordonnées bancaires vous sont envoyées par email.')}</p>}
      <p className="muted small">{tx('Un récapitulatif vous a été envoyé par email. La production démarre dès réception du virement.')}</p>
      <Link className="btn line" href={lk('/compte')}>{tx('Mon compte')}</Link>
    </section>
  );
  if (!lines.length) return (
    <section className="wrap empty"><span className="empty-ic"><I name="cart" size={34} /></span><h1>{tx('Votre panier est vide')}</h1><p className="muted">{tx('Choisissez un vêtement pour commencer.')}</p>
      <div className="empty-ctas"><Link className="btn cta" href={lk('/assistant')}>{tx('Créer ma tenue en 1 minute')}</Link><Link className="btn line" href={lk('/')}>{tx('Voir les vêtements')}</Link></div></section>
  );

  const t = cartTotals(lines, promo, express, reseller, voucher);
  const anyOnOrder = lines.some((l) => onOrder(stock, l));
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
  const applyCode = async () => {
    const c = code.trim().toUpperCase();
    // Code promo (%), code parrain ou bon d'achat : vérifiés par le serveur.
    const d = await fetch(`/api/code?c=${encodeURIComponent(c)}`).then((r) => r.json()).catch(() => ({ ok: false }));
    if (!d.ok) { setMsg(tx('Ce code n\'existe pas ou a expiré.')); return; }
    setMsg('');
    if (d.kind === 'promo') setPromo(c); else setVoucher({ code: d.code, kind: d.kind, amount: d.amount, min: d.min });
    setCode('');
  };
  const downloadQuote = async () => {
    setQuoting(true); setMsg('');
    try {
      const r = await fetch('/api/devis-panier', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, company, express, lines: lines.map(({ logo, ...l }) => l) }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setMsg(d.error || tx('Devis impossible.')); return; }
      const blob = await r.blob(), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = (r.headers.get('Content-Disposition') || '').match(/filename="(.+)"/)?.[1] || 'devis-alwaan.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      track('generate_lead', { value: t.ht });
    } catch { setMsg(tx('Connexion impossible. Réessayez.')); }
    finally { setQuoting(false); }
  };
  // Virement (pros connectés) : commande provisoire Shopify + coordonnées bancaires.
  const payByTransfer = async () => {
    if (!cgv) { setCgvErr(true); document.getElementById('cart-cgv')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); (document.querySelector('#cart-cgv input') as HTMLInputElement | null)?.focus({ preventScroll: true }); return; }
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment: 'virement', promo, pro, lang, express, voucher: voucher?.code, relance: relanceId(), sample: sample && t.pieces >= SAMPLE_MIN, attribution: attributionForCheckout(), lines: lines.map(({ logo, ...l }) => ({ ...l, hasLogoPreview: !!logo })) }) });
      const d = await r.json();
      if (d.transfer) { setTransfer(d.transfer); clear(); window.scrollTo(0, 0); } else setMsg(d.error || tx('Le paiement n\'est pas encore configuré.'));
    } catch { setMsg(tx('Connexion impossible. Réessayez dans un instant.')); }
    setBusy(false);
  };
  const checkout = async () => {
    if (!cgv) { setCgvErr(true); document.getElementById('cart-cgv')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); (document.querySelector('#cart-cgv input') as HTMLInputElement | null)?.focus({ preventScroll: true }); return; }
    setBusy(true); setMsg('');
    track('begin_checkout', { value: t.ht, items: lines.map((l) => ({ item_id: l.slug, item_name: getProduct(l.slug)?.name || l.slug, quantity: qtyOf(l) })) });
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, pro, lang, express, voucher: voucher?.code, relance: relanceId(), sample: sample && t.pieces >= SAMPLE_MIN, attribution: attributionForCheckout(), lines: lines.map(({ logo, ...l }) => ({ ...l, hasLogoPreview: !!logo })) }) });
      const d = await r.json();
      if (d.url) window.location.href = d.url; else setMsg(d.error || tx('Le paiement n\'est pas encore configuré.'));
    } catch { setMsg(tx('Connexion impossible. Réessayez dans un instant.')); }
    setBusy(false);
  };

  return (
    <section className="wrap">
      <SampleOffer eligible={t.pieces >= SAMPLE_MIN && !sample} onAccept={() => setSample(true)} hint={quoteOpen} />
      <h1>{tx('Votre panier')}</h1>
      <div className="cart">
        <div>
          {lines.map((l, i) => <CartLine key={i} l={l} i={i} pool={pool[i]} stock={stock} onRemove={() => remove(i)} />)}
          {lines[0].logoStatus !== 'blank' && <div className="addmore">
            <span>{tx('Ajouter un autre vêtement avec le même logo :')}</span>
            <div className="chips">
              {CATEGORIES.map((c) => {
                const x = PRODUCTS.find((y) => y.category === c.slug && y.bestseller) ?? PRODUCTS.find((y) => y.category === c.slug)!;
                return <Link key={c.slug} className="chip" href={`${lk(`/produits/${x.slug}`)}?meme-logo=1`}>+ {categoryL(lang, c).name}</Link>;
              })}
            </div>
          </div>}
          {ups.length > 0 && lines[0].logoStatus !== 'blank' && (
            <>
              <div className="sec-head mt"><h2>{tx('Complétez la tenue')}</h2><span className="muted">{tx('Même logo : les pièces se cumulent, le marquage baisse')}</span></div>
              <div className="ups">
                {ups.map((s) => {
                  const p = getProduct(s)!, q = qtyOf(first), color = p.colors.includes(first.color) ? first.color : defaultColor(p);
                  const u = unitAt({ slug: s, zones: [defaultZone(p)] }, firstPool + q);
                  return (
                    <div className="up" key={s}>
                      <div className="img"><Garment slug={s} color={color} zones={[defaultZone(p)]} logo={first.logo} /></div>
                      <div><strong>{productL(lang, p).name}</strong><small>{tx('{q} pièces avec votre logo', { q })} · <Price raw ht={u} />/pc</small></div>
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
            {t.remainingForFree > 0 ? <>{tx('Plus que')} <b><Price raw ht={t.remainingForFree} /></b> {tx('pour la livraison offerte')}</> : <b className="okc">{tx('Livraison offerte')}</b>}
            <div className="barx"><i style={{ width: `${Math.min(100, ((t.goods - t.discount) / 150) * 100)}%` }} /></div>
          </div>
          <div className="row"><span>{tx('Sous-total')}</span><span><Price raw ht={t.goods - t.rework} /></span></div>
          {t.rework > 0 && <div className="row"><span>{tx('Retouche logo (graphiste)')}</span><span><Price raw ht={t.rework} /></span></div>}
          {t.discount > 0 && <div className="row save"><span>{tx('Code')} {promo}</span><span>-<Price raw ht={t.discount} /></span></div>}
          {t.reseller > 0 && <div className="row save"><span>{tx('Remise revendeur -10 %')}</span><span>-<Price raw ht={t.reseller} /></span></div>}
          {t.voucher > 0 && voucher && <div className="row save"><span>{tx(voucher.kind === 'parrain' ? 'Parrainage' : 'Bon d\'achat')} {voucher.code}</span><span>-<Price raw ht={t.voucher} /></span></div>}
          {t.skipped && <p className="muted small">{tx('Un seul avantage par commande : nous appliquons automatiquement le plus intéressant pour vous.')}</p>}
          {voucher && !t.voucher && !t.skipped && <p className="muted small">{tx('Code {c} : -{a} € dès {m} € HT d\'articles', { c: voucher.code, a: voucher.amount, m: voucher.min })}</p>}
          {t.express > 0 && <div className="row"><span className="with-ic"><I name="zap" size={16} /> {tx('Production express')}</span><span><Price raw ht={t.express} /></span></div>}
          <div className="row"><span>{tx('Livraison')}</span><span>{t.shipping ? <Price raw ht={t.shipping} /> : tx('Offerte')}</span></div>
          {t.shipping > 0 && <p className="muted small ship-note">{tx('À domicile ou en entreprise. En point relais :')} <Price raw ht={RELAY_HT} />{tx(', au choix sur la page de paiement.')}</p>}
          {pro && <><div className="row"><span>{tx('Total HT')}</span><span>{eur(t.ht, lang)}</span></div><div className="row"><span>{tx('TVA 20 %')}</span><span>{eur(t.vat, lang)}</span></div></>}
          <div className="row tot"><span>{tx('Total TTC')}</span><span>{eur(t.ttc, lang)}</span></div>
          {!pro && <p className="muted small">{tx('dont TVA')} {eur(t.vat, lang)}</p>}
          {t.saved > 1 && <div className="row save"><span>{tx('Vous économisez')}</span><span><Price raw ht={t.saved} /></span></div>}
          {!blankOnly && <label className={`express ${express ? 'on' : ''}`}>
            <input type="checkbox" checked={express} onChange={(e) => setExpress(e.target.checked)} />
            <span className="opt-ic"><I name="zap" size={20} /></span><span><b>{tx('Production express')}</b><small>{tx('Délai indicatif : reçu vers le {d}', { d: fmtDay(deliveryDate(new Date(), true, anyOnOrder), lang) })}</small></span>
            <b className="express-fee">+<Price raw ht={expressFee(t.pieces || 1)} /></b>
          </label>}
          {sample && t.pieces >= SAMPLE_MIN && <div className="row save"><span className="with-ic"><I name="sample" size={16} /> {tx('Échantillon avant la série')}</span><span>{tx('Offert')} · <button className="link mutedl small" onClick={() => setSample(false)}>{tx('Retirer')}</button></span></div>}
          <p className="eta"><I name="truck" size={16} /> {tx('Délai indicatif : reçu vers le {d}', { d: fmtDay(deliveryDate(new Date(), express, anyOnOrder, blankOnly, sample && t.pieces >= SAMPLE_MIN ? SAMPLE_EXTRA_DAYS : 0), lang) })}</p>
          {!(promo && voucher) && (
            <div className="promo-in"><input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={tx('Code promo')} aria-label={tx('Code promo')} /><button className="btn line small" onClick={applyCode}>{tx('Appliquer')}</button></div>
          )}
          <label className={`consent ${cgvErr ? 'invalid' : ''}`} id="cart-cgv"><input type="checkbox" checked={cgv} aria-invalid={cgvErr || undefined} aria-describedby={cgvErr ? 'cart-cgv-err' : undefined} onChange={(e) => { setCgv(e.target.checked); setCgvErr(false); }} /><span>{tx('J\'accepte les')} <Link href="/cgv">{tx('CGV')}</Link> {tx(blankOnly ? '(textile vierge : rétractation 14 jours pour les particuliers)' : lines.some((l) => l.logoStatus === 'blank') ? '(articles personnalisés : pas de rétractation ; textile vierge : 14 jours)' : '(articles personnalisés : pas de rétractation)')}</span></label>
          {cgvErr && <p className="err small field-err" id="cart-cgv-err" role="alert">{tx('Cochez l\'acceptation des CGV pour continuer.')}</p>}
          <button className="btn cta block" onClick={checkout} disabled={busy}>{tx(busy ? 'Redirection…' : 'Payer')}</button>
          {connected && pro && <button className="btn line block" onClick={payByTransfer} disabled={busy}><I name="bank" size={18} /> {tx('Payer par virement')}</button>}
          {!connected && pro && <p className="muted small">{tx('Virement possible pour les pros connectés à leur compte.')} <Link className="link" href={lk('/compte')}>{tx('Se connecter')}</Link></p>}
          {msg && <p className="err" role="alert">{msg}</p>}
          <div className="paylogos"><span>CB</span><span>Visa</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span></div>
          {!quoteOpen ? <button className="btn line block" onClick={() => setQuoteOpen(true)}>{tx('Télécharger un devis PDF')}</button> : (
            <div className="quote-box">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={tx('Société (facultatif)')} aria-label={tx('Société')} />
              <button className="btn line block" disabled={quoting} onClick={downloadQuote}>{tx(quoting ? 'Préparation…' : 'Télécharger le devis')}</button>
            </div>
          )}
          <SendCart />
        </aside>
      </div>
    </section>
  );
}

function CartLine({ l, i, pool, stock, onRemove }: { l: LineConfig; i: number; pool: number; onRemove: () => void ; stock: Stock | null }) {
  const { t: tx, l: lk, lang } = useT();
  const { update } = useCart();
  const [showAll, setShowAll] = useState(false);
  const p0 = getProduct(l.slug);
  if (!p0) return null;
  const p = productL(lang, p0);
  const q = qtyOf(l);
  const blank = l.logoStatus === 'blank';
  const logo = blank ? tx('Textile vierge, sans marquage') : l.logoStatus === 'text' ? `${tx('Texte')} : « ${l.text} »` : tx(l.logoLowRes ? 'Logo fourni (petite définition)' : 'Logo fourni');
  // Quantités modifiables sur place (la maquette validée reste valable) ; à 0 pièce, la ligne est retirée.
  const setQ = (s: string, v: number) => { const qty = { ...l.qty, [s]: Math.max(0, v) }; if (Object.values(qty).some((x) => x > 0)) update(i, { ...l, qty }); else onRemove(); };
  const bat = tx(l.logoRework ? 'Retouche graphiste' : l.mockupId ? 'Maquette validée' : 'Maquette à valider');
  return (
    <div className="line">
      <div className="img"><Garment slug={l.slug} color={l.color} zones={l.zones} logo={l.logo} /></div>
      <div>
        <Link href={lk(`/produits/${p.slug}`)}><strong>{p.name}</strong></Link>
        <small>{colorName(lang, l.color)}{!blank && <> · {zonesL(lang, p0).filter((z) => l.zones.includes(z.id)).map((z) => `${z.name} ${l.zoneText?.[z.id] !== undefined || l.logoStatus === 'text' ? `(${tx('texte')})` : `(${printDims(z, l.logoRatio)})`}`).join(' + ')}{pool > q ? ` · ${tx('{n} pièces au même logo', { n: pool })}` : ''}</>}</small>
        {l.teamId ? <small>{Object.entries(l.qty).filter(([, v]) => v).map(([s, v]) => `${s} ×${v}`).join(', ')}</small> : (
          <div className="cq" role="group" aria-label={tx('Quantités')}>{Object.entries(l.qty).filter(([s, v]) => v || showAll).map(([s, v]) => (
            <span key={s}><b>{s}</b><button aria-label={tx('Retirer {s}', { s })} onClick={() => setQ(s, v - 1)}>−</button><i>{v}</i><button aria-label={tx('Ajouter {s}', { s })} onClick={() => setQ(s, v + 1)}>+</button></span>
          ))}{!showAll && Object.values(l.qty).some((v) => !v) && <button className="link small" onClick={() => setShowAll(true)}>{tx('+ taille')}</button>}</div>
        )}
        <small>{blank ? logo : `${logo} · ${bat}`}</small>
        {shortSizes(stock, l).length > 0 && <small className="order-note"><I name="clock" size={14} /> {tx('Sur commande ({s}) : +{n} jours ouvrés', { s: shortSizes(stock, l).join(', '), n: ON_ORDER_DAYS })}</small>}
        {l.teamId && <small className="with-ic"><I name="users" size={14} /> {tx('Liste d\'équipe')}{l.printNames && namesAllowed(l) ? ` · ${tx('prénoms imprimés')}` : ''}</small>}
        <div className="acts"><Link className="link" href={`${lk(`/produits/${p.slug}`)}?modifier=${i}`}>{tx('Modifier')}</Link>{!blank && <Link className="link" href={`${lk(`/produits/${p.slug}`)}?meme-logo`}>{tx('Autre couleur')}</Link>}<button className="link mutedl" onClick={onRemove}>{tx('Supprimer')}</button></div>
      </div>
      <div className="pr"><Price raw ht={lineTotal(l, pool)} /><small>{q} pcs · <Price raw ht={unitPrice(l, pool)} suffix={false} />/pc</small></div>
    </div>
  );
}

/**
 * Échantillon avant série : proposé seulement si le client hésite (grosse commande, dès 150 pièces) :
 * il s'apprête à quitter la page, reste inactif, revient d'un autre onglet ou télécharge un devis.
 * Une seule fois par visite. Le but : lever le dernier frein et valider la commande tout de suite.
 */
function SampleOffer({ eligible, onAccept, hint }: { eligible: boolean; onAccept: () => void; hint: boolean }) {
  const { t: tx } = useT();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!eligible) return;
    let shown = false; try { shown = sessionStorage.getItem('alwaan-sample-offer') === '1'; } catch {}
    if (shown) return;
    const show = () => { try { sessionStorage.setItem('alwaan-sample-offer', '1'); } catch {} setOpen(true); cleanup(); };
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
    const onVis = () => { if (document.visibilityState === 'visible') show(); };
    const timer = window.setTimeout(show, 45_000);
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('visibilitychange', onVis);
    if (hint) show();
    function cleanup() { window.clearTimeout(timer); document.removeEventListener('mouseout', onLeave); document.removeEventListener('visibilitychange', onVis); }
    return cleanup;
  }, [eligible, hint]);
  if (!open || !eligible) return null;
  return (
    <div className="offer-back" role="dialog" aria-modal="true" aria-label={tx('Échantillon avant la série')} onClick={() => setOpen(false)}>
      <div className="offer" onClick={(e) => e.stopPropagation()}>
        <span className="offer-ic"><I name="sample" size={30} /></span>
        <h2>{tx('Pas encore sûr ? Recevez d\'abord un échantillon')}</h2>
        <p className="muted">{tx('On imprime 1 pièce de votre commande et on vous l\'envoie. Vous validez, on lance la série. Offert.')}</p>
        <button className="btn cta block" onClick={() => { onAccept(); setOpen(false); }}>{tx('Oui, je veux mon échantillon')}</button>
        <button className="link small" onClick={() => setOpen(false)}>{tx('Non merci, je commande directement')}</button>
      </div>
    </div>
  );
}

const relanceId = () => { try { return localStorage.getItem('alwaan-relance') || undefined; } catch { return undefined; } };

/** « Pas prêt ? Recevez ce panier par email » : enregistre le panier et lance la relance (offre -10 % après 24 h sans activité). */
function SendCart() {
  const { lines, promo, express } = useCart();
  const { t: tx, lang } = useT();
  const [open, setOpen] = useState(false), [email, setEmail] = useState(''), [state, setState] = useState<'' | 'busy' | 'ok'>(''), [err, setErr] = useState('');
  if (state === 'ok') return <p className="okline with-ic small"><I name="check" size={16} /> {tx('Panier envoyé à {e}', { e: email })}</p>;
  if (!open) return <button className="link small send-cart" onClick={() => setOpen(true)}><I name="mail" size={16} /> {tx('Pas prêt ? Recevez ce panier par email')}</button>;
  const send = async () => {
    setState('busy'); setErr('');
    const r = await fetch('/api/relance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, promo, express, lang, lines: lines.map(({ logo, ...l }) => l) }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok) { setState(''); setErr(tx(d.error || 'Envoi impossible.')); return; }
    try { localStorage.setItem('alwaan-relance', d.id); } catch {}
    setState('ok');
  };
  return (
    <div className="quote-box">
      <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tx('Votre email')} aria-label={tx('Votre email')} />
      <button className="btn line block" disabled={state === 'busy' || !email} onClick={send}>{tx(state === 'busy' ? 'Envoi…' : 'Recevoir mon panier')}</button>
      {err && <p className="err">{err}</p>}
    </div>
  );
}
