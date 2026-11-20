'use client';
// Liste d'équipe : chaque personne donne nom, prénom et taille ; l'acheteur suit les réponses et met au panier.
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAME_FEE, NAMES_MIN, getProduct } from '@/lib/catalog';
import { toDataUrl } from '@/lib/mockup';
import type { LineConfig } from '@/lib/pricing';
import { productL } from '@/i18n';
import { useT } from '@/i18n/client';
import { useCart } from './CartProvider';
import { Price } from './Price';

type Member = { id: string; first: string; last: string; sizes: Record<string, string> };
type TLine = Omit<LineConfig, 'qty'> & { sizes: string[] };
type View = { id: string; title: string; lines: TLine[]; closed: boolean; count: number; admin?: boolean; members?: Member[] };

export function TeamView({ id }: { id: string }) {
  const { t, l, lang } = useT();
  const cle = useSearchParams().get('cle') || '';
  const router = useRouter();
  const { add } = useCart();
  const [v, setV] = useState<View | null>(null);
  const [err, setErr] = useState('');
  const [f, setF] = useState<{ first: string; last: string; sizes: Record<string, string> }>({ first: '', last: '', sizes: {} });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [printNames, setPrintNames] = useState(false);
  const [copied, setCopied] = useState(false);
  const load = () => fetch(`/api/equipe/${id}${cle ? `?cle=${cle}` : ''}`).then(async (r) => { const d = await r.json(); if (!r.ok) setErr(d.error); else setV(d); }).catch(() => setErr(t('Connexion impossible. Réessayez.')));
  useEffect(() => { load(); }, [id, cle]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!v) return <section className="wrap bat-page"><p className="muted">{err || t('Chargement…')}</p></section>;
  const pn = (slug: string) => productL(lang, getProduct(slug)!).name;
  const shotOf = (ln: TLine, cls = 'team-shot') => ln.mockupId && <img className={cls} src={`/api/logo/${ln.mockupId}?apercu`} alt={pn(ln.slug)} />; // eslint-disable-line @next/next/no-img-element
  const complete = v.lines.every((ln) => f.sizes[ln.slug]);

  if (!v.admin) {
    const submit = async () => {
      setBusy(true); setErr('');
      const r = await fetch(`/api/equipe/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) { setErr(t(d.error || 'Envoi impossible.')); return; }
      setSent(true);
    };
    return (
      <section className="wrap bat-page narrow">
        <h1>{v.title || t('Votre tenue')}</h1>
        {v.closed ? <p className="nudge">{t('La liste est close.')}</p> : sent ? (<>
          <p className="okline">✓ {t('Merci {n}, c\'est noté !', { n: f.first })}</p>
          <button className="link" onClick={() => { setF({ first: '', last: '', sizes: {} }); setSent(false); }}>{t('Ajouter une autre personne')}</button>
        </>) : (
          <div className="quote-box">
            <input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} placeholder={t('Prénom')} aria-label={t('Prénom')} autoComplete="given-name" />
            <input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} placeholder={t('Nom')} aria-label={t('Nom')} autoComplete="family-name" />
            {v.lines.map((ln) => (
              <div key={ln.slug} className="team-item">
                {shotOf(ln, 'team-thumb')}
                <div><b>{pn(ln.slug)}</b><div className="lbl">{t('Votre taille')}</div>
                  <div className="chips">{ln.sizes.map((s) => <button key={s} className="chip" aria-pressed={f.sizes[ln.slug] === s} onClick={() => setF({ ...f, sizes: { ...f.sizes, [ln.slug]: s } })}>{s}</button>)}</div></div>
              </div>
            ))}
            <button className="btn cta" disabled={busy || !f.first.trim() || !f.last.trim() || !complete} onClick={submit}>{t('Envoyer')}</button>
            {err && <p className="err">{err}</p>}
          </div>
        )}
      </section>
    );
  }

  const members = v.members || [];
  const link = typeof window !== 'undefined' ? `${window.location.origin}${l(`/equipe/${id}`)}` : '';
  const bySize = (ln: TLine) => Object.fromEntries(ln.sizes.map((s) => [s, members.filter((m) => m.sizes[ln.slug] === s).length]));
  const total = members.length;
  const canNames = total > NAMES_MIN;
  const act = async (body: Record<string, unknown>) => { await fetch(`/api/equipe/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cle, ...body }) }); load(); };
  const toCart = async () => {
    setBusy(true);
    const logoId = v.lines[0].logoId;
    const logo = logoId ? await toDataUrl(`/api/logo/${logoId}?apercu`) : undefined;
    for (const ln of v.lines) {
      const { sizes, ...line } = ln; void sizes;
      add({ ...line, logo, qty: Object.fromEntries(Object.entries(bySize(ln)).filter(([, n]) => n)), teamId: id, printNames: canNames && printNames } as LineConfig);
    }
    router.push(l('/panier'));
  };
  const msg = encodeURIComponent(t('Donne ta taille pour ta tenue : {u}', { u: link }));
  return (
    <section className="wrap bat-page">
      <h1>{t('Liste d\'équipe')}</h1>
      <p className="muted">{t('Partagez ce lien : chacun donne son nom, son prénom et sa taille.')}</p>
      <input className="team-title" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} onBlur={() => act({ title: v.title })} placeholder={t('Nom de l\'équipe (facultatif)')} aria-label={t('Nom de l\'équipe (facultatif)')} />
      <div className="asst-say"><input readOnly value={link} onFocus={(e) => e.target.select()} aria-label={t('Lien à partager')} />
        <button onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✓' : t('Copier')}</button></div>
      <div className="atl-files"><a className="btn line small" href={`https://wa.me/?text=${msg}`} target="_blank" rel="noopener">WhatsApp</a><a className="btn line small" href={`mailto:?subject=${encodeURIComponent(t('Ta taille pour la tenue'))}&body=${msg}`}>Email</a></div>
      <p className="warnline small">{t('Gardez cette page : elle seule permet de voir les réponses.')}</p>

      <p><b>{t('{n} personnes', { n: total })}</b></p>
      {v.lines.map((ln) => { const c = bySize(ln); return (
        <div key={ln.slug} className="team-head">{shotOf(ln)}<div><b>{pn(ln.slug)}</b><div className="prod-sizes">{ln.sizes.map((s) => <span key={s}>{s} <b>×{c[s]}</b></span>)}</div></div></div>
      ); })}
      <ul className="team-list">{members.map((m) => <li key={m.id}><span>{m.first} {m.last}</span><b>{v.lines.map((ln) => m.sizes[ln.slug]).join(' · ')}</b><button className="link mutedl small" onClick={() => act({ remove: m.id })}>{t('Retirer')}</button></li>)}</ul>

      {canNames ? (
        <label className={`express ${printNames ? 'on' : ''}`}><input type="checkbox" checked={printNames} onChange={(e) => setPrintNames(e.target.checked)} />
          <span><b>{t('Prénom imprimé sur chaque pièce')}</b><small>{t('Sous le logo, au nom de chaque personne')}</small></span><b className="express-fee">+<Price ht={NAME_FEE} />/pc</b></label>
      ) : <p className="muted small">{t('Prénom imprimé possible au-delà de {n} pièces.', { n: NAMES_MIN })}</p>}

      <div className="bat-actions">
        <button className="btn cta" disabled={!total || busy} onClick={toCart}>{t('Mettre {n} pièces au panier', { n: total * v.lines.length })}</button>
        <button className="link small" onClick={() => act({ closed: !v.closed })}>{v.closed ? t('Rouvrir la liste') : t('Clore la liste')}</button>
      </div>
    </section>
  );
}
