'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, CLASH, COLOR_NAMES, MAX_DISCOUNT, PRODUCTS, TEXT_COLORS, TEXT_FONTS, TIERS, defaultColor, getProduct, nextTier, sizesFor, tierFor, zonesFor, defaultZone } from '@/lib/catalog';
import { cartTotals, lineTotal, logoKey, qtyOf, unitAt, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';
import { CutoutChoice, ReworkOption, useLogo } from './LogoCutout';
import { Perks } from './ui';
import { useT } from '@/i18n/client';
import { categoryL, colorName, productL, zonesL } from '@/i18n';
import { snapshot, toDataUrl, uploadMockup } from '@/lib/mockup';
import { uploadFile } from '@/lib/cutout';
import { contrast, logoAverage, monochrome } from '@/lib/logoInk';
import { track } from '@/lib/track';
import { deliveryDate, fmtDay } from '@/lib/delivery';
import { ON_ORDER_DAYS, available, colorStocked, shortSizes } from '@/lib/stockTypes';
import { useStock } from '@/lib/useStock';
import { I } from './Icons';

function initial(slug: string): LineConfig {
  const p = getProduct(slug)!;
  const sizes = sizesFor(p);
  return {
    slug, color: defaultColor(p), zones: [defaultZone(p)],
    // Quantités à zéro : le client choisit lui-même (un total pré-rempli ferait croire à un prix unitaire).
    qty: Object.fromEntries(sizes.map((s) => [s, 0])),
    logoStatus: 'uploaded', text: '',
  };
}

export { LOW_RES } from './LogoCutout';
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
  const { t, l, lang } = useT();
  const stock = useStock();
  const pL = productL(lang, p);
  const zones = zonesL(lang, p);
  const pcs = (n: number) => t(n > 1 ? '{n} pièces' : '{n} pièce', { n });
  const { add, update, lines, connected } = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const edit = params.get('modifier');
  const sameLogo = params.get('meme-logo') !== null;
  // « Mes logos » de l'espace client : réutilisés tels quels (déjà préparés pour l'impression).
  const [myLogos, setMyLogos] = useState<{ id: string }[] | null>(null);
  const pickMyLogo = async (id: string) => {
    if (!/^[a-f0-9]{32}\.[a-z]{2,5}$/.test(id)) return;
    const src = await toDataUrl(`/api/logo/${id}?apercu`);
    if (!src) return;
    setApproved(false);
    setCfg((c) => ({ ...c, logo: src, logoName: 'logo', logoId: id, logoSourceId: id, logoStatus: 'uploaded', logoLowRes: false, zones: c.zones.length ? c.zones : [defaultZone(p)] }));
  };
  useEffect(() => { const id = params.get('logo'); if (id) pickMyLogo(id); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const openMyLogos = () => fetch('/api/compte/me').then((r) => r.json()).then((d) => setMyLogos(Array.isArray(d?.logos) ? d.logos : [])).catch(() => setMyLogos([]));
  const [added, setAdded] = useState(false);
  const editIndex = edit !== null && lines[Number(edit)]?.slug === slug ? Number(edit) : null;

  const [cfg, setCfg] = useState<LineConfig>(() => {
    // Couleur imposée par le lien (Google Shopping : ?couleur=1d2a5c).
    const c = initial(slug), h = params.get('couleur');
    const c2 = h && p.colors.includes(`#${h}`) ? { ...c, color: `#${h}` } : c;
    // Lien depuis la page Textile vierge : mode sans marquage déjà choisi.
    return params.get('vierge') !== null ? { ...c2, zones: [], logoStatus: 'blank' as const } : c2;
  });
  useEffect(() => { track('view_item', { items: [{ item_id: slug, item_name: p.name }] }); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState<'front' | 'back'>('front');
  const [toast, setToast] = useState('');
  const [approved, setApproved] = useState(false);
  // Erreur affichée sous le champ concerné (et non dans un toast loin du bouton).
  const [fieldErr, setFieldErr] = useState<{ at: 'logo' | 'zones' | 'qty' | 'bat'; msg: string } | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => { setFieldErr(null); }, [cfg, approved]);
  useEffect(() => { if (!justAdded) return; const id = setTimeout(() => setJustAdded(false), 8000); return () => clearTimeout(id); }, [justAdded]);
  const prevZones = useRef<string[]>([]);
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
    setCfg((c) => ({ ...c, logo: last.logo, logoName: last.logoName, logoId: last.logoId, logoSourceId: last.logoSourceId, logoCut: last.logoCut, logoRework: last.logoRework, logoStatus: last.logoStatus, text: last.text,
      zones: z.length ? z : c.zones, color: p.colors.includes(last.color) ? last.color : c.color }));
  }, [sameLogo, lines.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qtyOf(cfg);
  // Plusieurs couleurs dans la même configuration : même logo, mêmes emplacements, une ligne de panier par couleur.
  const [extra, setExtra] = useState<{ color: string; qty: Record<string, number> }[]>([]);
  const extraQ = extra.reduce((a, e) => a + qtyOf({ qty: e.qty }), 0);
  const variants = [...extra.filter((e) => e.color !== cfg.color), ...(q ? [{ color: cfg.color, qty: cfg.qty }] : [])];
  const zeroQty = () => Object.fromEntries(Object.keys(cfg.qty).map((k) => [k, 0]));
  const addColor = () => {
    const next = p.colors.find((c) => c !== cfg.color && !extra.some((e) => e.color === c));
    if (!next) return;
    setExtra([...extra.filter((e) => e.color !== cfg.color), { color: cfg.color, qty: cfg.qty }]);
    set({ color: next, qty: zeroQty() }); setApproved(false);
  };
  const editColor = (c: string) => {
    const e = extra.find((x) => x.color === c); if (!e) return;
    setExtra([...extra.filter((x) => x.color !== c && x.color !== cfg.color), ...(q ? [{ color: cfg.color, qty: cfg.qty }] : [])]);
    set({ color: e.color, qty: e.qty });
  };
  const blank = cfg.logoStatus === 'blank';
  const short = shortSizes(stock, { slug, color: cfg.color, qty: cfg.qty });
  const stockHint = (size: string) => {
    const n = available(stock, slug, cfg.color, size);
    if (n === null) return null;
    if (n <= 0 || (cfg.qty[size] || 0) > n) return <small className="sz-stock out">{t('sur commande')}</small>;
    return n <= 5 ? <small className="sz-stock low">{t('plus que {n}', { n })}</small> : null;
  };
  // Pièces du panier qui portent déjà ce logo : elles comptent pour la remise marquage.
  const others = cfg.logoId || cfg.logoStatus === 'text'
    ? lines.reduce((a, l, i) => a + (i !== editIndex && logoKey(l) === logoKey(cfg) ? qtyOf(l) : 0), 0) : 0;
  const pool = q + others + extraQ;
  const cur = tierFor(pool);
  const nt = nextTier(pool);
  const at = (n: number) => unitAt(cfg, n);
  const set = (patch: Partial<LineConfig>) => setCfg((c) => ({ ...c, ...patch }));
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3200); };
  const fail = (at: 'logo' | 'zones' | 'qty' | 'bat', msg: string) => {
    setFieldErr({ at, msg });
    const el = document.getElementById(`cfg-${at}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el?.querySelector('input:not([type=file]),button') as HTMLElement | null)?.focus({ preventScroll: true });
  };

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
  // Logo : détourage automatique, puis envoi du fichier final (celui de la maquette) à l'atelier.
  const { logo: lg, pick, choose } = useLogo((l) => {
    setApproved(false);
    setCfg((c) => ({ ...c, logoMono: undefined, logo: l.preview, logoName: l.name, logoId: l.id, logoSourceId: l.sourceId, logoCut: l.mode, logoStatus: 'uploaded', logoLowRes: l.lowRes }));
    if (l.error) flash(l.error);
  });
  const uploading = !!lg?.busy;
  const onFile = async (f?: File) => {
    if (!f) return;
    setApproved(false);
    set({ logoId: undefined, logoLowRes: false });
    await pick(f);
  };
  // forTeam : la liste d'équipe fixe les quantités ensuite, elles ne sont pas exigées ici.
  const submit = async (forTeam = false) => {
    if (!q && !extraQ && !forTeam) { fail('qty', t('Indiquez au moins une pièce')); return; }
    if (blank) {
      // Textile vierge : pas de maquette ni de validation, on ajoute directement.
      const item: LineConfig = { slug, color: cfg.color, zones: [], qty: cfg.qty, logoStatus: 'blank' };
      if (forTeam) {
        setSaving(true);
        const r = await fetch('/api/equipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line: item }) }).catch(() => null);
        const d = r && r.ok ? await r.json() : null;
        setSaving(false);
        if (!d?.id) { flash(t('Création du lien impossible. Réessayez.')); return; }
        router.push(`${l(`/equipe/${d.id}`)}?cle=${d.adminKey}`);
        return;
      }
      if (editIndex !== null) { update(editIndex, item); router.push(l('/panier')); return; }
      for (const v of variants) add({ ...item, ...v });
      track('add_to_cart', { value: variants.reduce((a, v) => a + lineTotal({ ...item, ...v }, pool), 0), items: [{ item_id: p.slug, item_name: p.name, quantity: q + extraQ }] });
      setExtra([]);
      setAdded(true); setJustAdded(true);
      flash(t('Ajouté au panier : {q} × {name}', { q: q + extraQ, name: pL.name }));
      return;
    }
    if (!cfg.zones.length) { fail('zones', t('Choisissez au moins un emplacement')); return; }
    if (uploading) { flash(t('Envoi du logo en cours, un instant…')); return; }
    if (cfg.logoStatus === 'uploaded' && lg?.hasBg && !lg.decided && !cfg.logoRework) { fail('logo', t('Votre logo a un fond : choisissez avec ou sans fond.')); return; }
    if (cfg.logoStatus === 'uploaded' && !cfg.logoId) { fail('logo', t('Ajoutez votre logo, ou choisissez « Texte seul ».')); return; }
    if (cfg.logoStatus === 'text' && !cfg.text?.trim()) { fail('logo', t('Écrivez le texte à imprimer.')); return; }
    if (cfg.zoneText && Object.values(cfg.zoneText).some((v) => !v.trim())) { fail('zones', t('Écrivez le texte de chaque emplacement, ou choisissez « Logo ».')); return; }
    if (!approved) { fail('bat', t('Cochez la validation de votre maquette.')); return; }
    // La maquette validée est figée en image et jointe à la commande (BAT).
    setSaving(true);
    // Une maquette (BAT) par couleur commandée.
    const shot = async (color: string) => {
      const svgs = Array.from(shots.current?.querySelectorAll(`[data-c="${color}"] svg`) ?? []) as SVGSVGElement[];
      const png = await snapshot(svgs, `${p.name} · ${COLOR_NAMES[color]} · ${zonesFor(p).filter((z) => cfg.zones.includes(z.id)).map((z) => z.name).join(' + ')}`).catch(() => null);
      return png ? uploadMockup(png) : null;
    };
    const mockupId = await shot(cfg.color);
    const extraItems: LineConfig[] = [];
    if (!forTeam && editIndex === null) for (const v of variants.filter((v) => v.color !== cfg.color)) {
      const id = await shot(v.color);
      if (!id) { setSaving(false); flash(t('Enregistrement de la maquette impossible. Réessayez.')); return; }
      extraItems.push({ ...cfg, ...v, mockupId: id, approvedAt: new Date().toISOString() });
    }
    setSaving(false);
    if (!mockupId) { flash(t('Enregistrement de la maquette impossible. Réessayez.')); return; }
    const item = { ...cfg, mockupId, approvedAt: new Date().toISOString() };
    if (forTeam) {
      // Liste d'équipe : on enregistre l'article validé, puis l'acheteur partage le lien.
      setSaving(true);
      const r = await fetch('/api/equipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line: { ...item, logo: undefined } }) }).catch(() => null);
      const d = r && r.ok ? await r.json() : null;
      setSaving(false);
      if (!d?.id) { flash(t('Création du lien impossible. Réessayez.')); return; }
      try { localStorage.setItem('alwaan-teams', JSON.stringify([{ id: d.id, key: d.adminKey, slug: p.slug, at: Date.now() }, ...JSON.parse(localStorage.getItem('alwaan-teams') || '[]')].slice(0, 20))); } catch {}
      router.push(`${l(`/equipe/${d.id}`)}?cle=${d.adminKey}`);
      return;
    }
    if (editIndex !== null) { update(editIndex, item); router.push(l('/panier')); return; }
    const all = [...extraItems, ...(q ? [item] : [])];
    for (const it of all) add(it);
    track('add_to_cart', { value: all.reduce((a, it) => a + lineTotal(it, pool), 0), items: [{ item_id: p.slug, item_name: p.name, quantity: q + extraQ }] });
    setExtra([]);
    setApproved(false);
    setAdded(true); setJustAdded(true);
    flash(t('Ajouté au panier : {q} × {name}', { q: q + extraQ, name: pL.name }));
  };
  // Lien à envoyer au responsable : il ouvre la même tenue et peut la commander.
  const share = async () => {
    if (!q) { fail('qty', t('Indiquez au moins une pièce')); return; }
    if (cfg.logoStatus === 'uploaded' && !cfg.logoId) { fail('logo', t('Ajoutez votre logo, ou choisissez « Texte seul ».')); return; }
    setSaving(true);
    const svgs = Array.from(shots.current?.querySelectorAll(`[data-c="${cfg.color}"] svg`) ?? []) as SVGSVGElement[];
    const png = await snapshot(svgs, `${p.name} · ${COLOR_NAMES[cfg.color]}`).catch(() => null);
    const mockupId = png ? await uploadMockup(png) : null;
    const r = await fetch('/api/panier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines: [{ ...cfg, logo: undefined, mockupId }] }) }).catch(() => null);
    const d = r?.ok ? await r.json() : null;
    setSaving(false);
    if (!d?.url) { flash(t('Partage impossible. Réessayez.')); return; }
    const text = t('Peux-tu valider cette tenue ?');
    if (navigator.share) { navigator.share({ title: 'alwaan', text, url: d.url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(d.url); flash(t('Lien copié : collez-le dans un email ou un message.')); } catch { window.prompt(t('Lien à partager'), d.url); }
  };
  // Logo peu visible sur la couleur du textile (ex. logo noir sur polo noir) : on propose une version d'une seule couleur.
  const orig = useRef<{ logo?: string; logoId?: string } | null>(null);
  const [ink, setInk] = useState<{ avg: string; cover: number } | null>(null);
  const [monoBusy, setMonoBusy] = useState(false);
  useEffect(() => {
    if (cfg.logoMono || !cfg.logo || cfg.logoStatus !== 'uploaded') { if (!cfg.logo) setInk(null); return; }
    orig.current = { logo: cfg.logo, logoId: cfg.logoId };
    logoAverage(cfg.logo).then(setInk);
  }, [cfg.logo]); // eslint-disable-line react-hooks/exhaustive-deps
  const lowContrast = !blank && cfg.logoStatus === 'uploaded' && !!cfg.logo && !!ink && contrast(cfg.logoMono || ink.avg, cfg.color) < 1.8;
  const monoChoices = ['#ffffff', '#000000', ...TEXT_COLORS.filter((c) => c !== '#ffffff' && c !== '#000000')].filter((c) => contrast(c, cfg.color) >= 3).slice(0, 4);
  const applyMono = async (hex: string) => {
    const o = orig.current; if (!o?.logo) return;
    setMonoBusy(true);
    // Fichier d'impression en pleine définition si disponible, sinon l'aperçu.
    const src = (o.logoId && (await toDataUrl(`/api/logo/${o.logoId}`))) || o.logo;
    const m = src ? await monochrome(src, hex) : null;
    const up = m ? await uploadFile(m.blob, 'logo-monochrome.png') : null;
    setMonoBusy(false);
    if (!m || !up?.id) { flash(t('Conversion du logo impossible. Réessayez.')); return; }
    setApproved(false);
    setCfg((c) => ({ ...c, logo: m.url, logoId: up.id, logoMono: hex }));
  };
  const undoMono = () => { const o = orig.current; if (!o) return; setApproved(false); setCfg((c) => ({ ...c, logo: o.logo, logoId: o.logoId, logoMono: undefined })); };
  const monoName = (h: string) => (h === '#ffffff' ? t('blanc') : h === '#000000' ? t('noir') : t('couleur'));
  const hasBack = zones.some((z) => z.view === 'back');
  const err = (at: 'logo' | 'zones' | 'qty' | 'bat') => (fieldErr?.at === at ? <p className="err small field-err" role="alert">{fieldErr.msg}</p> : null);
  const logoLabel = t(cfg.logoStatus === 'text' ? 'Texte seul (sans logo)' : cfg.logo ? 'Logo ajouté' : 'Déposez votre logo');

  return (
    <div className="pdp">
      <div className="gallery">
        <div className="stage"><Garment slug={slug} color={cfg.color} view={view} zones={cfg.zones} logo={cfg.logo} text={cfg.text} text2={cfg.text2} textFont={cfg.textFont} textColor={cfg.textColor} zoneText={cfg.zoneText} /></div>
        {hasBack && (
          <div className="seg" role="group" aria-label="Vue">
            <button aria-pressed={view === 'front'} onClick={() => setView('front')}>{t('Face')}</button>
            <button aria-pressed={view === 'back'} onClick={() => setView('back')}>{t('Dos')}</button>
          </div>
        )}
        <div ref={shots} className="offscreen" aria-hidden="true">
          {[cfg.color, ...extra.map((e) => e.color).filter((c) => c !== cfg.color)].map((color) => (<div key={color} data-c={color}>
          <Garment slug={slug} color={color} view="front" zones={cfg.zones} logo={cfg.logo} text={cfg.text} text2={cfg.text2} textFont={cfg.textFont} textColor={cfg.textColor} zoneText={cfg.zoneText} />
          {zones.some((z) => z.view === 'back' && cfg.zones.includes(z.id)) ? <Garment slug={slug} color={color} view="back" zones={cfg.zones} logo={cfg.logo} text={cfg.text} text2={cfg.text2} textFont={cfg.textFont} textColor={cfg.textColor} zoneText={cfg.zoneText} /> : null}
        </div>))}
        </div>
      </div>

      <div className="buy">
        <div>
          <h1 className="pdp-title">{pL.name}</h1>
          <p className="muted">{pL.type} · {pL.composition}</p>
          <p className="from">{t('dès')} <b><Price ht={at(TIERS[TIERS.length - 1][0])} /></b> {t(blank ? 'la pièce, sans marquage' : 'la pièce, logo compris')}</p>
        </div>

        <div className="blk">
          <div className="lbl">{t('Couleur')} <span>{colorName(lang, cfg.color)}</span></div>
          <div className="swatches">
            {p.colors.map((c) => <button key={c} className={`sw ${colorStocked(stock, slug, c) ? '' : 'on-order'}`} style={{ background: c }} aria-label={`${colorName(lang, c)}${colorStocked(stock, slug, c) ? '' : ` · ${t('sur commande')}`}`} title={colorStocked(stock, slug, c) ? undefined : t('Sur commande')} aria-pressed={c === cfg.color} onClick={() => set({ color: c })} />)}
          </div>
          {editIndex === null && (extra.length > 0 || q > 0) && (
            <div className="multi-c">
              {extra.filter((e) => e.color !== cfg.color).map((e) => (
                <span key={e.color} className="mc-chip"><i style={{ background: e.color }} /><button className="link small" onClick={() => editColor(e.color)}>{colorName(lang, e.color)} · {pcs(qtyOf({ qty: e.qty }))}</button><button aria-label={t('Retirer {s}', { s: colorName(lang, e.color) })} onClick={() => setExtra(extra.filter((x) => x.color !== e.color))}>×</button></span>
              ))}
              {q > 0 && p.colors.length > extra.length + 1 && <button className="btn line small" onClick={addColor}>{t('+ Ajouter une autre couleur')}</button>}
              {extra.length > 0 && <small className="muted">{t('En cours : {c}. Toutes les couleurs comptent pour la remise.', { c: colorName(lang, cfg.color) })}</small>}
            </div>
          )}
          {!colorStocked(stock, slug, cfg.color) && <p className="order-note"><I name="clock" size={15} /> {t('Couleur sur commande : +{n} jours ouvrés', { n: ON_ORDER_DAYS })}</p>}
        </div>

        <div className={`blk ${fieldErr?.at === 'logo' ? 'invalid' : ''}`} id="cfg-logo">
          <div className="mode-pick" role="group" aria-label={t('Marquage')}>
            <button aria-pressed={!blank} onClick={() => blank && set({ logoStatus: 'uploaded', zones: prevZones.current.length ? prevZones.current : [defaultZone(p)] })}><I name="palette" size={18} /> {t('Avec mon logo')}</button>
            <button aria-pressed={blank} onClick={() => { if (!blank) { prevZones.current = cfg.zones; set({ logoStatus: 'blank', zones: [], logoRework: false, printNames: false }); } }}><I name="shirt" size={18} /> {t('Textile vierge')}</button>
          </div>
          {blank ? <p className="muted small">{t('Sans marquage, au prix du vêtement seul. Expédié rapidement.')}</p> : (<>
          <div className="lbl">{t('Votre logo')}</div>
          <label className={`drop ${cfg.logoId || cfg.logoStatus === 'text' ? 'has' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
            <strong>{logoLabel}</strong>
            <small>{t(uploading ? 'Préparation du logo…' : cfg.logoStatus === 'uploaded' && cfg.logo ? 'Touchez pour remplacer' : 'PNG, JPG ou SVG')}</small>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {connected && cfg.logoStatus !== 'text' && (myLogos === null
            ? <button className="link small" onClick={openMyLogos}><I name="palette" size={16} /> {t('Choisir un de mes logos')}</button>
            : myLogos.length ? <div className="mylogos" role="group" aria-label={t('Mes logos')}>{myLogos.slice(0, 8).map((g) => <button key={g.id} aria-pressed={cfg.logoId === g.id} onClick={() => pickMyLogo(g.id)}><img src={`/api/logo/${g.id}?apercu`} alt={t('Mon logo')} /></button>)}</div>
            : <p className="muted small">{t('Aucun logo enregistré pour l\'instant.')}</p>)}
          <div className="opts">
            <CutoutChoice logo={cfg.logoStatus === 'uploaded' ? lg : null} choose={choose} />
            <ReworkOption logo={cfg.logoStatus === 'uploaded' ? lg : null} on={!!cfg.logoRework} set={(v) => set({ logoRework: v })} />
            <button className="link" onClick={() => { setApproved(false); set({ logo: undefined, logoName: undefined, logoId: undefined, logoLowRes: false, logoStatus: 'text' }); }}>{t('Je n\'ai pas de logo : imprimer seulement un texte')}</button>
            {lowContrast && (
              <div className="mono-warn" role="status">
                <b>{t('Votre logo risque de ne pas se voir sur ce textile.')}</b>
                {ink!.cover > 0.9
                  ? <small>{t('Retirez le fond (« Sans fond ») pour pouvoir l\'imprimer d\'une seule couleur, ou choisissez un textile plus contrasté.')}</small>
                  : <><small>{t('Imprimez-le d\'une seule couleur :')}</small>
                    <div className="mono-opts">{monoChoices.map((c) => <button key={c} className="btn line small" disabled={monoBusy} onClick={() => applyMono(c)}><i style={{ background: c }} /> {c === '#ffffff' ? t('Logo en blanc') : c === '#000000' ? t('Logo en noir') : t('Logo en couleur')}</button>)}</div></>}
              </div>
            )}
            {cfg.logoMono && <p className="muted small">{t('Logo imprimé en {c}.', { c: monoName(cfg.logoMono) })} <button className="link small" onClick={undoMono}>{t('Revenir aux couleurs d\'origine')}</button></p>}
            {cfg.logoLowRes && <p className="warnline">{t('Logo peu net : envoyez une version plus grande, ou confiez-le au graphiste.')}</p>}
          </div>
          <input type="text" value={cfg.text} maxLength={24} placeholder={t(cfg.logoStatus === 'text' ? 'Texte à imprimer (nom, slogan…)' : 'Texte facultatif sous le logo')} aria-label={t('Texte sous le logo')} onChange={(e) => set({ text: e.target.value })} />
          {!!cfg.text?.trim() && (<div className="txt-opts">
            <input type="text" value={cfg.text2 || ''} maxLength={24} placeholder={t('2e ligne (facultatif)')} aria-label={t('2e ligne de texte')} onChange={(e) => set({ text2: e.target.value })} />
            <div className="seg" role="group" aria-label={t('Police')}>{TEXT_FONTS.map(([k, css]) => <button key={k} aria-pressed={(cfg.textFont || 'oswald') === k} style={{ fontFamily: css }} onClick={() => set({ textFont: k })}>Abc</button>)}</div>
            <div className="swatches small-sw" role="group" aria-label={t('Couleur du texte')}>
              <button className="sw auto" aria-pressed={!cfg.textColor} aria-label={t('Automatique')} onClick={() => set({ textColor: undefined })}>A</button>
              {TEXT_COLORS.map((c) => <button key={c} className="sw" style={{ background: c }} aria-pressed={cfg.textColor === c} aria-label={c} onClick={() => set({ textColor: c })} />)}
            </div>
          </div>)}
          {err('logo')}
          </>)}
        </div>

        {!blank && <div className={`blk ${fieldErr?.at === 'zones' ? 'invalid' : ''}`} id="cfg-zones">
          <div className="lbl">{t('Emplacements')}</div>
          <div className="zones">
            {zones.map((z) => {
              const on = cfg.zones.includes(z.id);
              return (
                <button key={z.id} className="ztile" aria-pressed={on} aria-label={`${z.name}, ${z.size}`} title={`${z.name} · ${z.size}`} onClick={() => toggleZone(z.id)}>
                  {on && <span className="tick"><I name="check" size={12} strokeWidth={3} /></span>}
                  <Garment slug={slug} color={cfg.color} view={z.view} zones={[z.id]} logo={cfg.logo} text={cfg.logoStatus === 'text' ? cfg.text : undefined} textFont={cfg.textFont} textColor={cfg.textColor} zoneText={cfg.zoneText} />
                  <b>{z.name}</b><small>+<Price ht={z.price} suffix={false} /></small>
                </button>
              );
            })}
          </div>
          {err('zones')}
          {cfg.logoStatus === 'uploaded' && cfg.zones.length > 1 && (
            <div className="zone-content">
              <small className="muted">{t('Contenu de chaque emplacement')}</small>
              {zones.filter((z) => cfg.zones.includes(z.id)).map((z) => {
                const txt = cfg.zoneText?.[z.id];
                const setZt = (v: string | undefined) => { const zt = { ...(cfg.zoneText || {}) }; if (v === undefined) delete zt[z.id]; else zt[z.id] = v; set({ zoneText: Object.keys(zt).length ? zt : undefined }); setView(z.view); };
                return (
                  <div key={z.id} className="zc-row">
                    <b>{z.name}</b>
                    <div className="seg" role="group" aria-label={z.name}>
                      <button aria-pressed={txt === undefined} onClick={() => setZt(undefined)}>{t('Logo')}</button>
                      <button aria-pressed={txt !== undefined} onClick={() => setZt(txt ?? '')}>{t('Texte')}</button>
                    </div>
                    {txt !== undefined && <input type="text" value={txt} maxLength={30} placeholder={t('Ex. www.votresite.fr')} aria-label={t('Texte : {z}', { z: z.name })} onChange={(e) => setZt(e.target.value)} />}
                  </div>
                );
              })}
            </div>
          )}
          {hasBack && !cfg.zones.includes('back') && (
            <div className="nudge"><span>{t('Visible de loin ?')}</span><button className="btn line small" onClick={() => toggleZone('back')}>{t('+ Logo au dos')}</button></div>
          )}
        </div>}

        <div className={`blk ${fieldErr?.at === 'qty' ? 'invalid' : ''}`} id="cfg-qty">
          <div className="lbl">{t('Quantités')} {sizesFor(p).length > 1 && <span><Link className="link" href={`${l('/faq')}#tailles`}>{t('Guide des tailles')}</Link></span>}</div>
          <div className="sizes">
            {Object.keys(cfg.qty).map((s) => (
              <div className={`sz ${short.includes(s) ? 'short' : ''}`} key={s}>
                <b>{s}</b>
                {colorStocked(stock, slug, cfg.color) && stockHint(s)}
                <div className="ctr">
                  <button aria-label={t('Retirer {s}', { s })} onClick={() => setQty(s, cfg.qty[s] - 1)}>−</button>
                  <input type="number" inputMode="numeric" min={0} value={cfg.qty[s]} aria-label={t('Quantité {s}', { s })} onChange={(e) => setQty(s, Number(e.target.value))} />
                  <button aria-label={t('Ajouter {s}', { s })} onClick={() => setQty(s, cfg.qty[s] + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          {err('qty')}
          {short.length > 0 && colorStocked(stock, slug, cfg.color) && <p className="order-note"><I name="clock" size={15} /> {t('Au-delà du stock, sur commande : +{n} jours ouvrés', { n: ON_ORDER_DAYS })}</p>}
          {others > 0 && <p className="muted small">{t('+ {n} avec ce logo déjà dans le panier, comptées pour la remise.', { n: pcs(others) })}</p>}
          {!blank && q > 0 && zones.some((z) => cfg.zones.includes(z.id) && !z.fixed) && (nt ? (
            <div className="nudge"><span>+{pcs(nt[0] - pool)} = {t('marquage')} <b>-{Math.round(nt[1] * 100)} %</b></span><button className="btn line small" onClick={reachTier}>{t('Passer à {n}', { n: nt[0] - others })}</button></div>
          ) : cur[1] === MAX_DISCOUNT ? <div className="nudge ok"><I name="check" size={16} /> {t('Marquage')} -{Math.round(MAX_DISCOUNT * 100)} %</div> : null)}
          {!blank && <div className="tiers">
            {TIERS.map(([m, d]) => <div key={m} className={m === cur[0] ? 'on' : ''}><b><Price ht={at(m)} suffix={false} /></b>{m}+ pcs{d ? <small>{t('marquage')} -{Math.round(d * 100)} %</small> : null}</div>)}
          </div>}
        </div>

        {!blank && <div className={`bat-blk ${fieldErr?.at === 'bat' ? 'invalid' : ''}`} id="cfg-bat">
          <label className="consent bat"><input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} aria-invalid={fieldErr?.at === 'bat' || undefined} /><span>{t('Je valide ma maquette')} <b>{t('(bon à tirer)')}</b> {t('et je détiens les droits sur ce logo')}</span></label>
          {err('bat')}
        </div>}
        <div className="addrow">
          <div>
            {q || extraQ ? (<>
              <small className="muted">{pcs(q + extraQ)}{variants.length > 1 ? ` · ${t('{n} couleurs', { n: variants.length })}` : ''} · <Price ht={at(pool)} /> / {t('pièce')}</small>
              <div className="tot"><Price ht={variants.reduce((a, v) => a + lineTotal({ ...cfg, ...v }, pool), 0)} /></div>
            </>) : (<>
              <div className="tot"><Price ht={at(pool)} /> <small className="muted">/ {t('pièce')}</small></div>
              <small className="muted">{t('Choisissez vos tailles')}</small>
            </>)}
            <p className="eta"><I name="truck" size={16} /> {t('Délai indicatif : reçu vers le {d}', { d: fmtDay(deliveryDate(new Date(), false, short.length > 0, blank), lang) })}{!blank && <> · <span className="muted">{t('express possible')}</span></>}</p>
          </div>
          {justAdded && editIndex === null
            ? <Link className="btn cta added" href={l('/panier')}><I name="check" size={18} strokeWidth={3} /> {t('Ajouté · Voir le panier')}</Link>
            : <button className="btn cta" onClick={() => submit()} disabled={saving}>{t(saving ? 'Enregistrement de la maquette…' : editIndex !== null ? 'Mettre à jour' : 'Ajouter au panier')}</button>}
          {editIndex === null && <button className="link small team-link" onClick={() => submit(true)} disabled={saving}><I name="users" size={18} /> {t('Récupérer les noms et tailles de l\'équipe par un lien')}</button>}
        </div>
        {/* Mobile : la barre d'achat reste compacte, délai et lien d'équipe juste en dessous. */}
        <div className="addrow-extra">
          <p className="eta"><I name="truck" size={16} /> {t('Délai indicatif : reçu vers le {d}', { d: fmtDay(deliveryDate(new Date(), false, short.length > 0, blank), lang) })}{!blank && <> · <span className="muted">{t('express possible')}</span></>}</p>
          {editIndex === null && <button className="link small team-link" onClick={() => submit(true)} disabled={saving}><I name="users" size={18} /> {t('Récupérer les noms et tailles de l\'équipe par un lien')}</button>}
          {!blank && editIndex === null && <button className="link small" onClick={share} disabled={saving}><I name="users" size={18} /> {t('Partager ma maquette pour la faire valider')}</button>}
          <button className="link small" onClick={() => window.dispatchEvent(new Event('alwaan:chat'))}><I name="sparkles" size={18} /> {t('Une question ? Le conseiller vous répond')}</button>
        </div>
        <Perks items={[['eye', t('Imprimé comme la maquette')], ['lock', t('Paiement sécurisé')], ['redo', t('Défaut refait')], ['truck', t('Expédié en 7 jours ouvrés')], ['home', t('Imprimé dans le Nord')]]} />
      </div>
      {added && <SameLogo current={p.category} logo={cfg.logo} />}
      {toast && !justAdded && <div className="toast" role="status">{toast}</div>}
      {justAdded && (() => { const ct = cartTotals(lines); return (
        <div className="minicart" role="status">
          <button className="chat-x" aria-label={t('Fermer')} onClick={() => setJustAdded(false)}><I name="x" size={16} /></button>
          <b className="with-ic"><I name="check" size={18} strokeWidth={3} /> {toast}</b>
          <p className="muted small">{t('Panier : {n} pcs', { n: ct.pieces })} · <Price raw ht={ct.goods - ct.discount} /></p>
          {ct.remainingForFree > 0 && <p className="small">{t('Plus que {a} pour la livraison offerte', { a: `${Math.ceil(ct.remainingForFree)} € HT` })}</p>}
          <div className="ctas"><Link className="btn cta small" href={l('/panier')}>{t('Commander')}</Link><button className="btn line small" onClick={() => setJustAdded(false)}>{t('Continuer')}</button></div>
        </div>); })()}
    </div>
  );
}

/** Après l'ajout : proposer les autres types de vêtements avec le même logo, en un tap. */
function SameLogo({ current, logo }: { current: string; logo?: string }) {
  const { t, l, lang } = useT();
  const picks = CATEGORIES.filter((c) => c.slug !== current)
    .map((c) => PRODUCTS.find((x) => x.category === c.slug && x.bestseller) ?? PRODUCTS.find((x) => x.category === c.slug)!)
    .filter(Boolean);
  return (
    <section className="samelogo" aria-label={t('Même logo sur un autre vêtement ?')}>
      <div className="sec-head"><h2>{t('Même logo sur un autre vêtement ?')}</h2><Link className="btn cta small" href={l('/panier')}>{t('Voir le panier')}</Link></div>
      <p className="muted small">{t('Logo et emplacements repris : choisissez la couleur et les quantités.')}</p>
      <div className="samegrid">
        {picks.map((x) => (
          <Link key={x.slug} className="pcard" href={`${l(`/produits/${x.slug}`)}?meme-logo=1`}>
            <div className="img"><Garment slug={x.slug} color={defaultColor(x)} zones={[defaultZone(x)]} logo={logo} /></div>
            <strong>{categoryL(lang, CATEGORIES.find((c) => c.slug === x.category)!).name}</strong>
            <small>{productL(lang, x).name}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
