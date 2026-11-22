'use client';
// Première visite : -10 % contre l'email, proposé une seule fois, discrètement (après 25 s ou en milieu de page).
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/client';
import { I } from './Icons';

const KEY = 'alwaan-signup';
const HIDE = /^\/(en\/)?(panier|cart|compte|account|atelier|avis|recommander|devis|quote|equipe|team|boutique|shop|produits|products|assistant|lien-equipe|team-link|(idees-cadeaux|gift-ideas)\/creer)/;

export function SignupNudge() {
  const path = usePathname();
  const { t } = useT();
  const [show, setShow] = useState(false), [email, setEmail] = useState(''), [state, setState] = useState<'' | 'busy' | 'ok'>(''), [err, setErr] = useState('');
  useEffect(() => {
    if (HIDE.test(path)) return;
    try { const v = localStorage.getItem(KEY); if (v && Date.now() - Number(v) < 30 * 864e5) return; } catch { return; }
    let enabled = false;
    // Offre affichée seulement si le code peut être envoyé par email.
    fetch('/api/inscription').then((r) => r.json()).then((d) => { enabled = !!d.enabled; }).catch(() => {});
    const open = () => { if (enabled && !document.querySelector('.cookie')) setShow(true); };
    const timer = setTimeout(open, 25000);
    const onScroll = () => { if (window.scrollY > document.body.scrollHeight * 0.45) open(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [path]);
  if (!show || HIDE.test(path)) return null;
  const close = () => { setShow(false); try { localStorage.setItem(KEY, String(Date.now())); } catch {} };
  const send = async () => {
    setState('busy'); setErr('');
    const r = await fetch('/api/inscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok) { setState(''); setErr(t(d.error || 'Envoi impossible.')); return; }
    setState('ok'); try { localStorage.setItem(KEY, String(Date.now() + 3650 * 864e5)); } catch {}
  };
  return (
    <aside className="signup" role="dialog" aria-label={t('-10 % sur votre 1re commande')}>
      <button className="chat-x" aria-label={t('Fermer')} onClick={close}><I name="x" size={16} /></button>
      {state === 'ok' ? (
        <><b>{t('Code envoyé par email')}</b><p className="muted small">{t('Votre code -10 % personnel vient de partir : pensez à vérifier les indésirables. Valable 30 jours.')}</p></>
      ) : (<>
        <b className="with-ic"><I name="gift" size={18} /> {t('-10 % sur votre 1re commande')}</b>
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('Votre email')} aria-label={t('Votre email')} />
          <button className="btn cta small" disabled={state === 'busy'}>{t('Recevoir')}</button>
        </form>
        {err && <p className="err small">{err}</p>}
        <p className="muted tiny">{t('En vous inscrivant, vous acceptez de recevoir nos offres. Désinscription en 1 clic.')}</p>
      </>)}
    </aside>
  );
}
