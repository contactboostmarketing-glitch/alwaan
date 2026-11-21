'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useT } from '@/i18n/client';

export function QuoteForm() {
  const { t } = useT();
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/devis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => null);
    setState(r?.ok ? 'ok' : 'error');
  };
  if (state === 'ok') return <p className="nudge ok mt">{t('Demande envoyée. Nous vous répondons sous 24 h ouvrées.')}</p>;
  return (
    <form className="form" onSubmit={onSubmit}>
      <input type="text" name="company" placeholder={t('Société ou association')} aria-label={t('Société')} required />
      <input type="text" name="name" placeholder={t('Prénom et nom')} aria-label={t('Nom')} autoComplete="name" required />
      <input type="email" name="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
      <input type="tel" name="phone" placeholder={t('Téléphone')} aria-label={t('Téléphone')} autoComplete="tel" />
      <textarea name="need" placeholder={t('Ex : 40 polos + 40 tabliers avec logo cœur, pour le 15 mars')} aria-label={t('Votre besoin')} required />
      <label className="consent"><input type="checkbox" name="rgpd" required /><span>{t('J\'accepte que mes données soient utilisées pour traiter ma demande')} (<Link href="/confidentialite">{t('politique de confidentialité')}</Link>).</span></label>
      <button className="btn cta" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t('Envoi…') : t('Envoyer ma demande')}</button>
      {state === 'error' && <p className="err" role="alert">{t('L\'envoi a échoué. Réessayez ou écrivez-nous directement.')}</p>}
    </form>
  );
}
