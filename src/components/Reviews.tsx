'use client';
// Formulaire d'avis (lien reçu par email) : note en un tap, quelques mots, photo facultative.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { uploadFile } from '@/lib/cutout';
import { I } from './Icons';

export function ReviewForm({ order, sig }: { order: string; sig: string }) {
  const [info, setInfo] = useState<{ name: string; done: boolean; products: { slug: string; name: string }[] } | null>(null);
  const [err, setErr] = useState('');
  const [rating, setRating] = useState(0), [text, setText] = useState(''), [name, setName] = useState(''), [company, setCompany] = useState(''), [city, setCity] = useState('');
  const [photo, setPhoto] = useState<{ id?: string; url?: string; busy?: boolean }>({}), [gallery, setGallery] = useState(true);
  const [busy, setBusy] = useState(false), [code, setCode] = useState(''), [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch(`/api/avis?o=${encodeURIComponent(order)}&sig=${encodeURIComponent(sig)}`).then(async (r) => { const d = await r.json(); if (!r.ok) setErr(d.error); else setInfo(d); }).catch(() => setErr('Connexion impossible.'));
  }, [order, sig]);

  if (code) return (
    <section className="wrap narrow review-page review-done">
      <span className="empty-ic"><I name="heart" size={32} /></span>
      <h1>Merci !</h1>
      <p className="muted">Votre avis sera publié après relecture. Voici votre remise de -10 % sur la prochaine commande, valable 3 mois :</p>
      <button className="review-code" onClick={() => { navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => {}); }}>{code} <small>{copied ? 'Copié' : 'Copier'}</small></button>
      <p className="muted small">Nous vous l&apos;avons aussi envoyé par email.</p>
      <Link className="btn cta" href="/">Retour sur alwaan</Link>
    </section>
  );
  if (!info) return <section className="wrap narrow review-page"><p className="muted">{err || 'Chargement…'}</p></section>;
  if (info.done) return <section className="wrap narrow review-page"><h1>Merci !</h1><p className="muted">Vous avez déjà donné votre avis sur la commande {info.name}.</p></section>;

  const send = async () => {
    setBusy(true); setErr('');
    const r = await fetch('/api/avis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ o: order, sig, rating, text, name, company, city, photoId: photo.id, gallery: gallery && !!photo.id }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r?.ok) { setErr(d.error || 'Envoi impossible.'); return; }
    setCode(d.code);
  };
  return (
    <section className="wrap narrow review-page">
      <p className="season-kicker"><I name="gift" size={16} /> -10 % sur votre prochaine commande</p>
      <h1>Votre avis sur la commande {info.name}</h1>
      {info.products.length > 0 && <p className="muted">{info.products.map((p) => p.name).join(', ')}</p>}
      <div className="stars-pick" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} sur 5`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}><Star /></button>)}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={1200} placeholder="Qualité du vêtement, de l'impression, délai, accueil de l'équipe…" aria-label="Votre avis" />
      <div className="prof-row">
        <label className="prof-field"><span>Prénom (affiché)</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} /></label>
        <label className="prof-field"><span>Ville</span><input value={city} onChange={(e) => setCity(e.target.value)} maxLength={40} /></label>
      </div>
      <label className="prof-field"><span>Entreprise, club ou association (facultatif)</span><input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={60} /></label>
      <label className="asst-drop small-drop review-photo">
        {photo.url ? <img src={photo.url} alt="" /> : <I name="camera" size={26} />}
        <strong>{photo.busy ? 'Envoi…' : photo.id ? 'Photo ajoutée · changer' : 'Ajouter une photo de vos tenues (facultatif)'}</strong>
        <input type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setPhoto({ busy: true, url: URL.createObjectURL(f) });
          const u = await uploadFile(f, f.name);
          setPhoto(u.id ? { id: u.id, url: URL.createObjectURL(f) } : {}); if (u.error) setErr(u.error);
        }} />
      </label>
      {photo.id && <label className="prof-check"><input type="checkbox" checked={gallery} onChange={(e) => setGallery(e.target.checked)} /> J&apos;accepte que cette photo soit publiée dans les réalisations alwaan</label>}
      {err && <p className="err">{err}</p>}
      <button className="btn cta block" disabled={busy || !rating || text.trim().length < 5 || photo.busy} onClick={send}>{busy ? 'Envoi…' : 'Envoyer mon avis et recevoir -10 %'}</button>
      <p className="muted small">Avis vérifié : seuls les clients ayant commandé peuvent en laisser un. Le code est offert pour tout avis, positif ou négatif. Les avis sont relus avant publication (pas de propos injurieux ni de données personnelles).</p>
    </section>
  );
}

export const Star = ({ size = 30 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" fill="currentColor" /></svg>;
