'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { COLOR_NAMES, TIERS, defaultColor, getProduct, nextTier, sizesFor, tierFor, zonesFor } from '@/lib/catalog';
import { lineTotal, qtyOf, unitBase, unitPrice, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';

function initial(slug: string): LineConfig {
  const p = getProduct(slug)!;
  const sizes = sizesFor(p);
  const demo = [1, 3, 4, 2];
  return {
    slug, color: defaultColor(p), zones: [p.shape === 'cap' ? 'chest' : 'heart'],
    qty: Object.fromEntries(sizes.map((s, i) => [s, sizes.length === 1 ? 10 : demo[i] || 0])),
    logoStatus: 'later', text: '',
  };
}

/** Réduit l'image du logo pour l'aperçu et le panier (le fichier d'origine sera envoyé au serveur à la commande). */
async function preview(file: File): Promise<string> {
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
  const edit = useSearchParams().get('modifier');
  const editIndex = edit !== null && lines[Number(edit)]?.slug === slug ? Number(edit) : null;

  const [cfg, setCfg] = useState<LineConfig>(() => initial(slug));
  const [view, setView] = useState<'front' | 'back'>('front');
  const [toast, setToast] = useState('');
  useEffect(() => { if (editIndex !== null) setCfg(structuredClone(lines[editIndex])); }, [editIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qtyOf(cfg);
  const cur = tierFor(q);
  const nt = nextTier(q);
  const base = useMemo(() => unitBase(cfg), [cfg]);
  const set = (patch: Partial<LineConfig>) => setCfg((c) => ({ ...c, ...patch }));
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3200); };

  const toggleZone = (id: string) => {
    set({ zones: cfg.zones.includes(id) ? cfg.zones.filter((z) => z !== id) : [...cfg.zones, id] });
    setView(zones.find((z) => z.id === id)!.view);
  };
  const setQty = (s: string, v: number) => set({ qty: { ...cfg.qty, [s]: Math.max(0, Math.floor(v) || 0) } });
  const reachTier = () => {
    if (!nt) return;
    const keys = Object.keys(cfg.qty), k = keys[Math.min(2, keys.length - 1)];
    setQty(k, cfg.qty[k] + nt[0] - q);
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { set({ logo: undefined, logoName: f.name, logoStatus: 'uploaded' }); flash('Fichier reçu : notre graphiste l\'intègre au visuel'); return; }
    try { set({ logo: await preview(f), logoName: f.name, logoStatus: 'uploaded' }); } catch { flash('Ce fichier ne s\'ouvre pas. Essayez un PNG ou un JPG.'); }
  };
  const submit = () => {
    if (!q) { flash('Indiquez au moins une pièce'); return; }
    if (!cfg.zones.length) { flash('Choisissez au moins un emplacement'); return; }
    if (editIndex !== null) { update(editIndex, cfg); router.push('/panier'); return; }
    add(cfg);
    flash(`${q} × ${p.name} ajoutés au panier`);
  };
  const hasBack = zones.some((z) => z.view === 'back');
  const logoLabel = cfg.logoStatus === 'uploaded' ? (cfg.logo ? 'Logo ajouté' : cfg.logoName) : cfg.logoStatus === 'create' ? 'Création de logo offerte' : 'Déposez votre logo';

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
        <p className="muted small">Aperçu indicatif. Un visuel à l&apos;échelle vous est envoyé avant production.</p>
      </div>

      <div className="buy">
        <div>
          <h1 className="pdp-title">{p.name}</h1>
          <p className="muted">{p.type} · {p.composition}</p>
          <p className="from">dès <b><Price ht={base * (1 - TIERS[TIERS.length - 1][1])} /></b> la pièce, logo compris</p>
        </div>

        <div className="blk">
          <div className="lbl">Couleur <span>{COLOR_NAMES[cfg.color]}</span></div>
          <div className="swatches">
            {p.colors.map((c) => <button key={c} className="sw" style={{ background: c }} aria-label={COLOR_NAMES[c]} aria-pressed={c === cfg.color} onClick={() => set({ color: c })} />)}
          </div>
        </div>

        <div className="blk">
          <div className="lbl">Votre logo</div>
          <label className={`drop ${cfg.logoStatus !== 'later' ? 'has' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
            <strong>{logoLabel}</strong>
            <small>{cfg.logoStatus === 'uploaded' ? 'Touchez pour le remplacer' : 'Photo, PNG, JPG, SVG ou PDF · un graphiste le prépare gratuitement'}</small>
            <input type="file" accept="image/*,.pdf,.ai,.eps" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <div className="opts">
            <button className="link" onClick={() => set({ logo: undefined, logoName: undefined, logoStatus: 'create' })}>Je n&apos;ai pas de logo : créez-le pour moi (offert)</button>
            <button className="link" onClick={() => set({ logo: undefined, logoName: undefined, logoStatus: 'later' })}>Je l&apos;enverrai après la commande</button>
          </div>
          <input type="text" value={cfg.text} maxLength={24} placeholder="Texte facultatif (nom, slogan…)" aria-label="Texte sous le logo" onChange={(e) => set({ text: e.target.value })} />
        </div>

        <div className="blk">
          <div className="lbl">Emplacements <span>prix par pièce</span></div>
          <div className="chips">
            {zones.map((z) => (
              <button key={z.id} className="zone" aria-pressed={cfg.zones.includes(z.id)} onClick={() => toggleZone(z.id)}>
                {z.name}<small>+<Price ht={z.price} suffix={false} /></small>
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
          {nt ? (
            <div className="nudge"><span>Plus que <b>{nt[0] - q}</b> pour passer à <b>-{Math.round(nt[1] * 100)} %</b></span><button className="btn line small" onClick={reachTier}>Passer à {nt[0]}</button></div>
          ) : <div className="nudge ok">Meilleur tarif atteint</div>}
          <div className="tiers">
            {TIERS.map(([m, d]) => <div key={m} className={m === cur[0] ? 'on' : ''}><b><Price ht={base * (1 - d)} suffix={false} /></b>{m}+ pcs</div>)}
          </div>
        </div>

        <div className="addrow">
          <div>
            <small className="muted">{q} pièce{q > 1 ? 's' : ''} · {q ? <Price ht={unitPrice(cfg)} /> : '—'} / pièce</small>
            <div className="tot"><Price ht={lineTotal(cfg)} /></div>
          </div>
          <button className="btn cta" onClick={submit}>{editIndex !== null ? 'Mettre à jour' : 'Ajouter au panier'}</button>
        </div>
        <div className="trust"><span>Visuel envoyé sous 24 h</span><span>Paiement sécurisé</span><span>Défaut d&apos;impression refait</span><span>Livraison 7 jours ouvrés</span></div>
      </div>
      {toast && <div className="toast" role="status">{toast} {toast.includes('ajoutés') && <Link href="/panier">Voir le panier</Link>}</div>}
    </div>
  );
}
