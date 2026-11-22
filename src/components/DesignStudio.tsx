'use client';
// Atelier particulier : un design prêt, le client écrit son texte, choisit vêtement, couleur, taille.
// Le design est rendu en PNG haute définition : c'est exactement le fichier imprimé (bon à tirer).
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getProduct, sizesFor } from '@/lib/catalog';
import { getDesign } from '@/lib/designs';
import { designDataUrl, designSvg, designValues, designZone } from '@/lib/designArt';
import { snapshot, uploadMockup } from '@/lib/mockup';
import { uploadFile } from '@/lib/cutout';
import { unitAt } from '@/lib/pricing';
import { colorName, productL } from '@/i18n';
import { useT } from '@/i18n/client';
import { useCart } from './CartProvider';
import { Garment } from './Garment';
import { Price } from './Price';
import { RetailMode } from './RetailMode';
import { I } from './Icons';

async function svgToPng(svg: string, size = 2000): Promise<Blob> {
  const img = new Image();
  await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; });
  const c = document.createElement('canvas'); c.width = c.height = size;
  c.getContext('2d')!.drawImage(img, 0, 0, size, size);
  return new Promise((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('PNG'))), 'image/png'));
}

export function DesignStudio({ id }: { id: string }) {
  const { t, l, lang } = useT();
  const d = getDesign(id)!;
  const { add } = useCart();
  const [vals, setVals] = useState<Record<string, string>>(() => designValues(d));
  // Les valeurs préremplies sont des exemples (A09) : le client doit les modifier ou confirmer qu'il les garde.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [keepEx, setKeepEx] = useState(false);
  const untouched = d.fields.filter((f) => !touched[f.key] && vals[f.key] === f.def);
  const [slug, setSlug] = useState(d.products[0]);
  const p = getProduct(slug)!;
  const [color, setColor] = useState(() => d.colors?.find((c) => p.colors.includes(c)) ?? p.colors[0]);
  useEffect(() => { if (!p.colors.includes(color)) setColor(d.colors?.find((c) => p.colors.includes(c)) ?? p.colors[0]); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const sizes = sizesFor(p);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [ok, setOk] = useState(false), [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [added, setAdded] = useState(false);
  const zone = designZone(p);
  const art = useMemo(() => designDataUrl(d, color, vals), [d, color, vals]);
  const shot = useRef<HTMLDivElement>(null);
  const pieces = Object.values(qty).reduce((a, b) => a + b, 0) || (sizes.length === 1 ? qty[sizes[0]] || 0 : 0);

  const submit = async () => {
    if (!pieces) { setMsg(t('Choisissez une taille.')); return; }
    if (d.fields.some((f) => !vals[f.key]?.trim())) { setMsg(t('Remplissez chaque champ du design.')); return; }
    if (untouched.length && !keepEx) { setMsg(t('Vérifiez {f} : ce sont des exemples. Modifiez-les, ou confirmez que vous les gardez.', { f: untouched.map((f) => `« ${f[lang]} »`).join(', ') })); return; }
    if (!ok) { setMsg(t('Cochez la validation de votre maquette.')); return; }
    setBusy(true); setMsg('');
    try {
      const png = await svgToPng(designSvg(d, color, vals));
      const up = await uploadFile(png, `design-${d.id}.png`);
      if (!up.id) throw new Error(up.error);
      const svgs = Array.from(shot.current?.querySelectorAll('svg') ?? []) as SVGSVGElement[];
      const mock = await snapshot(svgs, `${p.name} · ${colorName('fr', color)} · ${d.fr}`);
      const mockupId = await uploadMockup(mock);
      if (!mockupId) throw new Error();
      add({ slug, color, zones: [zone], qty: Object.fromEntries(Object.entries(qty).filter(([, n]) => n)), logo: art, logoId: up.id, logoStatus: 'uploaded', mockupId, approvedAt: new Date().toISOString(), design: d.id, designText: Object.values(vals).join(' · ') });
      setAdded(true); setQty({}); setOk(false);
    } catch { setMsg(t('Enregistrement de la maquette impossible. Réessayez.')); }
    setBusy(false);
  };

  return (
    <section className="wrap studio">
      <RetailMode />
      <div className="studio-grid">
        <div className="studio-vis">
          <Garment slug={slug} color={color} zones={[zone]} logo={art} />
          <div ref={shot} className="offscreen" aria-hidden="true"><Garment slug={slug} color={color} zones={[zone]} logo={art} /></div>
        </div>
        <div className="studio-form">
          <h1>{d[lang]}</h1>
          {d.fields.map((f) => (
            <label key={f.key} className="studio-field"><span>{f[lang]}</span>
              <input value={vals[f.key]} maxLength={f.max} onChange={(e) => { setVals({ ...vals, [f.key]: e.target.value }); setTouched({ ...touched, [f.key]: true }); setOk(false); }} />{!touched[f.key] && vals[f.key] === f.def && <small className="muted">{t('Exemple : remplacez par votre texte')}</small>}</label>
          ))}
          {untouched.length > 0 && <label className="consent small"><input type="checkbox" checked={keepEx} onChange={(e) => setKeepEx(e.target.checked)} /><span>{t('Je garde les valeurs d\'exemple')}</span></label>}
          <div className="lbl">{t('Vêtement')}</div>
          <div className="chips">{d.products.map((s) => <button key={s} className="chip" aria-pressed={s === slug} onClick={() => { setSlug(s); setQty({}); setOk(false); }}>{productL(lang, getProduct(s)!).name}</button>)}</div>
          <div className="lbl">{t('Couleur')} <span>{colorName(lang, color)}</span></div>
          <div className="swatches">{p.colors.map((c) => <button key={c} className="sw" style={{ background: c }} aria-label={colorName(lang, c)} aria-pressed={c === color} onClick={() => { setColor(c); setOk(false); }} />)}</div>
          <div className="lbl">{t('Tailles')}</div>
          <div className="sizes">{sizes.map((s) => (
            <div className="sz" key={s}><b>{s}</b><div className="ctr">
              <button aria-label={t('Retirer {s}', { s })} onClick={() => setQty({ ...qty, [s]: Math.max(0, (qty[s] || 0) - 1) })}>−</button>
              <output>{qty[s] || 0}</output>
              <button aria-label={t('Ajouter {s}', { s })} onClick={() => setQty({ ...qty, [s]: (qty[s] || 0) + 1 })}>+</button></div></div>
          ))}</div>
          <div className="addrow">
            <div className="tot"><Price ht={unitAt({ slug, zones: [zone], design: d.id }, Math.max(1, pieces))} /> <small className="muted">/ {t('pièce')}</small></div>
            <label className="consent bat"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>{t('Je valide ma maquette')} <b>{t('(bon à tirer)')}</b></span></label>
            <button className="btn cta" disabled={busy} onClick={submit}>{busy ? t('Enregistrement de la maquette…') : t('Ajouter au panier')}</button>
            {msg && <p className="err">{msg}</p>}
            {added && <p className="okline with-ic"><I name="check" size={16} /> {t('Ajouté au panier')} · <Link href={l('/panier')}>{t('Voir le panier')}</Link></p>}
          </div>
        </div>
      </div>
    </section>
  );
}
