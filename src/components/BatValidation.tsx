'use client';
// Page client : valider la maquette retouchée par notre graphiste, en un clic.
import { useEffect, useState } from 'react';
import { COLOR_NAMES, getProduct } from '@/lib/catalog';
import type { Rework } from '@/lib/reworkTypes';
import { I } from './Icons';

type View = Pick<Rework, 'id' | 'status' | 'items' | 'proof'> & { decision?: { at: string; ok: boolean; comment?: string } };

export function BatValidation({ id }: { id: string }) {
  const [r, setR] = useState<View | null>(null);
  const [err, setErr] = useState('');
  const [change, setChange] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => fetch(`/api/retouche/${id}`).then(async (res) => { const d = await res.json(); if (!res.ok) setErr(d.error); else setR(d); }).catch(() => setErr('Connexion impossible.'));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async (ok: boolean) => {
    setBusy(true); setErr('');
    const res = await fetch(`/api/retouche/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'decide', ok, comment }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) setErr(d.error || 'Erreur, réessayez.'); else await load();
    setBusy(false);
  };

  if (!r) return <section className="wrap bat-page"><p className="muted">{err || 'Chargement…'}</p></section>;
  const shown = r.proof?.mockups ?? [];
  return (
    <section className="wrap bat-page">
      {r.status === 'a_retoucher' && <><h1>Votre maquette arrive</h1><p className="muted">Notre graphiste retravaille votre logo.</p></>}
      {r.status === 'modif' && <><h1>C&apos;est noté</h1><p className="muted">Nouvelle maquette très vite.</p></>}
      {r.status === 'valide' && <><h1 className="with-ic"><I name="check" size={28} /> Maquette validée</h1><p className="muted">On lance l&apos;impression.</p></>}
      {r.status === 'envoye' && <h1>Votre maquette</h1>}

      {(r.status === 'envoye' || r.status === 'valide') && (
        <div className="bat-shots">{shown.map((m) => {
          const it = r.items.find((i) => i.slug === m.slug);
          return (
            <figure key={m.mockupId}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/logo/${m.mockupId}?apercu`} alt={`Maquette ${getProduct(m.slug)?.name}`} />
              <figcaption>{it?.pieces} × {getProduct(m.slug)?.name} · {it && COLOR_NAMES[it.color]}</figcaption>
            </figure>
          );
        })}</div>
      )}

      {r.status === 'envoye' && (
        <div className="bat-actions">
          {!change ? (<>
            <button className="btn cta" disabled={busy} onClick={() => decide(true)}><I name="check" size={16} /> Je valide</button>
            <button className="btn line" disabled={busy} onClick={() => setChange(true)}>Modifier</button>
            <small className="muted">Valider = bon à tirer : l&apos;impression reprend cette maquette.</small>
          </>) : (<>
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ce qu'il faut changer" aria-label="Ce qu'il faut changer" autoFocus />
            <button className="btn cta" disabled={busy || !comment.trim()} onClick={() => decide(false)}>Envoyer</button>
            <button className="link small" onClick={() => setChange(false)}>Annuler</button>
          </>)}
        </div>
      )}
      {err && <p className="warnline">{err}</p>}
    </section>
  );
}
