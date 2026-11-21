'use client';
// Charge Google (gtag, Consent Mode v2 refusé par défaut) et Meta (seulement après accord publicité).
import Script from 'next/script';
import { useEffect } from 'react';
import { captureAttribution } from '@/lib/track';

const GA4 = process.env.NEXT_PUBLIC_GA4_ID; // G-XXXXXXX
const GADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID; // AW-XXXXXXXXX
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function loadMeta() {
  if (!PIXEL || window.fbq) return;
  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return; const n: any = (f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement; t.async = true; t.src = v; b.head.appendChild(t);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq!('init', PIXEL); window.fbq!('track', 'PageView');
}

export function Tracking() {
  useEffect(() => {
    captureAttribution();
    try { if (JSON.parse(localStorage.getItem('alwaan-consent-v1') || 'null')?.ads) loadMeta(); } catch {}
    const onConsent = (e: Event) => { if ((e as CustomEvent<{ ads: boolean }>).detail?.ads) loadMeta(); };
    window.addEventListener('alwaan-consent', onConsent);
    return () => window.removeEventListener('alwaan-consent', onConsent);
  }, []);
  const tag = GA4 || GADS;
  if (!tag) return null;
  return (<>
    <Script id="gtag-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag;
      gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });
      try { var c = JSON.parse(localStorage.getItem('alwaan-consent-v1') || 'null'); if (c) gtag('consent', 'update', { ad_storage: c.ads ? 'granted' : 'denied', ad_user_data: c.ads ? 'granted' : 'denied', ad_personalization: c.ads ? 'granted' : 'denied', analytics_storage: c.analytics ? 'granted' : 'denied' }); } catch (e) {}
      gtag('js', new Date());
      ${GA4 ? `gtag('config', '${GA4}');` : ''}
      ${GADS ? `gtag('config', '${GADS}');` : ''}
    `}</Script>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${tag}`} strategy="afterInteractive" />
  </>);
}
