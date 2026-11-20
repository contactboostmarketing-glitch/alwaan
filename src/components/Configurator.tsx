'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, CLASH, COLOR_NAMES, MAX_DISCOUNT, PRODUCTS, TIERS, defaultColor, getProduct, nextTier, sizesFor, tierFor, zonesFor } from '@/lib/catalog';
import { lineTotal, logoKey, qtyOf, unitAt, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';
import { snapshot, uploadMockup } from '@/lib/mockup';

function initial(slug: string): LineConfig {
  const p = getProduct(slug)!;
  const sizes = sizesFor(p);
  const demo = [1, 3, 4, 2];
  return {
    slug, color: defaultColor(p), zones: ['heart'],
    qty: Object.fromEntries(sizes.map((s, i) => [s, sizes.length === 1 ? 10 : demo[i] || 0])),
    logoStatus: 'uploaded', text: '',
  };
}

/** Seuil sous lequel un logo risque d'être flou à l'impression (plus grand côté, en pixels). */
export const LOW_RES = 800;
/** Taille d'origine d'une image (pour alerter sur les logos trop petits). */
export async function imageSize(file: File): Promise<{ w: number; h: number } | null> {
  try {
    const url = URL.createObjectURL(file); const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
    URL.revokeObjectURL(url); return { w: img.naturalWidth, h: img.naturalHeight };
  } catch { return null; }
}

/** Réduit l'image du logo pour l'aperçu et le panier (le fichier d'origine est envoyé au serveur). */
export async function preview(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
  const scale = Math.min(1, 480 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL('image/png');
}

export function Configurator({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const zones = zonesFor(p);
  const { add, update, lines } = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const edit = params.get('modifier');
  const sameLogo = params.get('meme-logo') !== null;
  const [added, setAdded] = useState(false);
  const editIndex = edit !== null && lines[Number(edit)]?.slug === slug ? Number(edit) : null;

  const [cfg, setCfg] = useState<LineConfig>(() => initial(slug));
  const [view, setView] = useState<'front' | 'back'>('front');
  const [toast, setToast] = useState('');
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const shots = useRef<HTMLDivElement>(null);
  // Toute modification annule la validation : le client valide toujours la dernière version.
  useEffect(() => { setApproved(false); }, [cfg.color, cfg.zones.join(), cfg.text, cfg.logoId, cfg.logoStatus]);
  useEffect(() => { if (editIndex !== null) setCfg(structuredClone(lines[editIndex])); }, [editIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  // « Même logo » : on reprend le logo, le texte, les emplacements et si possible la couleur du dernier article.
  useEffect(() => {
    const last = lines[lines.length - 1];
    if (!sameLogo || editIndex !== null || !last) return;
    const valid = zones.map((z) => z.id);
    const z = last.zones.filter((x) => valid.includes(x));
    setCfg((c) => ({ ...c, logo: last.logo, logoName: last.logoName, logoId: last.logoId, logoStatus: last.logoStatus, text: last.text,
      zones: z.length ? z : c.zones, color: p.colors.includes(last.color) ? last.color : c.color }));
  }, [sameLogo, lines.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qtyOf(cfg);
  // Pièces du panier qui portent déjà ce logo : elles comptent pour la remise marquage.
  const others = cfg.logoId || cfg.logoStatus === 'text'
    ? lines.reduce((a, l, i) => a + (i !== editIndex && logoKey(l) === logoKey(cfg) ? qtyOf(l) : 0), 0) : 0;
  const pool = q + others;
  const cur = tierFor(pool);
  const nt = nextTier(pool);
  const at = (n: number) => unitAt(cfg, n);
  const set = (patch: Partial<LineConfig>) => setCfg((c) => ({ ...c, ...patch }));
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3200); };

  const toggleZone = (id: string) => {
    // Le grand devant recouvre le cœur et l'anti-cœur : l'un remplace les autres.
    set({ zones: cfg.zones.includes(id) ? cfg.zones.filter((z) => z !== id) : [...cfg.zones.filter((z) => !(CLASH[id] || []).includes(z)), id] });
    setView(zones.find((z) => z.id === id)!.view);
  };
  const setQty = (s: string, v: number) => set({ qty: { ...cfg.qty, [s]: Math.max(0, Math.floor(v) || 0) } });
  const reachTier = () => {
    if (!nt) return;
    const keys = Object.keys(cfg.qty), k = keys[Math.min(2, keys.length - 1)];
    setQty(k, cfg.qty[k] + nt[0] - pool);
  };
  const [uploading, setUploading] = useState(false);
  /** Envoie le fichier d'origine au serveur (pour l'atelier) ; l'aperçu reste calculé dans le navigateur. */
  const upload = async (f: File) => {
    setUploading(true);
    try {
      const body = new FormData(); body.append('file', f);
      const r = await fetch('/api/logo', { method: 'POST', body });
      const d = await r.json();
      if (!r.ok) { flash(d.error || 'Envoi du logo impossible'); return; }
      setCfg((c) => ({ ...c, logoId: d.id }));
    } catch { flash('Envoi du logo impossible. Vérifiez votre connexion.'); }
    finally { setUploading(false); }
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    setApproved(false);
    // Sans graphiste, le logo doit s'afficher sur la maquette : on n'accepte que des images.
    if (!f.type.startsWith('image/')) { flash('Envoyez votre logo en PNG, JPG ou SVG pour le voir sur la maquette.'); return; }
    set({ logoId: undefined, logoLowRes: false });
    upload(f);
    const size = await imageSize(f);
    const low = !!size && Math.max(size.w, size.h) < LOW_RES && !/svg/.test(f.type);
    try { set({ logo: await preview(f), logoName: f.name, logoStatus: 'uploaded', logoLowRes: low }); } catch { flash('Ce fichier ne s\'ouvre pas. Essayez un PNG ou un JPG.'); }
    if (low) flash('Logo en petite définition : l\'impression risque d\'être floue. Envoyez une version plus grande si vous l\'avez.');
  };
  const submit = async () => {
    if (!q) { flash('Indiquez au moins une pièce'); return; }
    if (!cfg.zones.length) { flash('Choisissez au moins un emplacement'); return; }
    if (uploading) { flash('Envoi du logo en cours, un instant…'); return; }
    if (cfg.logoStatus === 'uploaded' && !cfg.logoId) { flash('Ajoutez votre logo, ou choisissez « Texte seul ».'); return; }
    if (cfg.logoStatus === 'text' && !cfg.text?.trim()) { flash('Écrivez le texte à imprimer.'); return; }
    if (!approved) { flash('Cochez la validation de votre maquette.'); return; }
    // La maquette validée est figée en image et jointe à la commande (BAT).
    setSaving(true);
    const svgs = Array.from(shots.current?.querySelectorAll('svg') ?? []) as SVGSVGElement[];
    const png = await snapshot(svgs, `${p.name} · ${COLOR_NAMES[cfg.color]} · ${cfg.zones.map((z) => zones.find((x) => x.id === z)?.name).join(' + ')}`).catch(() => null);
    const mockupId = png ? await uploadMockup(png) : null;
    setSaving(false);
    if (!mockupId) { flash('Enregistrement de la maquette impossible. Réessayez.'); return; }
    const item = { ...cfg, mockupId, approvedAt: new Date().toISOString() };
    if (editIndex !== null) { update(editIndex, item); router.push('/panier'); return; }
    add(item);
    setApproved(false);
    setAdded(true);
    flash(`${q} × ${p.name} ajoutés au panier`);
  };
  const hasBack = zones.some((z) => z.view === 'back');
  const logoLabel = cfg.logoStatus === 'text' ? 'Texte seul (sans logo)' : cfg.logo ? 'Logo ajouté' : 'Déposez votre logo';

  return (
    <div className="pdp">
      <div className="gallery">
        <div className="stage"><Garment slug={slug} color={cfg.color} view={view} zones={cfg.zones} logo={cfg.logo} text={cfg.text} /></div>
        {hasBack && (
          <div className="seg" role="group" aria-label="Vue">
            <button aria-pressed={view === 'front'} onClick={() => setView('front')}>Face</button>
            <button aria-pressed={view === 'back'} onClick={() => setView('back')}>Dos</button>
          </div>
        )}
        <p className="muted small">Cette maquette sert de bon à tirer : l&apos;impression reprend exactement ce que vous voyez (emplacement, couleurs, texte).</p>
        <div ref={shots} className="offscreen" aria-hidden="true">
          <Garment slug={slug} color={cfg.color} view="front" zones={cfg.zones} logo={cfg.logo} text={cfg.text} />
          {zones.some((z) => z.view === 'back' && cfg.zones.includes(z.id)) ? <Garment slug={slug} color={cfg.color} view="back" zones={cfg.zones} logo={cfg.logo} text={cfg.text} /> : null}
        </div>
      </div>

      <div className="buy">
        <div>
          <h1 className="pdp-title">{p.name}</h1>
          <p className="muted">{p.type} · {p.composition}</p>
          <p className="from">dès <b><Price ht={at(TIERS[TIERS.length - 1][0])} /></b> la pièce, logo compris</p>
        </div>

        <div className="blk">
          <div className="lbl">Couleur <span>{COLOR_NAMES[cfg.color]}</span></div>
          <div className="swatches">
            {p.colors.map((c) => <button key={c} className="sw" style={{ background: c }} aria-label={COLOR_NAMES[c]} aria-pressed={c === cfg.color} onClick={() => set({ color: c })} />)}
          </div>
        </div>

        <div className="blk">
          <div className="lbl">Votre logo</div>
          <label className={`drop ${cfg.logoId || cfg.logoStatus === 'text' ? 'has' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
            <strong>{logoLabel}</strong>
            <small>{uploading ? 'Envoi du fichier en cours…' : cfg.logoStatus === 'uploaded' ? (cfg.logoId ? 'Fichier reçu · touchez pour le remplacer' : 'Touchez pour le remplacer') : 'PNG, JPG ou SVG · le plus grand possible, fond transparent idéalement'}</small>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <div className="opts">
            <button className="link" onClick={() => { setApproved(false); set({ logo: undefined, logoName: undefined, logoId: undefined, logoLowRes: false, logoStatus: 'text' }); }}>Je n&apos;ai pas de logo : imprimer seulement un texte</button>
            {cfg.logoLowRes && <p className="warnline">Logo en petite définition : l&apos;impression risque d&apos;être floue. Mieux vaut une image d&apos;au moins {LOW_RES} pixels.</p>}
          </div>
          <input type="text" value={cfg.text} maxLength={24} placeholder={cfg.logoStatus === 'text' ? 'Texte à imprimer (nom, slogan…)' : 'Texte facultatif sous le logo'} aria-label="Texte sous le logo" onChange={(e) => set({ text: e.target.value })} />
        </div>

        <div className="blk">
          <div className="lbl">Emplacements <span>marquage par pièce</span></div>
          <div className="chips">
            {zones.map((z) => (
              <button key={z.id} className="zone" aria-pressed={cfg.zones.includes(z.id)} onClick={() => toggleZone(z.id)}>
                {z.name}<small>{z.size} · +<Price ht={z.price} suffix={false} />{z.fixed ? ' fixe' : ''}</small>
              </button>
            ))}
          </div>
          {hasBack && !cfg.zones.includes('back') && (
            <div className="nudge"><span>Un logo au dos rend votre équipe visible de loin.</span><button className="btn line small" onClick={() => toggleZone('back')}>Ajouter au dos</button></div>
          )}
        </div>

        <div className="blk">
          <div className="lbl">Quantités {sizesFor(p).length > 1 && <span><Link className="link" href="/faq#tailles">Guide des tailles</Link></span>}</div>
          <div className="sizes">
            {Object.keys(cfg.qty).map((s) => (
              <div className="sz" key={s}>
                <b>{s}</b>
                <div className="ctr">
                  <button aria-label={`Retirer ${s}`} onClick={() => setQty(s, cfg.qty[s] - 1)}>−</button>
                  <input type="number" inputMode="numeric" min={0} value={cfg.qty[s]} aria-label={`Quantité ${s}`} onChange={(e) => setQty(s, Number(e.target.value))} />
                  <button aria-label={`Ajouter ${s}`} onClick={() => setQty(s, cfg.qty[s] + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          {others > 0 && <p className="muted small">+ {others} pièce{others > 1 ? 's' : ''} avec ce logo déjà dans le panier, comptée{others > 1 ? 's' : ''} pour la remise.</p>}
          {zones.some((z) => cfg.zones.includes(z.id) && !z.fixed) && (nt ? (
            <div className="nudge"><span>Plus que <b>{nt[0] - pool}</b> pour <b>-{Math.round(nt[1] * 100)} %</b> sur le marquage</span><button className="btn line small" onClick={reachTier}>Passer à {nt[0] - others}</button></div>
          ) : cur[1] === MAX_DISCOUNT ? <div className="nudge ok">Meilleur prix de marquage atteint (-{Math.round(MAX_DISCOUNT * 100)} %)</div> : null)}
          <div className="tiers">
            {TIERS.map(([m, d]) => <div key={m} className={m === cur[0] ? 'on' : ''}><b><Price ht={at(m)} suffix={false} /></b>{m}+ pcs{d ? <small>marquage -{Math.round(d * 100)} %</small> : null}</div>)}
          </div>
        </div>

        <div className="addrow">
          <div>
            <small className="muted">{q} pièce{q > 1 ? 's' : ''} · {q ? <Price ht={at(pool)} /> : '—'} / pièce</small>
            <div className="tot"><Price ht={lineTotal(cfg, pool)} /></div>
          </div>
          <label className="consent bat"><input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} /><span>Je valide cette maquette comme <b>bon à tirer</b> : emplacement, couleurs et texte sont corrects.</span></label>
          <button className="btn cta" onClick={submit} disabled={saving}>{saving ? 'Enregistrement de la maquette…' : editIndex !== null ? 'Mettre à jour' : 'Ajouter au panier'}</button>
        </div>
        <div className="trust"><span>Maquette validée = impression identique</span><span>Paiement sécurisé</span><span>Défaut d&apos;impression refait</span><span>Livraison 7 jours ouvrés</span></div>
      </div>
      {added && <SameLogo current={p.category} logo={cfg.logo} />}
      {toast && <div className="toast" role="status">{toast} {toast.includes('ajoutés') && <Link href="/panier">Voir le panier</Link>}</div>}
    </div>
  );
}

/** Après l'ajout : proposer les autres types de vêtements avec le même logo, en un tap. */
function SameLogo({ current, logo }: { current: string; logo?: string }) {
  const picks = CATEGORIES.filter((c) => c.slug !== current)
    .map((c) => PRODUCTS.find((x) => x.category === c.slug && x.bestseller) ?? PRODUCTS.find((x) => x.category === c.slug)!)
    .filter(Boolean);
  return (
    <section className="samelogo" aria-label="Même logo sur un autre vêtement">
      <div className="sec-head"><h2>Même logo sur un autre vêtement ?</h2><Link className="btn cta small" href="/panier">Voir le panier</Link></div>
      <p className="muted small">Votre logo et vos emplacements sont repris automatiquement : choisissez juste la couleur et les quantités.</p>
      <div className="samegrid">
        {picks.map((x) => (
          <Link key={x.slug} className="pcard" href={`/produits/${x.slug}?meme-logo=1`}>
            <div className="img"><Garment slug={x.slug} color={defaultColor(x)} zones={['heart']} logo={logo} /></div>
            <strong>{CATEGORIES.find((c) => c.slug === x.category)!.name}</strong>
            <small>{x.name}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
