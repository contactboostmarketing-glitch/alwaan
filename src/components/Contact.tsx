'use client';
// Conseiller en ligne : une IA répond tout de suite ; si elle ne résout pas, l'équipe prend le relais sur WhatsApp
// (NEXT_PUBLIC_WHATSAPP, 33608897282 par défaut), avec le résumé de la conversation déjà écrit.
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/client';
import { I } from './Icons';

const WA = process.env.NEXT_PUBLIC_WHATSAPP || '33608897282';
export const PHONE = process.env.NEXT_PUBLIC_PHONE || '+33 6 08 89 72 82';
type Msg = { role: 'user' | 'assistant'; content: string };

export function ContactFloat() {
  const path = usePathname();
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState(''), [busy, setBusy] = useState(false), [handoff, setHandoff] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { list.current?.scrollTo(0, list.current.scrollHeight); }, [msgs, busy]);
  // Ouverture depuis un bouton de la page (ex. fiche produit mobile, où la bulle flottante est masquée).
  useEffect(() => { const o = () => setOpen(true); window.addEventListener('alwaan:chat', o); return () => window.removeEventListener('alwaan:chat', o); }, []);
  if (path.startsWith('/atelier')) return null;

  const userCount = msgs.filter((m) => m.role === 'user').length;
  const waText = encodeURIComponent([
    lang === 'en' ? 'Hello, I need help.' : 'Bonjour, j\'ai besoin d\'aide.',
    ...msgs.filter((m) => m.role === 'user').slice(-3).map((m) => `• ${m.content}`),
    `(${typeof window !== 'undefined' ? window.location.href : `https://alwaan.fr${path}`})`,
  ].join('\n'));
  const send = async (q: string) => {
    const content = q.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content }];
    setMsgs(next); setText(''); setBusy(true);
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next, page: path }) }).catch(() => null);
    const d = r ? await r.json().catch(() => null) : null;
    setBusy(false);
    setMsgs([...next, { role: 'assistant', content: d?.text || d?.error || t('Connexion impossible. Écrivez-nous sur WhatsApp.') }]);
    if (!d?.text || d?.handoff) setHandoff(true);
  };
  const quick = [t('Quels délais ?'), t('Prix pour 20 polos avec logo ?'), t('Vendez-vous du textile vierge ?')];

  return (
    <>
      {open && (
        <div className="chat" role="dialog" aria-label={t('Conseiller alwaan')}>
          <header>
            <span className="chat-ava"><I name="sparkles" size={18} /></span>
            <div><b>{t('Une question ?')}</b><small>{t('Réponse immédiate · l\'équipe prend le relais si besoin')}</small></div>
            <button className="chat-x" aria-label={t('Fermer')} onClick={() => setOpen(false)}><I name="x" size={18} /></button>
          </header>
          <div className="chat-list" ref={list}>
            <p className="chat-msg a">{t('Bonjour ! Prix, délais, logo, tailles… posez votre question, je vous réponds tout de suite.')}</p>
            {msgs.map((m, i) => <p key={i} className={`chat-msg ${m.role === 'user' ? 'u' : 'a'}`}>{m.content}</p>)}
            {busy && <p className="chat-msg a chat-typing"><i /><i /><i /></p>}
            {!msgs.length && <div className="chat-quick">{quick.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
          </div>
          {(handoff || userCount >= 2) && (
            <a className={`chat-wa ${handoff ? 'on' : ''}`} href={`https://wa.me/${WA}?text=${waText}`} target="_blank" rel="noopener">
              <WaIcon /> {t('Parler à l\'équipe sur WhatsApp')}
            </a>
          )}
          <form className="chat-in" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Votre question…')} aria-label={t('Votre question')} maxLength={1000} />
            <button className="btn cta" disabled={busy || !text.trim()} aria-label={t('Envoyer')}><I name="arrow" size={18} /></button>
          </form>
        </div>
      )}
      <button className="chat-fab" aria-label={t(open ? 'Fermer' : 'Une question ?')} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <I name="x" size={24} /> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" /></svg>}
      </button>
    </>
  );
}

const WaIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3Z" /></svg>;
