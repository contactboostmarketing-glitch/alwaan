'use client';
// Espace atelier : dossiers de retouche du logo. Protégé par la clé atelier (gardée dans ce navigateur).
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { COLOR_NAMES, getProduct, zonesFor } from '@/lib/catalog';
import { uploadFile } from '@/lib/cutout';
import { snapshot, toDataUrl, uploadMockup } from '@/lib/mockup';
import { STATUS_LABEL, type Rework } from '@/lib/reworkTypes';
import type { ProdOrder } from '@/lib/production';
import { Garment } from './Garment';

const KEY = 'alwaan-staff-key';
const readKey = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };

function useStaffKey() {
  const [key, setKey] = useState('');
  useEffect(() => setKey(readKey()), []);
  const save = (k: string) => { try { localStorage.setItem(KEY, k); } catch {} setKey(k); };
  return { key, save };
}

function KeyGate({ onKey, error }: { onKey: (k: string) => void; error?: string }) {
  const [v, setV] = useState('');
  return (
    <section className="wrap atelier"><h1>Espace atelier</h1>
      <div className="asst-say"><input type="password" value={v} onChange={(e) => setV(e.target.value)} placeholder="Clé atelier" aria-label="Clé atelier" /><button onClick={() => onKey(v.trim())}>Entrer</button></div>
      {error && <p className="warnline">{error}</p>}
    </section>
  );
}

const zonesText = (slug: string, zones: string[]) => { const p = getProduct(slug); return p ? zonesFor(p).filter((z) => zones.includes(z.id)).map((z) => z.name).join(' + ') : ''; };
const when = (s?: string) => (s ? new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '');

export function AtelierList() {
  const { key, save } = useStaffKey();
  const [items, setItems] = useState<Rework[] | null>(null);
  const [stats, setStats] = useState<{ pending: number; abandoned: { total: number; last30: number } } | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!key) return;
    fetch('/api/retouche', { headers: { 'x-staff-key': key } }).then(async (r) => {
      const d = await r.json(); if (!r.ok) { setErr(d.error); save(''); return; } setItems(d.items); setStats({ pending: d.pending, abandoned: d.abandoned }); if (d.ordersError) setErr(`Lecture des commandes Shopify impossible : ${d.ordersError}`);
    }).catch(() => setErr('Connexion impossible.'));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!key) return <KeyGate onKey={save} error={err} />;
  return (
    <section className="wrap atelier"><AtelierNav /><h1>Retouches de logo</h1>
      {stats && <p className="muted small">Commandes payées uniquement.{stats.pending ? ` ${stats.pending} paiement(s) en cours.` : ''} Paniers abandonnés avec retouche : {stats.abandoned.last30} sur 30 jours ({stats.abandoned.total} au total).</p>}
      {!items ? <p className="muted">Chargement…</p> : !items.length ? <p className="muted">Aucun dossier.</p> : (
        <div className="atl-list">{items.map((r) => (
          <Link key={r.id} href={`/atelier/retouche/${r.id}`} className="atl-row">
            <span className={`st st-${r.status}`}>{STATUS_LABEL[r.status]}</span>
            <b>{r.order?.name}</b>
            <span>{r.items.map((i) => `${i.pieces} × ${getProduct(i.slug)?.name}`).join(', ')}</span>
            <small className="muted">{when(r.createdAt)}</small>
          </Link>
        ))}</div>
      )}
      {err && <p className="warnline">{err}</p>}
    </section>
  );
}

export function AtelierRework({ id }: { id: string }) {
  const { key, save } = useStaffKey();
  const [r, setR] = useState<Rework | null>(null);
  const [err, setErr] = useState('');
  const [orig, setOrig] = useState<string>();
  const [logo, setLogo] = useState<{ id?: string; preview?: string; busy?: boolean }>({});
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const shots = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!key) return;
    fetch(`/api/retouche/${id}`, { headers: { 'x-staff-key': key } }).then(async (res) => {
      const d = await res.json(); if (!res.ok) { setErr(d.error); if (res.status === 401) save(''); return; } setR(d);
      const lid = d.items[0]?.logoId; if (lid) setOrig(await toDataUrl(`/api/logo/${lid}?apercu`));
    }).catch(() => setErr('Connexion impossible.'));
  }, [key, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!key) return <KeyGate onKey={save} error={err} />;
  if (!r) return <section className="wrap atelier"><p className="muted">{err || 'Chargement…'}</p></section>;

  const link = typeof window !== 'undefined' ? `${window.location.origin}/bat/${r.id}` : `/bat/${r.id}`;
  const onFile = async (f?: File) => {
    if (!f || !f.type.startsWith('image/')) return;
    setLogo({ busy: true });
    const preview = await new Promise<string>((ok) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result)); fr.readAsDataURL(f); });
    const up = await uploadFile(f, f.name);
    setLogo({ id: up.id, preview, busy: false });
    if (up.error) setErr(up.error);
  };
  const send = async () => {
    if (!logo.id || !shots.current) return;
    setSending(true); setErr('');
    try {
      const mockups = [];
      for (const it of r.items) {
        const svgs = Array.from(shots.current.querySelectorAll(`[data-slug="${it.slug}"] svg`)) as SVGSVGElement[];
        const p = getProduct(it.slug)!;
        const png = await snapshot(svgs, `${p.name} · ${COLOR_NAMES[it.color]} · ${zonesText(it.slug, it.zones)} · logo retouché`);
        const mid = await uploadMockup(png);
        if (!mid) throw new Error('Envoi de la maquette impossible.');
        mockups.push({ slug: it.slug, mockupId: mid });
      }
      const res = await fetch(`/api/retouche/${r.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-key': key }, body: JSON.stringify({ action: 'proof', logoId: logo.id, mockups }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error); setR(d);
    } catch (e) { setErr((e as Error).message || 'Erreur'); }
    setSending(false);
  };
  const mail = `mailto:${r.order?.email ? encodeURIComponent(r.order.email) : ''}?subject=${encodeURIComponent('Votre maquette alwaan à valider')}&body=${encodeURIComponent(`Bonjour,\n\nNotre graphiste a retravaillé votre logo. Validez votre maquette en un clic :\n${link}\n\nL'impression démarre dès votre validation.\n\nL'équipe alwaan`)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`Votre maquette alwaan est prête, validez-la ici : ${link}`)}`;

  return (
    <section className="wrap atelier">
      <p><Link className="link small" href="/atelier">← Tous les dossiers</Link></p>
      <h1>Retouche du logo <span className={`st st-${r.status}`}>{STATUS_LABEL[r.status]}</span></h1>
      <p className="muted">{r.order ? <>Commande <b>{r.order.name}</b>{r.order.email ? ` · ${r.order.email}` : ''}{r.order.cancelled ? ' · ANNULÉE' : ''}</> : 'Pas encore de commande payée : ne rien imprimer.'}</p>
      {r.decision && !r.decision.ok && <p className="warnline"><b>Demande du client :</b> {r.decision.comment}</p>}
      {r.status === 'valide' && <p className="okline">✓ Validé par le client le {when(r.decision?.at)} : à imprimer.</p>}

      <h2>1. Logo du client</h2>
      <div className="atl-files">
        {r.items[0]?.logoSourceId && <a className="btn line small" href={`/api/logo/${r.items[0].logoSourceId}`}>Fichier d&apos;origine</a>}
        {r.items[0]?.logoId && <a className="btn line small" href={`/api/logo/${r.items[0].logoId}`}>Fichier détouré</a>}
      </div>
      <div className="atl-items">{r.items.map((it) => (
        <figure key={it.slug}><Garment slug={it.slug} color={it.color} zones={it.zones} logo={orig} text={it.text} />
          <figcaption><b>{it.pieces} × {getProduct(it.slug)?.name}</b><small>{COLOR_NAMES[it.color]} · {zonesText(it.slug, it.zones)}</small></figcaption></figure>
      ))}</div>

      {r.status !== 'valide' && (<>
        <h2>2. Logo retravaillé</h2>
        <label className="asst-drop"><span className="ic">+</span><strong>{logo.busy ? 'Envoi…' : logo.id ? 'Logo retravaillé reçu · remplacer' : 'Déposer le logo retravaillé (PNG transparent ou SVG)'}</strong>
          <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
        {logo.preview && (<>
          <div ref={shots} className="atl-items">{r.items.map((it) => {
            const back = zonesFor(getProduct(it.slug)!).some((z) => z.view === 'back' && it.zones.includes(z.id));
            const front = zonesFor(getProduct(it.slug)!).some((z) => z.view === 'front' && it.zones.includes(z.id));
            return (
              <figure key={it.slug} data-slug={it.slug} className={front && back ? 'two' : ''}>
                {front && <Garment slug={it.slug} color={it.color} view="front" zones={it.zones} logo={logo.preview} text={it.text} />}
                {back && <Garment slug={it.slug} color={it.color} view="back" zones={it.zones} logo={logo.preview} text={it.text} />}
                <figcaption><b>{getProduct(it.slug)?.name}</b></figcaption>
              </figure>
            );
          })}</div>
          <button className="btn cta" disabled={sending || !logo.id} onClick={send}>{sending ? 'Création des maquettes…' : 'Créer la maquette pour le client'}</button>
        </>)}
      </>)}

      {r.proof && (<>
        <h2>3. Envoyer au client</h2>
        <div className="asst-say"><input readOnly value={link} aria-label="Lien de validation" onFocus={(e) => e.target.select()} />
          <button onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? 'Copié ✓' : 'Copier'}</button></div>
        <div className="atl-files"><a className="btn line small" href={mail}>Email</a><a className="btn line small" href={wa} target="_blank" rel="noopener">WhatsApp</a><a className="btn line small" href={link} target="_blank">Voir la page client</a></div>
      </>)}

      {err && <p className="warnline">{err}</p>}
      <h2>Historique</h2>
      <ul className="atl-hist">{r.history.map((h, i) => <li key={i}><small className="muted">{when(h.at)}</small> {h.event}{h.detail ? ` : « ${h.detail} »` : ''}</li>)}</ul>
    </section>
  );
}

function AtelierNav() {
  return <nav className="atl-nav no-print"><Link href="/atelier/production">Production</Link><Link href="/atelier">Retouches</Link></nav>;
}

const day = (s: string) => new Date(s).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

/** Tableau de production : à imprimer chaque matin ou à garder ouvert sur une tablette. */
export function AtelierProduction() {
  const { key, save } = useStaffKey();
  const [orders, setOrders] = useState<ProdOrder[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!key) return;
    fetch('/api/atelier/production', { headers: { 'x-staff-key': key } }).then(async (r) => {
      const d = await r.json(); if (r.status === 401) { setErr(d.error); save(''); return; } if (!r.ok) { setErr(d.error); return; } setOrders(d.orders);
    }).catch(() => setErr('Connexion impossible.'));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!key) return <KeyGate onKey={save} error={err} />;
  if (!orders) return <section className="wrap atelier"><AtelierNav /><p className={err ? 'warnline' : 'muted'}>{err || 'Chargement…'}</p></section>;
  const ready = orders.filter((o) => !o.blocked);
  // Transferts DTF à préparer, par emplacement (commandes prêtes).
  const transfers = new Map<string, number>();
  for (const o of ready) for (const g of o.groups) for (const z of g.zones.split(' + ').filter(Boolean)) transfers.set(z, (transfers.get(z) || 0) + g.pieces);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section className="wrap atelier prod">
      <AtelierNav />
      <div className="sec-head"><h1>Production</h1><button className="btn line small no-print" onClick={() => window.print()}>Imprimer</button></div>
      <div className="prod-kpi">
        <div><b>{ready.length}</b><small>commandes prêtes</small></div>
        <div><b>{ready.reduce((a, o) => a + o.pieces, 0)}</b><small>pièces</small></div>
        <div><b>{orders.length - ready.length}</b><small>en attente BAT</small></div>
      </div>
      {transfers.size > 0 && <p className="small"><b>Transferts DTF :</b> {[...transfers].map(([z, n]) => `${z} × ${n}`).join(' · ')}</p>}
      {!orders.length && <p className="muted">Aucune commande à produire.</p>}
      {orders.map((o) => {
        const late = o.due.slice(0, 10) < today;
        return (
          <article key={o.id} className={`prod-card ${o.blocked ? 'blocked' : ''}`}>
            <header>
              <b>{o.name}</b>
              <span className={`st ${o.blocked ? 'st-modif' : late ? 'st-modif' : 'st-valide'}`}>{o.blocked ? 'Attente BAT client' : late ? `En retard · ${day(o.due)}` : `À expédier le ${day(o.due)}`}</span>
              <small className="muted">{o.pieces} pcs · payé le {day(o.createdAt)}</small>
            </header>
            {o.note && <p className="small muted">{o.note}</p>}
            {o.groups.map((g, i) => (
              <div key={i} className="prod-group">
                <div><b>{g.label}</b> <small className="muted">{g.zones}{g.text ? ` · texte « ${g.text} »` : ''}</small></div>
                <div className="prod-sizes">{g.sizes.map((s, j) => <span key={j}>{s.variant} <b>×{s.qty}</b></span>)}</div>
                <div className="atl-files no-print">
                  {g.bat && <a className="btn line small" href={g.bat} target="_blank" rel="noopener">BAT</a>}
                  {g.logo && <a className="btn line small" href={g.logo}>Fichier à imprimer</a>}
                  {g.source && <a className="btn line small" href={g.source}>Original</a>}
                  {g.rework && <Link className="btn line small" href="/atelier">Dossier retouche</Link>}
                </div>
              </div>
            ))}
          </article>
        );
      })}
    </section>
  );
}
