'use client';
// Assistant de commande : logo → emplacement → vêtements (plusieurs possibles) → couleur → maquette → quantités.
// Un choix par écran, l'aperçu se construit en haut, une phrase libre peut tout remplir d'un coup (IA).
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CATEGORIES, COLOR_NAMES, PACK_DISCOUNT, PRODUCTS, TIERS, defaultColor, getProduct, nextTier, sizesFor, tierFor, zonesFor, type Product } from '@/lib/catalog';
import { lineFull, lineTotal, qtyOf, unitBase, unitPrice, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { preview } from './Configurator';
import { Garment, isDark } from './Garment';
import { Price } from './Price';

type Place = 'heart' | 'chest' | 'back' | 'heart-back';
const PLACES: { id: Place; name: string; sub: string; zones: string[]; reco?: boolean }[] = [
  { id: 'heart', name: 'Cœur', sub: 'Discret et pro', zones: ['heart'] },
  { id: 'chest', name: 'Poitrine', sub: 'Grand, bien visible', zones: ['chest'] },
  { id: 'heart-back', name: 'Cœur + dos', sub: 'Visible de loin', zones: ['heart', 'back'], reco: true },
  { id: 'back', name: 'Dos seul', sub: 'Effet maillot', zones: ['back'] },
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
  return z.length ? z : [p.shape === 'cap' ? 'chest' : valid[0]];
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

  const products = picked.map((s) => getProduct(s)!);
  const colorFor = (p: Product) => (color && p.colors.includes(color) ? color : defaultColor(p));
  const go = (s: Step) => { setHist((h) => [...h, step]); setStep(s); setMsg(''); window.scrollTo(0, 0); };
  const next = () => go(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]);
  const back = () => { const h = [...hist]; const s = h.pop(); if (s) { setHist(h); setStep(s); } };

  const lines: LineConfig[] = useMemo(() => products.map((p) => ({
    slug: p.slug, color: colorFor(p), zones: zonesOf(p, place), qty: qty[p.slug] || spread(p, 0), text: '',
    logo: logo?.preview, logoId: logo?.id, logoName: logo?.name, logoStatus: logo?.status ?? 'later', pack: packs.includes(p.slug),
  })), [picked, color, place, qty, logo, packs]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = lines.reduce((a, l) => a + lineTotal(l), 0);
  const full = lines.reduce((a, l) => a + lineFull(l), 0);
  const pieces = lines.reduce((a, l) => a + qtyOf(l), 0);

  const onFile = async (f?: File) => {
    if (!f) return;
    setLogo({ name: f.name, status: 'uploaded' });
    if (f.type.startsWith('image/')) {
      try { const src = await preview(f); setLogo((l) => ({ ...(l ?? { status: 'uploaded' }), preview: src })); setInk(await inkOf(src)); } catch {}
    }
    setUploading(true);
    try {
      const body = new FormData(); body.append('file', f);
      const r = await fetch('/api/logo', { method: 'POST', body }); const d = await r.json();
      if (r.ok) setLogo((l) => ({ ...(l ?? { status: 'uploaded' }), id: d.id })); else setMsg(d.error || 'Envoi du logo impossible.');
    } catch { setMsg('Envoi du logo impossible. Vérifiez votre connexion.'); }
    setUploading(false);
    go('place');
  };
  const fillFrom = async () => {
    if (!phrase.trim()) return;
    setThinking(true); setMsg('');
    try {
      const r = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: phrase }) });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || 'Je n\'ai pas compris, choisissez avec les boutons.'); return; }
      if (!logo) setLogo({ status: 'later' });
      if (d.place) setPlace(d.place);
      if (d.products?.length) setPicked(d.products);
      if (d.color) setColor(d.color);
      if (d.people && d.products?.length) { setPeople(d.people); setQty(Object.fromEntries(d.products.map((s: string) => [s, spread(getProduct(s)!, d.people)]))); }
      const missing: Step | null = !d.place ? 'place' : !d.products?.length ? 'garments' : !d.color ? 'color' : null;
      go(missing ?? 'mockup');
    } catch { setMsg('Je n\'ai pas pu lire votre demande. Choisissez avec les boutons.'); }
    finally { setThinking(false); }
  };
  const choosePeople = (n: number) => { setPeople(n); setQty(Object.fromEntries(products.map((p) => [p.slug, spread(p, n)]))); };
  const bump = (slug: string, size: string, d: number) => setQty((q) => ({ ...q, [slug]: { ...(q[slug] || {}), [size]: Math.max(0, (q[slug]?.[size] || 0) + d) } }));
  const reach = (p: Product) => {
    const q = qtyOf({ qty: qty[p.slug] || {} }), nt = nextTier(q); if (!nt) return;
    const sizes = sizesFor(p), k = sizes.includes('L') ? 'L' : sizes[0];
    bump(p.slug, k, nt[0] - q);
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
    mockup: { label: 'C\'est parfait', disabled: false, run: () => { if (!people) choosePeople(10); next(); } },
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
          <label className="asst-drop"><span className="ic">+</span><strong>{logo?.status === 'uploaded' ? 'Logo reçu' : 'Envoyer mon logo'}</strong><span className="muted">Photo, PNG, JPG, PDF, AI : tout fonctionne</span>
            <input type="file" accept="image/*,.pdf,.ai,.eps" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <div className="opts">
            <button className="link" onClick={() => { setLogo({ status: 'create' }); go('place'); }}>Je n&apos;ai pas de logo : créez-le pour moi (offert)</button>
            <button className="link" onClick={() => { setLogo({ status: 'later' }); go('place'); }}>Je l&apos;enverrai après la commande</button>
          </div>
          <p className="muted small">Ou dites-le en une phrase :</p>
          <div className="asst-say">
            <input value={phrase} onChange={(e) => setPhrase(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fillFrom()} placeholder="Ex : 20 polos et 20 tabliers marine, logo cœur" aria-label="Décrire votre commande" maxLength={500} />
            <button onClick={fillFrom} disabled={thinking}>{thinking ? '…' : 'OK'}</button>
          </div>
        </>)}

        {step === 'place' && (<>
          <p className="bubble">{logo?.status === 'uploaded' ? 'Super logo ! ' : ''}On l&apos;imprime où ?</p>
          <div className="asst-grid">
            {PLACES.map((p) => (
              <button key={p.id} className="asst-opt" aria-pressed={place === p.id} onClick={() => { setPlace(p.id); go('garments'); }}>
                {p.reco && <span className="tag reco">Recommandé</span>}
                <Garment slug={CHOICES[0].slug} color="#e9edf5" view={p.id === 'back' ? 'back' : 'front'} zones={p.zones} logo={logo?.preview} />
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
                  <Garment slug={p.slug} color={defaultColor(p)} zones={zonesOf(p, place)} logo={logo?.preview} />
                  <strong>{CATEGORIES.find((c) => c.slug === p.category)!.name}</strong><small>{p.name} · dès <Price ht={unitBase({ slug: p.slug, zones: zonesOf(p, place) }) * (1 - TIERS[TIERS.length - 1][1])} /></small>
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
          <div className={`asst-stage ${products.length + (zonesOf(g0, place).includes('back') ? 1 : 0) > 1 ? 'two' : ''}`}>
            {products.map((p) => <figure key={p.slug}><Garment slug={p.slug} color={colorFor(p)} zones={zonesOf(p, place)} logo={logo?.preview} /><figcaption>{p.name}</figcaption></figure>)}
            {zonesOf(g0, place).includes('back') && <figure><Garment slug={g0.slug} color={colorFor(g0)} view="back" zones={zonesOf(g0, place)} logo={logo?.preview} /><figcaption>{g0.name} · dos</figcaption></figure>}
          </div>
          <p className="muted small">{logo?.status === 'create' ? 'Votre logo sera créé par notre graphiste.' : 'Un graphiste vérifie et vous envoie le visuel final avant production.'}</p>
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
            const p = getProduct(l.slug)!, q = qtyOf(l), nt = nextTier(q), cur = tierFor(q);
            return (
              <div className="asst-block" key={l.slug}>
                <div className="asst-head"><div className="mini"><Garment slug={p.slug} color={l.color} zones={l.zones} logo={logo?.preview} /></div>
                  <div><strong>{p.name}{l.pack ? ` · pack -${PACK_DISCOUNT * 100} %` : ''}</strong><small>{COLOR_NAMES[l.color]} · {q} pièce{q > 1 ? 's' : ''}{q ? <> · <Price ht={unitPrice(l)} />/pc</> : null}</small></div></div>
                <div className="sizes">
                  {Object.keys(l.qty).map((s) => (
                    <div className="sz" key={s}><b>{s}</b><div className="ctr"><button onClick={() => bump(p.slug, s, -1)} aria-label={`Retirer ${p.name} ${s}`}>−</button><output>{l.qty[s] || 0}</output><button onClick={() => bump(p.slug, s, 1)} aria-label={`Ajouter ${p.name} ${s}`}>+</button></div></div>
                  ))}
                </div>
                {nt ? <div className="nudge"><span>+{nt[0] - q} et vous passez à <b>-{Math.round(nt[1] * 100)} %</b></span><button className="btn line small" onClick={() => reach(p)}>Ajouter</button></div>
                  : cur[1] ? <div className="nudge ok">Meilleur prix atteint</div> : null}
              </div>
            );
          })}
          {ups.length > 0 && people && (<>
            <p className="bubble">Votre logo est déjà prêt : ajoutez des articles assortis en un tap, <b>-10 %</b>.</p>
            {ups.map((p) => (
              <div className="up" key={p.slug}>
                <div className="img"><Garment slug={p.slug} color={colorFor(p)} zones={zonesOf(p, place)} logo={logo?.preview} /></div>
                <div><strong>{p.name}</strong><small>Même logo, {people} pièces · <Price ht={unitBase({ slug: p.slug, zones: zonesOf(p, place) }) * (1 - tierFor(people)[1]) * (1 - PACK_DISCOUNT)} />/pc</small></div>
                <button className="btn line small" onClick={() => addPack(p)}>Ajouter</button>
              </div>
            ))}
          </>)}
          {pieces > 0 && (
            <div className="recap">
              {lines.filter((l) => qtyOf(l)).map((l) => <div key={l.slug}><span>{qtyOf(l)} × {getProduct(l.slug)!.name}</span><span><Price ht={lineTotal(l)} /></span></div>)}
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
        <p className="note">Assistant automatique (IA) : il prépare votre commande, un graphiste vérifie le visuel avant production. <Link href="/devis">Parler à un conseiller</Link></p>
      </div>
    </div>
  );
}
