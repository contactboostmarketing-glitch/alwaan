'use client';
import Link from 'next/link';
import { useState } from 'react';

export function QuoteForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/devis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => null);
    setState(r?.ok ? 'ok' : 'error');
  };
  if (state === 'ok') return <p className="nudge ok mt">Demande envoyée. Nous vous répondons sous 2 h ouvrées.</p>;
  return (
    <form className="form" onSubmit={onSubmit}>
      <input type="text" name="company" placeholder="Société ou association" aria-label="Société" required />
      <input type="text" name="name" placeholder="Prénom et nom" aria-label="Nom" autoComplete="name" required />
      <input type="email" name="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
      <input type="tel" name="phone" placeholder="Téléphone" aria-label="Téléphone" autoComplete="tel" />
      <textarea name="need" placeholder="Ex : 40 polos + 40 tabliers avec logo cœur, pour le 15 mars" aria-label="Votre besoin" required />
      <label className="consent"><input type="checkbox" name="rgpd" required /><span>J&apos;accepte que mes données soient utilisées pour traiter ma demande (<Link href="/confidentialite">politique de confidentialité</Link>).</span></label>
      <button className="btn cta" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Envoi…' : 'Envoyer ma demande'}</button>
      {state === 'error' && <p className="err" role="alert">L&apos;envoi a échoué. Réessayez ou écrivez-nous directement.</p>}
    </form>
  );
}
