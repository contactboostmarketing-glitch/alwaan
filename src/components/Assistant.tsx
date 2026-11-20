'use client';
// Assistant de commande : logo → emplacement → vêtements (plusieurs possibles) → couleur → maquette → quantités.
// Un choix par écran, l'aperçu se construit en haut, une phrase libre peut tout remplir d'un coup (IA).
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, COLOR_NAMES, MAX_DISCOUNT, PRODUCTS, TIERS, defaultColor, getProduct, nextTier, sizesFor, tierFor, zonesFor, type Product } from '@/lib/catalog';
import { lineFull, lineTotal, qtyOf, unitAt, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { preview } from './Configurator';
import { Garment, isDark } from './Garment';
import { Price } from './Price';
import { snapshot, toDataUrl, uploadMockup } from '@/lib/mockup';
import { LOW_RES, imageSize } from './Configurator';

type Place = 'heart' | 'chest' | 'back' | 'heart-back';
const PLACES: { id: Place; name: string; sub: string; zones: string[]; reco?: boolean }[] = [
  { id: 'heart', name: 'Cœur', sub: 'Discret et pro, 10 × 10 cm', zones: ['heart'] },
  { id: 'chest', name: 'Grand devant', sub: 'Jusqu\'à 28 × 30 cm', zones: ['chest'] },
  { id: 'heart-back', name: 'Cœur + dos', sub: 'Visible de loin', zones: ['heart', 'back'], reco: true },
  { id: 'back', name: 'Dos seul', sub: 'Jusqu\'à 26 × 26 cm', zones: ['back'] },
];
/** Un modèle par catégorie : le best-seller. */
const CHOICES: Product[] = CATEGORIES.map((c) => PRODUCTS.find((p) => p.category === c.slug && p.bestseller) ?? PRODUCTS.find((p) => p.category === c.slug)!);
/** Répartition type d'une équipe mixte. */
const SIZE_MIX: Record<string, number> = { S: 0.12, M: 0.28, L: 0.3, XL: 0.2, XXL: 0.1 };
const STEPS = ['logo', 'place', 'garments', 'color', 'mockup', 'qty'] as const;
type Step = (typeof STEPS)[number];

function zonesOf(p: Product, place: Place | null): string[] {
  if (!place) return [];
  const valid = zonesFor(p).map((z) => z.id);
  const z = PLACES.find((x) => x.id === place)!.zones.filter((x) => valid.includes(x));
  return z.length ? z : [valid[0]];
}
function spread(p: Product, n: number): Record<string, number> {
  const sizes = sizesFor(p);
  if (sizes.length === 1) return { [sizes[0]]: n };
  const keys = sizes.filter((s) => s in SIZE_MIX);
  const out: Record<string, number> = Object.fromEntries(sizes.map((s) => [s, 0]));
  let left = n;
  keys.forEach((k, i) => { const v = i === keys.length - 1 ? left : Math.min(left, Math.round(n * SIZE_MIX[k])); out[k] = v; left -= v; });
  return out;
}
/** Couleur dominante du logo (pour conseiller les couleurs où il ressort). */
function inkOf(src: string): Promise<string | null> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 48;
        const x = c.getContext('2d')!; x.drawImage(img, 0, 0, 48, 48);
        const d = x.getImageData(0, 0, 48, 48).data; let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128 || (d[i] + d[i + 1] + d[i + 2]) / 3 > 235) continue; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        ok(n ? '#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('') : null);
      } catch { ok(null); }
    };
    img.onerror = () => ok(null); img.src = src;
  });
}
function contrast(a: string, b: string) {
  const L = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16), (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0); };
  const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function Assistant() {
  const { add } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>('logo');
  const [hist, setHist] = useState<Step[]>([]);
  const [logo, setLogo] = useState<{ preview?: string; id?: string; name?: string; status: LineConfig['logoStatus'] } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ink, setInk] = useState<string | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [people, setPeople] = useState<number | null>(null);
  const [qty, setQty] = useState<Record<string, Record<string, number>>>({});
  const [packs, setPacks] = useState<string[]>([]);
  const [phrase, setPhrase] = useState('');
  const [thinking, setThinking] = useState(false);
  const [msg, setMsg] = useState('');
  const [text, setText] = useState('');
  const [lowRes, setLowRes] = useState(false);
  const [mockups, setMockups] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [optin, setOptin] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'ok'>('idle');
  const reprise = useSearchParams().get('reprise');

  // Reprise d'une demande sauvegardée (lien reçu par email).
  useEffect(() => {
    if (!reprise) return;
    fetch(`/api/brouillon/${encodeURIComponent(reprise)}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d) { setMsg('Cette demande n\'existe plus, recommençons ensemble.'); return; }
      const raster = d.logoId && /\.(png|jpg|webp|gif)$/.test(d.logoId);
      setLogo(d.logoId ? { status: 'uploaded', id: d.logoId, name: d.logoName } : d.text ? { status: 'text' } : null);
      if (d.text) setText(d.text);
      // L'aperçu est converti en image intégrée pour pouvoir figer la maquette validée.
      if (raster) toDataUrl(`/api/logo/${d.logoId}?apercu`).then((src) => src && setLogo((l) => l && ({ ...l, preview: src })));
      setPlace(d.place); setPicked(d.products); setColor(d.color); setPeople(d.people); setQty(d.qty || {}); setPacks(d.packs || []); setSaved('ok');
      setStep(d.products?.length ? 'mockup' : 'place');
    }).catch(() => {});
  }, [reprise]);

  const saveDraft = async () => {
    setSaved('saving'); setMsg('');
    try {
      const r = await fetch('/api/brouillon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        email, marketing: optin, place, color, people, products: picked, qty, packs, logoId: logo?.id, logoName: logo?.name, logoStatus: logo?.status ?? 'uploaded', text }) });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || 'Enregistrement impossible.'); setSaved('idle'); return; }
      setSaved('ok');
    } catch { setMsg('Enregistrement impossible. Vérifiez votre connexion.'); setSaved('idle'); }
  };
  const saveBox = saved === 'ok' ? (
    <p className="nudge ok">C'est noté : votre maquette est sauvegardée. Nous pourrons vous la renvoyer pour reprendre votre commande quand vous voulez.</p>
  ) : (
    <form className="asst-save" onSubmit={(e) => { e.preventDefault(); saveDraft(); }}>
      <strong>Gardez votre maquette</strong>
      <span className="muted small">Laissez votre email : on garde votre maquette et vos choix pour que vous puissiez reprendre votre commande plus tard.</span>
      <div className="asst-say">
        <input type="email" required autoComplete="email" inputMode="email" placeholder="vous@entreprise.fr" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Votre email" />
        <button type="submit" disabled={saved === 'saving'}>{saved === 'saving' ? '…' : 'Recevoir'}</button>
      </div>
      <label className="consent"><input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)} /><span>J&apos;accepte aussi de recevoir les offres alwaan (désinscription en 1 clic).</span></label>
      <span className="note">Votre email sert uniquement à vous renvoyer cette maquette et à vous rappeler cette demande. <Link href="/confidentialite">Confidentialité</Link></span>
    </form>
  );

  const products = picked.map((s) => getProduct(s)!);
  const colorFor = (p: Product) => (color && p.colors.includes(color) ? color : defaultColor(p));
  const go = (s: Step) => { setHist((h) => [...h, step]); setStep(s); setMsg(''); window.scrollTo(0, 0); };
  const next = () => go(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]);
  const back = () => { const h = [...hist]; const s = h.pop(); if (s) { setHist(h); setStep(s); } };

  const lines: LineConfig[] = useMemo(() => products.map((p) => ({
    slug: p.slug, color: colorFor(p), zones: zonesOf(p, place), qty: qty[p.slug] || spread(p, 0), text: logo?.status === 'text' ? text : '',
    logo: logo?.preview, logoId: logo?.id, logoName: logo?.name, logoStatus: logo?.status ?? 'uploaded', logoLowRes: lowRes, pack: packs.includes(p.slug),
    mockupId: mockups[p.slug], approvedAt: mockups[p.slug] ? new Date().toISOString() : undefined,
  })), [picked, color, place, qty, logo, packs, text, lowRes, mockups]); // eslint-disable-line react-hooks/exhaustive-deps
  // Même logo sur tous les vêtements : toutes les pièces comptent pour la remise marquage.
  const pieces = lines.reduce((a, l) => a + qtyOf(l), 0);
  const total = lines.reduce((a, l) => a + lineTotal(l, pieces), 0);
  const full = lines.reduce((a, l) => a + lineFull(l), 0);

  const onFile = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setMsg('Envoyez votre logo en PNG, JPG ou SVG pour le voir sur la maquette.'); return; }
    setLogo({ name: f.name, status: 'uploaded' }); setMockups({});
    const size = await imageSize(f);
    setLowRes(!!size && Math.max(size.w, size.h) < LOW_RES && !/svg/.test(f.type));
    try { const src = await preview(f); setLogo((l) => ({ ...(l ?? { status: 'uploaded' }), preview: src })); setInk(await inkOf(src)); } catch {}
    setUploading(true);
    try {
      const body = new FormData(); body.append('file', f);
      const r = await fetch('/api/logo', { method: 'POST', body }); const d = await r.json();
      if (r.ok) setLogo((l) => ({ ...(l ?? { status: 'uploaded' }), id: d.id })); else setMsg(d.error || 'Envoi du logo impossible.');
    } catch { setMsg('Envoi du logo impossible. Vérifiez votre connexion.'); }
    setUploading(false);
    go(place && picked.length && color ? 'mockup' : place && picked.length ? 'color' : place ? 'garments' : 'place');
  };
  const fillFrom = async () => {
    if (!phrase.trim()) return;
    setThinking(true); setMsg('');
    try {
      const r = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: phrase }) });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || 'Je n\'ai pas compris, choisissez avec les boutons.'); return; }
      if (d.place) setPlace(d.place);
      if (d.products?.length) setPicked(d.products);
      if (d.color) setColor(d.color);
      if (d.people && d.products?.length) { setPeople(d.people); setQty(Object.fromEntries(d.products.map((s: string) => [s, spread(getProduct(s)!, d.people)]))); }
      // Sans graphiste, le logo est indispensable avant la maquette : on reste sur cette étape s'il manque.
      if (!logo) { setMsg(''); setThought(true); return; }
      const missing: Step | null = !d.place ? 'place' : !d.products?.length ? 'garments' : !d.color ? 'color' : null;
      go(missing ?? 'mockup');
    } catch { setMsg('Je n\'ai pas pu lire votre demande. Choisissez avec les boutons.'); }
    finally { setThinking(false); }
  };
  const [thought, setThought] = useState(false);
  // Tout changement annule la validation : le client valide toujours la dernière version.
  useEffect(() => { setMockups({}); }, [picked.join(), color, place, text, logo?.id, logo?.status]);
  /** Validation de la maquette (BAT) : une image par vêtement, figée et jointe à la commande. */
  const approve = async () => {
    setApproving(true); setMsg('');
    const figs = Array.from(stage.current?.querySelectorAll('figure') ?? []);
    const ids: Record<string, string> = {};
    for (const p of products) {
      const svgs = figs.filter((f) => f.dataset.slug === p.slug).map((f) => f.querySelector('svg')!).filter(Boolean) as SVGSVGElement[];
      const png = await snapshot(svgs, `${p.name} · ${COLOR_NAMES[colorFor(p)]} · ${PLACES.find((x) => x.id === place)?.name ?? ''}`).catch(() => null);
      const id = png ? await uploadMockup(png) : null;
      if (!id) { setApproving(false); setMsg('Enregistrement de la maquette impossible. Réessayez.'); return; }
      ids[p.slug] = id;
    }
    setMockups(ids); setApproving(false);
    if (!people) choosePeople(10);
    next();
  };
  const choosePeople = (n: number) => { setPeople(n); setQty(Object.fromEntries(products.map((p) => [p.slug, spread(p, n)]))); };
  const bump = (slug: string, size: string, d: number) => setQty((q) => ({ ...q, [slug]: { ...(q[slug] || {}), [size]: Math.max(0, (q[slug]?.[size] || 0) + d) } }));
  const reach = (p: Product) => {
    const nt = nextTier(pieces); if (!nt) return;
    const sizes = sizesFor(p), k = sizes.includes('L') ? 'L' : sizes[0];
    bump(p.slug, k, nt[0] - pieces);
  };
  const addPack = (p: Product) => { setPicked((x) => [...x, p.slug]); setPacks((x) => [...x, p.slug]); setQty((q) => ({ ...q, [p.slug]: spread(p, people || 10) })); };
  const finish = () => {
    if (!pieces) return;
    if (uploading) { setMsg('Envoi du logo en cours, un instant…'); return; }
    lines.filter((l) => qtyOf(l)).forEach((l) => add(l));
    router.push('/panier');
  };

  const idx = STEPS.indexOf(step);
  const cta: Record<Step, { label: string; disabled: boolean; run: () => void }> = {
    logo: { label: 'Continuer', disabled: !logo, run: next },
    place: { label: 'Continuer', disabled: !place, run: next },
    garments: { label: picked.length ? `Continuer avec ${picked.length} vêtement${picked.length > 1 ? 's' : ''}` : 'Choisissez au moins un vêtement', disabled: !picked.length, run: next },
    color: { label: 'Voir ma maquette', disabled: !color && !products.every((p) => p.colors.length <= 2), run: next },
    mockup: { label: approving ? 'Enregistrement…' : 'Je valide ma maquette', disabled: approving, run: approve },
    qty: { label: pieces ? `Ajouter au panier · ` : 'Choisissez un nombre', disabled: !pieces, run: finish },
  };
  const palette = [...new Set(products.flatMap((p) => p.colors))].filter((c) => products.some((p) => p.colors.includes(c) && p.colors.length > 2) || products.every((p) => p.colors.length <= 2));
  const recos = ink ? palette.filter((c) => contrast(c, ink) >= 3).slice(0, 3) : [];
  const ups = CHOICES.filter((p) => !picked.includes(p.slug) && ['tabliers-personnalises', 'casquettes-personnalisees', 't-shirts-personnalises'].includes(p.category)).slice(0, 2);
  const g0 = products[0];

  return (
    <div className="asst">
      <div className="asst-top">
        <div className="asst-bar">
          <button className="asst-back" onClick={back} disabled={!hist.length} aria-label="Étape précédente">‹</button>
          <div className="asst-prog" aria-hidden="true">{STEPS.map((s, i) => <i key={s} className={i <= idx ? 'on' : ''} />)}</div>
          <span className="asst-ai">Assistant IA</span>
        </div>
        {logo && (
          <div className="asst-live">
            <div className="mini">{g0 ? <Garment slug={g0.slug} color={colorFor(g0)} zones={zonesOf(g0, place) .length ? zonesOf(g0, place) : ['heart']} logo={logo.preview} /> : <Garment slug={CHOICES[0].slug} color="#e9edf5" zones={place ? zonesOf(CHOICES[0], place) : ['heart']} logo={logo.preview} />}</div>
            <div className="sum"><b>{products.length ? products.map((p) => CATEGORIES.find((c) => c.slug === p.category)!.name).join(' + ') : 'Votre tenue'}</b>{[place && PLACES.find((x) => x.id === place)!.name, color && COLOR_NAMES[color]].filter(Boolean).join(' · ') || 'Elle se construit au fil de vos choix'}</div>
          </div>
        )}
      </div>

      <div className="asst-body">
        {step === 'logo' && (<>
          <p className="bubble">Bonjour ! Envoyez votre logo, je m&apos;occupe du reste. <b>4 choix rapides</b> et vous voyez votre tenue.</p>
          {thought && <p className="bubble">C&apos;est noté ! Il me manque juste votre logo (ou un texte) pour vous montrer la maquette.</p>}
          <label className="asst-drop"><span className="ic">+</span><strong>{logo?.status === 'uploaded' ? 'Logo reçu' : 'Envoyer mon logo'}</strong><span className="muted">PNG, JPG ou SVG, le plus grand possible</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <div className="opts">
            <button className="link" onClick={() => setLogo({ status: 'text' })}>Je n&apos;ai pas de logo : imprimer seulement un texte</button>
            {logo?.status === 'text' && (
              <div className="asst-say">
                <input value={text} maxLength={24} onChange={(e) => setText(e.target.value)} placeholder="Ex : Boulangerie Martin" aria-label="Texte à imprimer" />
                <button disabled={!text.trim()} onClick={() => go(place && picked.length && color ? 'mockup' : place ? 'garments' : 'place')}>OK</button>
              </div>
            )}
          </div>
          <p className="muted small">Ou dites-le en une phrase :</p>
          <div className="asst-say">
            <input value={phrase} onChange={(e) => setPhrase(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fillFrom()} placeholder="Ex : 20 polos et 20 tabliers marine, logo cœur" aria-label="Décrire votre commande" maxLength={500} />
            <button onClick={fillFrom} disabled={thinking}>{thinking ? '…' : 'OK'}</button>
          </div>
        </>)}

        {step === 'place' && (<>
          <p className="bubble">{logo?.status === 'uploaded' ? 'Super logo ! ' : ''}On l&apos;imprime où ?</p>
          {lowRes && <p className="warnline">Votre logo est en petite définition : l&apos;impression risque d&apos;être floue. Si vous avez une version plus grande, renvoyez-la à l&apos;étape précédente.</p>}
          <div className="asst-grid">
            {PLACES.map((p) => (
              <button key={p.id} className="asst-opt" aria-pressed={place === p.id} onClick={() => { setPlace(p.id); go('garments'); }}>
                {p.reco && <span className="tag reco">Recommandé</span>}
                <Garment slug={CHOICES[0].slug} color="#e9edf5" view={p.id === 'back' ? 'back' : 'front'} zones={p.zones} logo={logo?.preview} text={logo?.status === 'text' ? text : undefined} />
                <strong>{p.name}</strong><small>{p.sub}</small>
              </button>
            ))}
          </div>
        </>)}

        {step === 'garments' && (<>
          <p className="bubble">Sur quels vêtements ? <b>Choisissez-en autant que vous voulez</b>, votre logo est le même partout.</p>
          <div className="asst-grid">
            {CHOICES.map((p) => {
              const on = picked.includes(p.slug);
              return (
                <button key={p.slug} className="asst-opt" aria-pressed={on} onClick={() => setPicked((x) => on ? x.filter((s) => s !== p.slug) : [...x, p.slug])}>
                  {on && <span className="tick">✓</span>}
                  <Garment slug={p.slug} color={defaultColor(p)} zones={zonesOf(p, place)} logo={logo?.preview} text={logo?.status === 'text' ? text : undefined} />
                  <strong>{CATEGORIES.find((c) => c.slug === p.category)!.name}</strong><small>{p.name} · dès <Price ht={unitAt({ slug: p.slug, zones: zonesOf(p, place) }, TIERS[TIERS.length - 1][0])} /></small>
                </button>
              );
            })}
          </div>
          <Link className="link small" href="/vetements/polos-personnalises">Voir tous les modèles</Link>
        </>)}

        {step === 'color' && (<>
          <p className="bubble">Quelle couleur ?{recos.length ? <> Les couleurs <b>✓</b> font bien ressortir votre logo.</> : null}{products.some((p) => p.colors.length <= 2) && products.some((p) => p.colors.length > 2) ? ' Les vêtements haute visibilité et les chemises gardent leurs couleurs propres.' : ''}</p>
          <div className="asst-sw">
            {palette.map((c) => (
              <button key={c} className="sw-big" aria-pressed={color === c} onClick={() => { setColor(c); go('mockup'); }}>
                {recos.includes(c) && <span className="star">✓</span>}<i style={{ background: c }} />{COLOR_NAMES[c]}
              </button>
            ))}
          </div>
        </>)}

        {step === 'mockup' && (<>
          <p className="bubble">Voici votre tenue ! Ça vous plaît ?</p>
          <div ref={stage} className={`asst-stage ${products.length + (zonesOf(g0, place).includes('back') ? 1 : 0) > 1 ? 'two' : ''}`}>
            {products.map((p) => <figure key={p.slug} data-slug={p.slug}><Garment slug={p.slug} color={colorFor(p)} zones={zonesOf(p, place)} logo={logo?.preview} text={logo?.status === 'text' ? text : undefined} /><figcaption>{p.name}</figcaption></figure>)}
            {zonesOf(g0, place).includes('back') && <figure data-slug={g0.slug}><Garment slug={g0.slug} color={colorFor(g0)} view="back" zones={zonesOf(g0, place)} logo={logo?.preview} text={logo?.status === 'text' ? text : undefined} /><figcaption>{g0.name} · dos</figcaption></figure>}
          </div>
          <p className="muted small">Cette maquette sert de <b>bon à tirer</b> : l&apos;impression reprend exactement ce que vous voyez (emplacement, couleurs{logo?.status === 'text' ? ', texte' : ''}). En validant, vous confirmez qu&apos;elle est correcte.</p>
          {saveBox}
          <div className="asst-quick">
            <button onClick={() => go('color')}>Changer la couleur</button>
            <button onClick={() => go('place')}>Changer l&apos;emplacement</button>
            <button onClick={() => go('garments')}>Ajouter ou retirer un vêtement</button>
          </div>
        </>)}

        {step === 'qty' && (<>
          <p className="bubble">Combien de personnes à équiper ? Je répartis les tailles pour vous, vous ajustez si besoin.</p>
          <div className="asst-people">{[5, 10, 20, 30].map((n) => <button key={n} aria-pressed={people === n} onClick={() => choosePeople(n)}>{n}</button>)}</div>
          {lines.map((l) => {
            const p = getProduct(l.slug)!, q = qtyOf(l), nt = nextTier(pieces), cur = tierFor(pieces), last = l === lines[lines.length - 1];
            return (
              <div className="asst-block" key={l.slug}>
                <div className="asst-head"><div className="mini"><Garment slug={p.slug} color={l.color} zones={l.zones} logo={logo?.preview} text={logo?.status === 'text' ? text : undefined} /></div>
                  <div><strong>{p.name}</strong><small>{COLOR_NAMES[l.color]} · {q} pièce{q > 1 ? 's' : ''}{q ? <> · <Price ht={unitAt(l, pieces)} />/pc</> : null}</small></div></div>
                <div className="sizes">
                  {Object.keys(l.qty).map((s) => (
                    <div className="sz" key={s}><b>{s}</b><div className="ctr"><button onClick={() => bump(p.slug, s, -1)} aria-label={`Retirer ${p.name} ${s}`}>−</button><output>{l.qty[s] || 0}</output><button onClick={() => bump(p.slug, s, 1)} aria-label={`Ajouter ${p.name} ${s}`}>+</button></div></div>
                  ))}
                </div>
                {last && pieces > 0 && (nt ? <div className="nudge"><span>+{nt[0] - pieces} pièce{nt[0] - pieces > 1 ? 's' : ''} et le marquage passe à <b>-{Math.round(nt[1] * 100)} %</b>{lines.length > 1 ? ' sur tous vos vêtements' : ''}</span><button className="btn line small" onClick={() => reach(p)}>Ajouter</button></div>
                  : cur[1] === MAX_DISCOUNT ? <div className="nudge ok">Meilleur prix de marquage atteint (-{Math.round(MAX_DISCOUNT * 100)} %)</div> : null)}
              </div>
            );
          })}
          {ups.length > 0 && people && (<>
            <p className="bubble">Votre logo est déjà prêt : ajoutez des articles assortis en un tap. <b>Les pièces se cumulent</b> et le marquage baisse sur toute la commande.</p>
            {ups.map((p) => (
              <div className="up" key={p.slug}>
                <div className="img"><Garment slug={p.slug} color={colorFor(p)} zones={zonesOf(p, place)} logo={logo?.preview} text={logo?.status === 'text' ? text : undefined} /></div>
                <div><strong>{p.name}</strong><small>Même logo, {people} pièces · <Price ht={unitAt({ slug: p.slug, zones: zonesOf(p, place) }, pieces + people)} />/pc</small></div>
                <button className="btn line small" onClick={() => addPack(p)}>Ajouter</button>
              </div>
            ))}
          </>)}
          {pieces > 0 && saved !== 'ok' && saveBox}
          {pieces > 0 && (
            <div className="recap">
              {lines.filter((l) => qtyOf(l)).map((l) => <div key={l.slug}><span>{qtyOf(l)} × {getProduct(l.slug)!.name}</span><span><Price ht={lineTotal(l, pieces)} /></span></div>)}
              {full - total > 1 && <div className="save"><span>Vous économisez</span><span><Price ht={full - total} /></span></div>}
              <div className="tot"><span>Total</span><span><Price ht={total} /></span></div>
              {people ? <div className="muted"><span>Soit par personne équipée</span><span><Price ht={total / people} /></span></div> : null}
            </div>
          )}
        </>)}
        {msg && <p className="err" role="alert">{msg}</p>}
      </div>

      <div className="asst-dock">
        <button className="btn cta block" disabled={cta[step].disabled || thinking} onClick={cta[step].run}>
          {cta[step].label}{step === 'qty' && pieces ? <Price ht={total} /> : null}
        </button>
        <p className="note">Assistant automatique (IA) : il prépare votre commande à partir de vos choix. <Link href="/devis">Parler à un conseiller</Link></p>
      </div>
    </div>
  );
}
