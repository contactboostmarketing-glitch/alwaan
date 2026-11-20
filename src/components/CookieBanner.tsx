'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/client';

const KEY = 'alwaan-consent-v1';
type Consent = { ads: boolean; analytics: boolean; date: string };

declare global { interface Window { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] } }

/** Applique le choix au Consent Mode v2 de Google. Les pixels ne doivent se charger qu'après accord. */
function apply(c: Consent) {
  window.gtag?.('consent', 'update', {
    ad_storage: c.ads ? 'granted' : 'denied',
    ad_user_data: c.ads ? 'granted' : 'denied',
    ad_personalization: c.ads ? 'granted' : 'denied',
    analytics_storage: c.analytics ? 'granted' : 'denied',
  });
  window.dispatchEvent(new CustomEvent('alwaan-consent', { detail: c }));
}

export function CookieBanner() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [ads, setAds] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    try {
      const c: Consent | null = JSON.parse(localStorage.getItem(KEY) || 'null');
      const sixMonths = 1000 * 60 * 60 * 24 * 182;
      if (c && Date.now() - new Date(c.date).getTime() < sixMonths) apply(c); else setOpen(true);
    } catch { setOpen(true); }
    const reopen = () => setOpen(true);
    window.addEventListener('alwaan-open-consent', reopen);
    return () => window.removeEventListener('alwaan-open-consent', reopen);
  }, []);

  const decide = (a: boolean, an: boolean) => {
    const c = { ads: a, analytics: an, date: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
    apply(c); setOpen(false); setCustom(false);
  };
  if (!open) return null;
  return (
    <div className="cookie" role="dialog" aria-label={t('Choix des cookies')}>
      <div><b>Cookies</b><p className="muted">{t('Nous utilisons des cookies pour mesurer l\'audience et l\'efficacité de nos publicités (Google, Meta). Vous pouvez accepter, refuser ou choisir.')} <Link href="/cookies">{t('En savoir plus')}</Link></p></div>
      {custom && (
        <div className="cookie-opts">
          <label><input type="checkbox" checked disabled /> {t('Nécessaires (panier, sécurité)')}</label>
          <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> {t('Mesure d\'audience')}</label>
          <label><input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} /> {t('Publicité (Google Ads, Meta)')}</label>
        </div>
      )}
      <div className="ctas">
        {custom ? <button className="btn line" onClick={() => decide(ads, analytics)}>{t('Enregistrer')}</button> : <button className="btn line" onClick={() => setCustom(true)}>{t('Personnaliser')}</button>}
        <button className="btn dark" onClick={() => decide(false, false)}>{t('Tout refuser')}</button>
        <button className="btn dark" onClick={() => decide(true, true)}>{t('Tout accepter')}</button>
      </div>
    </div>
  );
}

export function ConsentLink() {
  return <button className="link" onClick={() => window.dispatchEvent(new Event('alwaan-open-consent'))}>Gérer mes cookies</button>;
}
