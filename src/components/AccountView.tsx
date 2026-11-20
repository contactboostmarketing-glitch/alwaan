'use client';
// Espace client : commandes (suivi, facture, recommander), devis, logos, statut revendeur.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { uploadFile } from '@/lib/cutout';
import { eur } from '@/lib/pricing';
import { useT } from '@/i18n/client';

type Me = {
  enabled: boolean; connected?: boolean; firstName?: string; email?: string;
  orders?: { id: string; name: string; date: string; total: number; status?: string; statusUrl?: string; reorder?: string; express?: boolean; photos?: string[]; items: { title: string; quantity: number; variant?: string }[] }[];
  quotes?: { id: string; number?: string; date: string; validUntil?: string; totalHT: number }[];
  logos?: { id: string; bat?: string; order: string }[];
  reseller?: { status: 'en_attente' | 'valide' | 'refuse'; company: string } | null;
  referral?: string | null; bons?: { code: string; amount: number; used: boolean }[];
  shops?: { slug: string; name: string; items: number; stats: { orders: number; revenueHT: number; commission: number; pending: number } }[];
};

export function AccountView() {
  const { t, l, lang } = useT();
  const err = useSearchParams().get('erreur');
  const [me, setMe] = useState<Me | null>(null);
  const load = () => fetch('/api/compte/me').then((r) => r.json()).then(setMe).catch(() => setMe({ enabled: true, connected: false }));
  useEffect(() => { load(); }, []);
  const day = (s: string) => new Date(s).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!me) return <section className="wrap acct"><p className="muted">{t('Chargement…')}</p></section>;
  if (!me.enabled) return <section className="wrap acct"><h1>{t('Mon compte')}</h1><p className="muted">{t('L\'espace client ouvre très bientôt.')}</p></section>;
  if (!me.connected) return (
    <section className="wrap acct narrow">
      <h1>{t('Mon compte')}</h1>
      <ul className="perks acct-perks">
        <li>📦 {t('Vos commandes et leur suivi')}</li><li>🧾 {t('Vos factures')}</li><li>📄 {t('Vos devis')}</li><li>🎨 {t('Vos logos, prêts à réutiliser')}</li><li>🏷️ {t('Espace revendeur : -10 % sur tout')}</li>
      </ul>
      {err && <p className="warnline">{t('La connexion n\'a pas abouti. Réessayez.')}</p>}
      <a className="btn cta block" href={`/api/compte/login?lang=${lang}`}>{t('Se connecter')}</a>
      <p className="muted small">{t('Sans mot de passe : vous recevez un code par email.')}</p>
    </section>
  );

  return (
    <section className="wrap acct">
      <div className="sec-head"><h1>{me.firstName ? t('Bonjour {n}', { n: me.firstName }) : t('Mon compte')}</h1><a className="link small" href="/api/compte/logout">{t('Se déconnecter')}</a></div>
      <p className="muted small">{me.email}</p>
      {me.reseller?.status === 'valide' && <p className="okline">🏷️ {t('Revendeur validé : -10 % sur tout')}</p>}

      <h2>{t('Mes commandes')}</h2>
      {!me.orders?.length ? <p className="muted">{t('Aucune commande pour l\'instant.')}</p> : me.orders.map((o) => (
        <article key={o.id} className="acct-card">
          <header><b>{o.name}</b><small className="muted">{day(o.date)}</small>{o.express && <span className="st st-modif">⚡ Express</span>}<b className="acct-total">{eur(o.total, lang)}</b></header>
          {!!o.photos?.length && <div className="qc">{o.photos.map((p) => <a key={p} href={`/api/logo/${p}?apercu`} target="_blank" rel="noopener" title={t('Photo de contrôle')}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/logo/${p}?apercu`} alt={t('Photo de contrôle')} /></a>)}</div>}
          <p className="small muted">{o.items.slice(0, 4).map((i) => `${i.quantity} × ${i.title}`).join(' · ')}{o.items.length > 4 ? ' …' : ''}</p>
          <div className="atl-files">
            {o.statusUrl && <a className="btn line small" href={o.statusUrl} target="_blank" rel="noopener">{t('Suivi')}</a>}
            <a className="btn line small" href={`/api/compte/facture/${o.id.split('/').pop()}`} target="_blank" rel="noopener">{t('Facture')}</a>
            {o.reorder && <a className="btn cta small" href={o.reorder.replace(/^https?:\/\/[^/]+/, '')}>{t('Recommander')}</a>}
          </div>
        </article>
      ))}

      <h2>{t('Mes devis')}</h2>
      {!me.quotes?.length ? <p className="muted">{t('Téléchargez un devis depuis votre panier : il apparaîtra ici.')}</p> : me.quotes.map((q) => (
        <article key={q.id} className="acct-card">
          <header><b>{q.number}</b><small className="muted">{day(q.date)}</small><b className="acct-total">{eur(q.totalHT, lang)} {t('HT')}</b></header>
          <div className="atl-files"><a className="btn line small" href={`/api/devis-pdf/${q.id}`} target="_blank" rel="noopener">PDF</a><Link className="btn cta small" href={`/devis/${q.id}`}>{t('Commander ce devis')}</Link></div>
        </article>
      ))}

      <h2>{t('Mes logos')}</h2>
      {!me.logos?.length ? <p className="muted">{t('Vos logos apparaîtront ici après votre première commande.')}</p> : (
        <div className="acct-logos">{me.logos.map((g) => (
          <div key={g.id} className="acct-logo">
            <span className="cut-prev">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/logo/${g.id}?apercu`} alt="" /></span>
            <small className="muted">{g.order}</small>
            <div className="atl-files"><Link className="btn cta small" href={`${l('/assistant')}?logo=${encodeURIComponent(g.id)}`}>{t('Réutiliser')}</Link><a className="btn line small" href={`/api/logo/${g.id}`}>{t('Télécharger')}</a></div>
          </div>
        ))}</div>
      )}

      <h2>{t('Boutique club ou entreprise')}</h2>
      <p className="muted small">{t('Vos membres commandent et paient eux-mêmes. Vous recevez 10 % des ventes en bons d\'achat.')}</p>
      {me.shops?.map((s) => (
        <article key={s.slug} className="acct-card">
          <header><b>{s.name}</b><small className="muted">{t('{n} articles', { n: s.items })}</small></header>
          <p className="small">{t('{o} commandes · {r} HT de ventes · {c} de commission versée · {p} en attente', { o: s.stats.orders, r: eur(s.stats.revenueHT, lang), c: eur(s.stats.commission, lang), p: eur(s.stats.pending, lang) })}</p>
          <div className="atl-files"><Link className="btn line small" href={l(`/boutique/${s.slug}`)}>{t('Voir la boutique')}</Link></div>
        </article>
      ))}
      <Link className="btn line" href={lang === 'en' ? '/en/account/shop' : '/compte/boutique'}>{t('Créer une boutique')}</Link>

      {me.referral && (<>
        <h2>{t('Parrainage')}</h2>
        <p className="muted small">{t('Un confrère commande avec votre code : il a 20 € de remise (dès 150 € HT), vous recevez un bon de 20 €.')}</p>
        <div className="asst-say"><input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?parrain=${me.referral}`} onFocus={(e) => e.target.select()} aria-label={t('Lien de parrainage')} />
          <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?parrain=${me.referral}`)}>{t('Copier')}</button></div>
        <div className="atl-files"><span className="st">{t('Votre code')} : <b>{me.referral}</b></span>
          <a className="btn line small" href={`https://wa.me/?text=${encodeURIComponent(t('Je te recommande alwaan pour tes tenues pro : 20 € offerts avec mon lien {u}', { u: `https://alwaan.fr/?parrain=${me.referral}` }))}`} target="_blank" rel="noopener">WhatsApp</a></div>
        {!!me.bons?.length && <div className="atl-files">{me.bons.map((b) => <span key={b.code} className={`st ${b.used ? '' : 'st-valide'}`}>🎁 {b.code} · {b.amount} € {b.used ? `(${t('utilisé')})` : ''}</span>)}</div>}
      </>)}

      <ResellerBox status={me.reseller?.status} onDone={load} />
    </section>
  );
}

function ResellerBox({ status, onDone }: { status?: 'en_attente' | 'valide' | 'refuse'; onDone: () => void }) {
  const { t } = useT();
  const [company, setCompany] = useState(''), [siret, setSiret] = useState('');
  const [kbis, setKbis] = useState<{ id?: string; name?: string; busy?: boolean }>({});
  const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
  if (status === 'valide') return null;
  if (status === 'en_attente') return <><h2>{t('Espace revendeur')}</h2><p className="nudge">{t('Demande reçue : nous vérifions votre Kbis. Vous serez prévenu dès la validation.')}</p></>;
  const send = async () => {
    setBusy(true); setMsg('');
    const r = await fetch('/api/compte/revendeur', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company, siret, kbisId: kbis.id }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg(t(d.error || 'Envoi impossible.')); return; }
    onDone();
  };
  return (
    <>
      <h2>{t('Espace revendeur')}</h2>
      <p className="muted small">{t('Revendeurs et agences : -10 % sur tout après vérification de votre Kbis.')}</p>
      {status === 'refuse' && <p className="warnline">{t('Votre demande n\'a pas été validée. Vous pouvez envoyer un nouveau Kbis.')}</p>}
      <div className="quote-box">
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t('Société')} aria-label={t('Société')} />
        <input value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="SIRET" aria-label="SIRET" inputMode="numeric" />
        <label className="asst-drop small-drop"><strong>{kbis.busy ? t('Envoi…') : kbis.id ? `✓ ${kbis.name}` : t('Kbis de moins de 3 mois (PDF ou photo)')}</strong>
          <input type="file" accept="application/pdf,image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setKbis({ busy: true }); const u = await uploadFile(f, f.name); setKbis(u.id ? { id: u.id, name: f.name } : {}); if (u.error) setMsg(t(u.error)); }} /></label>
        <button className="btn cta" disabled={busy || !company || !siret || !kbis.id} onClick={send}>{busy ? t('Envoi…') : t('Demander le statut revendeur')}</button>
        {msg && <p className="err">{msg}</p>}
      </div>
    </>
  );
}
