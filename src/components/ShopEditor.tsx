'use client';
// Création d'une boutique club / entreprise : nom, logo, articles (couleur et emplacement), maquettes générées.
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, PRODUCTS, defaultColor, defaultZone, getProduct, zonesFor } from '@/lib/catalog';
import { snapshot, uploadMockup } from '@/lib/mockup';
import { colorName, productL } from '@/i18n';
import { useT } from '@/i18n/client';
import { Garment } from './Garment';
import { CutoutChoice, useLogo } from './LogoCutout';
import { I } from './Icons';

type Item = { slug: string; color: string; back: boolean };

export function ShopEditor() {
  const { t, l, lang } = useT();
  const router = useRouter();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [name, setName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const { logo, pick, choose } = useLogo();
  const shots = useRef<HTMLDivElement>(null);
  useEffect(() => { fetch('/api/compte/statut').then((r) => r.json()).then((d) => setConnected(!!d.connected)).catch(() => setConnected(false)); }, []);

  if (connected === null) return <section className="wrap acct"><p className="muted">{t('Chargement…')}</p></section>;
  if (!connected) return <section className="wrap acct narrow"><h1>{t('Créer une boutique')}</h1><p className="muted">{t('Connectez-vous pour créer la boutique de votre club ou de votre entreprise.')}</p><a className="btn cta block" href={`/api/compte/login?lang=${lang}`}>{t('Se connecter')}</a></section>;

  const zonesOf = (it: Item) => { const p = getProduct(it.slug)!; const z = [defaultZone(p)]; if (it.back && zonesFor(p).some((x) => x.id === 'back')) z.push('back'); return z; };
  const toggle = (slug: string) => setItems((x) => x.some((i) => i.slug === slug) ? x.filter((i) => i.slug !== slug) : [...x, { slug, color: defaultColor(getProduct(slug)!), back: false }]);
  const update = (slug: string, patch: Partial<Item>) => setItems((x) => x.map((i) => (i.slug === slug ? { ...i, ...patch } : i)));
  const save = async () => {
    if (!logo?.id || logo.busy) { setMsg(t('Ajoutez votre logo.')); return; }
    if (logo.hasBg && !logo.decided) { setMsg(t('Votre logo a un fond : choisissez avec ou sans fond.')); return; }
    setBusy(true); setMsg('');
    const out = [];
    for (const it of items) {
      const svgs = Array.from(shots.current?.querySelectorAll(`[data-slug="${it.slug}"] svg`) ?? []) as SVGSVGElement[];
      const png = await snapshot(svgs, `${name} · ${getProduct(it.slug)!.name}`).catch(() => null);
      const mockupId = png ? await uploadMockup(png) : null;
      if (!mockupId) { setBusy(false); setMsg(t('Enregistrement de la maquette impossible. Réessayez.')); return; }
      out.push({ slug: it.slug, color: it.color, zones: zonesOf(it), mockupId });
    }
    const r = await fetch('/api/boutique', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, logoId: logo.id, items: out }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg(t(d.error || 'Envoi impossible.')); return; }
    router.push(`${l(`/boutique/${d.slug}`)}?nouvelle=1`);
  };

  return (
    <section className="wrap acct">
      <h1>{t('Créer une boutique')}</h1>
      <p className="muted small">{t('Vos membres commandent et paient eux-mêmes. Vous recevez 10 % des ventes en bons d\'achat.')}</p>
      <input className="team-title" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Nom du club ou de l\'entreprise')} aria-label={t('Nom du club ou de l\'entreprise')} maxLength={60} />
      <label className="asst-drop small-drop"><strong>{logo?.busy ? t('Préparation du logo…') : logo?.id ? logo.name : t('Envoyer mon logo')}</strong>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} /></label>
      <CutoutChoice logo={logo} choose={choose} />

      <h2>{t('Articles de la boutique')}</h2>
      <div className="zones">{PRODUCTS.map((p) => { const on = items.some((i) => i.slug === p.slug); return (
        <button key={p.slug} className="ztile" aria-pressed={on} onClick={() => toggle(p.slug)}>{on && <span className="tick"><I name="check" size={12} strokeWidth={3} /></span>}
          <Garment slug={p.slug} color={defaultColor(p)} zones={[defaultZone(p)]} logo={logo?.preview} /><b>{productL(lang, p).name}</b><small>{CATEGORIES.find((c) => c.slug === p.category)?.name}</small></button>
      ); })}</div>

      {items.map((it) => { const p = getProduct(it.slug)!; return (
        <div key={it.slug} className="acct-card">
          <header><b>{productL(lang, p).name}</b></header>
          <div className="swatches">{p.colors.map((c) => <button key={c} className="sw" style={{ background: c }} aria-label={colorName(lang, c)} aria-pressed={c === it.color} onClick={() => update(it.slug, { color: c })} />)}</div>
          {zonesFor(p).some((z) => z.id === 'back') && <label className="consent"><input type="checkbox" checked={it.back} onChange={(e) => update(it.slug, { back: e.target.checked })} /><span>{t('+ Logo au dos')}</span></label>}
        </div>
      ); })}

      <div ref={shots} className="offscreen" aria-hidden="true">{items.map((it) => (
        <div key={it.slug} data-slug={it.slug}>
          <Garment slug={it.slug} color={it.color} view="front" zones={zonesOf(it)} logo={logo?.preview} />
          {zonesOf(it).includes('back') && <Garment slug={it.slug} color={it.color} view="back" zones={zonesOf(it)} logo={logo?.preview} />}
        </div>
      ))}</div>

      <div className="bat-actions">
        <button className="btn cta" disabled={busy || !name.trim() || !items.length || !logo?.id} onClick={save}>{busy ? t('Création des maquettes…') : t('Créer ma boutique')}</button>
        {msg && <p className="err">{msg}</p>}
      </div>
    </section>
  );
}
