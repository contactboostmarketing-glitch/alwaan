'use client';
// Espace client : commandes (suivi, facture, recommander), devis, logos, statut revendeur.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { uploadFile } from '@/lib/cutout';
import { eur } from '@/lib/pricing';
import { deliveryDate, fmtDay } from '@/lib/delivery';
import { useT } from '@/i18n/client';
import { I } from './Icons';
import { ProfileTab } from './ProfileTab';

type Me = {
  enabled: boolean; connected?: boolean; firstName?: string; email?: string;
  orders?: { id: string; name: string; date: string; total: number; status?: string; statusUrl?: string; reorder?: string; express?: boolean; photos?: string[]; items: { title: string; quantity: number; variant?: string }[] }[];
  quotes?: { id: string; number?: string; date: string; validUntil?: string; totalHT: number }[];
  logos?: { id: string; bat?: string; order: string }[];
  reseller?: { status: 'en_attente' | 'valide' | 'refuse'; company: string } | null;
  referral?: string | null; bons?: { code: string; amount: number; used: boolean }[];
  shops?: { slug: string; name: string; items: number; stats: { orders: number; revenueHT: number; commission: number; pending: number } }[];
};

const TABS = ['accueil', 'commandes', 'factures', 'devis', 'logos', 'parrainage', 'boutique', 'revendeur', 'profil'] as const;
type Tab = (typeof TABS)[number];

export function AccountView() {
  const { t, l, lang } = useT();
  const params = useSearchParams();
  const err = params.get('erreur');
  const [tab, setTab] = useState<Tab>(() => (TABS.includes(params.get('s') as Tab) ? (params.get('s') as Tab) : 'accueil'));
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => fetch('/api/compte/me').then((r) => r.json()).then(setMe).catch(() => setMe({ enabled: true, connected: false }));
  useEffect(() => { load(); }, []);
  const day = (s: string) => new Date(s).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!me) return <section className="wrap acct"><p className="muted">{t('Chargement…')}</p></section>;
  if (!me.enabled) return <section className="wrap acct"><h1>{t('Mon compte')}</h1><p className="muted">{t('L\'espace client ouvre très bientôt.')}</p></section>;
  if (!me.connected) return (
    <section className="wrap acct narrow">
      <h1>{t('Mon compte')}</h1>
      <ul className="perks acct-perks">
        <li><I name="box" className="ico" /> {t('Vos commandes et leur suivi')}</li><li><I name="receipt" className="ico" /> {t('Vos factures')}</li><li><I name="file" className="ico" /> {t('Vos devis')}</li><li><I name="palette" className="ico" /> {t('Vos logos, prêts à réutiliser')}</li><li><I name="tag" className="ico" /> {t('Espace revendeur : -10 % sur tout')}</li>
      </ul>
      {err && <p className="warnline">{t('La connexion n\'a pas abouti. Réessayez.')}</p>}
      <a className="btn cta block" href={`/api/compte/login?lang=${lang}`}>{t('Se connecter')}</a>
      <p className="muted small">{t('Sans mot de passe : vous recevez un code par email.')}</p>
    </section>
  );

  const go = (id: Tab) => { setTab(id); setOpen(false); try { const u = new URL(window.location.href); u.searchParams.set('s', id); window.history.replaceState(null, '', u.toString()); } catch {} window.scrollTo(0, 0); };
  const orders = me.orders || [], quotes = me.quotes || [], logos = me.logos || [], shops = me.shops || [], bons = (me.bons || []).filter((b) => !b.used);
  const MENU: [Tab, string, string, number?][] = [
    ['accueil', 'home', t('Accueil')], ['commandes', 'box', t('Mes commandes'), orders.length], ['factures', 'receipt', t('Mes factures'), orders.length],
    ['devis', 'file', t('Mes devis'), quotes.length], ['logos', 'palette', t('Mes logos'), logos.length], ['parrainage', 'gift', t('Parrainage'), bons.length || undefined],
    ['boutique', 'bag', t('Ma boutique'), shops.length || undefined], ['revendeur', 'tag', t('Revendeur')], ['profil', 'user', t('Mon profil')],
  ];
  const reorderHref = (u: string) => u.replace(/^https?:\/\/[^/]+/, '');
  const empty = (txt: string, cta?: [string, string]) => <div className="acct-empty"><p className="muted">{txt}</p>{cta && <Link className="btn cta" href={cta[1]}>{cta[0]}</Link>}</div>;

  return (
    <section className={`wrap acct acct-layout ${open ? 'menu-open' : ''}`}>
      <div className="acct-bar">
        <b>{MENU.find((m) => m[0] === tab)?.[2]}</b>
        <button className="acct-burger" aria-expanded={open} aria-label={t('Menu du compte')} onClick={() => setOpen(!open)}><I name={open ? 'x' : 'menu'} size={20} /> {t('Menu')}</button>
      </div>
      {open && <div className="acct-scrim" onClick={() => setOpen(false)} />}
      <nav className="acct-menu" aria-label={t('Mon compte')}>
        <div className="acct-me"><b>{me.firstName || t('Mon compte')}</b><small className="muted">{me.email}</small></div>
        {MENU.map(([id, ic, label, n]) => (
          <button key={id} className="acct-tab" aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}><span><I name={ic} size={18} /></span>{label}{n ? <i>{n}</i> : null}</button>
        ))}
        <a className="acct-tab acct-logout" href="/api/compte/logout"><span><I name="logout" size={18} /></span>{t('Se déconnecter')}</a>
      </nav>

      <div className="acct-main">
        {tab === 'accueil' && (<>
          <h1>{me.firstName ? t('Bonjour {n}', { n: me.firstName }) : t('Bienvenue')}</h1>
          <p className="muted">{t('Heureux de vous revoir. Retrouvez ici vos commandes, factures, devis et logos.')}</p>
          {me.reseller?.status === 'valide' && <p className="okline with-ic"><I name="tag" size={16} /> {t('Revendeur validé : -10 % sur tout')}</p>}
          <div className="acct-kpis">
            <button onClick={() => go('commandes')}><b>{orders.length}</b><small>{t('commandes')}</small></button>
            <button onClick={() => go('devis')}><b>{quotes.length}</b><small>{t('devis')}</small></button>
            <button onClick={() => go('logos')}><b>{logos.length}</b><small>{t('logos')}</small></button>
            <button onClick={() => go('parrainage')}><b>{bons.reduce((a, b) => a + b.amount, 0)} €</b><small>{t('en bons d\'achat')}</small></button>
          </div>
          {orders[0] && (
            <article className="acct-card">
              <header><b>{t('Dernière commande')} {orders[0].name}</b><small className="muted">{day(orders[0].date)}</small><b className="acct-total">{eur(orders[0].total, lang)}</b></header>
              <div className="atl-files">{orders[0].statusUrl && <a className="btn line small" href={orders[0].statusUrl} target="_blank" rel="noopener">{t('Suivi')}</a>}{orders[0].reorder && <a className="btn cta small" href={reorderHref(orders[0].reorder)}>{t('Recommander')}</a>}</div>
            </article>
          )}
          <h2>{t('Raccourcis')}</h2>
          <div className="acct-quick">
            <Link href={l('/assistant')}><I name="sparkles" className="ico" /> {t('Créer une tenue')}</Link>
            <Link href={l('/lien-equipe')}><I name="users" className="ico" /> {t('Lien d\'équipe')}</Link>
            {logos[0] && <Link href={`${l('/assistant')}?logo=${encodeURIComponent(logos[0].id)}`}><I name="palette" className="ico" /> {t('Commander avec mon logo')}</Link>}
            <button onClick={() => go('parrainage')}><I name="gift" className="ico" /> {t('Parrainer un confrère')}</button>
            <button onClick={() => go('profil')}><I name="user" className="ico" /> {t('Mes informations et adresses')}</button>
          </div>
        </>)}

        {tab === 'commandes' && (<>
          <h1>{t('Mes commandes')}</h1>
          {!orders.length ? empty(t('Aucune commande pour l\'instant.'), [t('Créer une tenue'), l('/assistant')]) : orders.map((o) => (
            <article key={o.id} className="acct-card">
              <header><b>{o.name}</b><small className="muted">{day(o.date)}</small>{o.express && <span className="st st-modif with-ic"><I name="zap" size={13} /> Express</span>}<b className="acct-total">{eur(o.total, lang)}</b></header>
              {!!o.photos?.length && <div className="qc">{o.photos.map((p) => <a key={p} href={`/api/logo/${p}?apercu`} target="_blank" rel="noopener" title={t('Photo de contrôle')}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/logo/${p}?apercu`} alt={t('Photo de contrôle')} /></a>)}</div>}
              <OrderSteps o={o} />
              <p className="small muted">{o.items.slice(0, 4).map((i) => `${i.quantity} × ${i.title}`).join(' · ')}{o.items.length > 4 ? ' …' : ''}</p>
              <div className="atl-files">
                {o.statusUrl && <a className="btn line small" href={o.statusUrl} target="_blank" rel="noopener">{t('Suivi')}</a>}
                <a className="btn line small" href={`/api/compte/facture/${o.id.split('/').pop()}`} target="_blank" rel="noopener">{t('Facture')}</a>
                {o.reorder && <a className="btn cta small" href={reorderHref(o.reorder)}>{t('Recommander')}</a>}
              </div>
            </article>
          ))}
        </>)}

        {tab === 'factures' && (<>
          <h1>{t('Mes factures')}</h1>
          {!orders.length ? empty(t('Vos factures apparaîtront ici après votre première commande.')) : (
            <ul className="acct-list">{orders.map((o) => (
              <li key={o.id}><span><b>{o.name}</b> <small className="muted">{day(o.date)}</small></span><span>{eur(o.total, lang)}</span>
                <a className="btn line small" href={`/api/compte/facture/${o.id.split('/').pop()}`} target="_blank" rel="noopener">PDF</a></li>
            ))}</ul>
          )}
        </>)}

        {tab === 'devis' && (<>
          <h1>{t('Mes devis')}</h1>
          {!quotes.length ? empty(t('Téléchargez un devis depuis votre panier : il apparaîtra ici.'), [t('Voir le panier'), l('/panier')]) : quotes.map((q) => (
            <article key={q.id} className="acct-card">
              <header><b>{q.number}</b><small className="muted">{day(q.date)}</small><b className="acct-total">{eur(q.totalHT, lang)} {t('HT')}</b></header>
              <div className="atl-files"><a className="btn line small" href={`/api/devis-pdf/${q.id}`} target="_blank" rel="noopener">PDF</a><Link className="btn cta small" href={`/devis/${q.id}`}>{t('Commander ce devis')}</Link></div>
            </article>
          ))}
        </>)}

        {tab === 'logos' && (<>
          <h1>{t('Mes logos')}</h1>
          {!logos.length ? empty(t('Vos logos apparaîtront ici après votre première commande.'), [t('Créer une tenue'), l('/assistant')]) : (
            <div className="acct-logos">{logos.map((g) => (
              <div key={g.id} className="acct-logo">
                <span className="cut-prev">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/logo/${g.id}?apercu`} alt="" /></span>
                <small className="muted">{g.order}</small>
                <div className="atl-files"><Link className="btn cta small" href={`${l('/assistant')}?logo=${encodeURIComponent(g.id)}`}>{t('Réutiliser')}</Link><a className="btn line small" href={`/api/logo/${g.id}`}>{t('Télécharger')}</a></div>
              </div>
            ))}</div>
          )}
        </>)}

        {tab === 'parrainage' && me.referral && (<>
          <h1>{t('Parrainage')}</h1>
          <p className="muted">{t('Un confrère commande avec votre code : il a 20 € de remise (dès 150 € HT), vous recevez un bon de 20 €.')}</p>
          <div className="asst-say"><input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?parrain=${me.referral}`} onFocus={(e) => e.target.select()} aria-label={t('Lien de parrainage')} />
            <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?parrain=${me.referral}`)}>{t('Copier')}</button></div>
          <div className="atl-files"><span className="st">{t('Votre code')} : <b>{me.referral}</b></span>
            <a className="btn line small" href={`https://wa.me/?text=${encodeURIComponent(t('Je te recommande alwaan pour tes tenues pro : 20 € offerts avec mon lien {u}', { u: `https://alwaan.fr/?parrain=${me.referral}` }))}`} target="_blank" rel="noopener">WhatsApp</a></div>
          <h2>{t('Mes bons d\'achat')}</h2>
          {!me.bons?.length ? <p className="muted">{t('Vos bons apparaîtront ici dès la première commande d\'un filleul.')}</p>
            : <div className="atl-files">{me.bons.map((b) => <span key={b.code} className={`st ${b.used ? '' : 'st-valide'}`}><I name="gift" size={13} /> {b.code} · {b.amount} € {b.used ? `(${t('utilisé')})` : ''}</span>)}</div>}
        </>)}

        {tab === 'boutique' && (<>
          <h1>{t('Boutique club ou entreprise')}</h1>
          <p className="muted">{t('Vos membres commandent et paient eux-mêmes. Vous recevez 10 % des ventes en bons d\'achat.')}</p>
          {shops.map((x) => (
            <article key={x.slug} className="acct-card">
              <header><b>{x.name}</b><small className="muted">{t('{n} articles', { n: x.items })}</small></header>
              <p className="small">{t('{o} commandes · {r} HT de ventes · {c} de commission versée · {p} en attente', { o: x.stats.orders, r: eur(x.stats.revenueHT, lang), c: eur(x.stats.commission, lang), p: eur(x.stats.pending, lang) })}</p>
              <div className="atl-files"><Link className="btn line small" href={l(`/boutique/${x.slug}`)}>{t('Voir la boutique')}</Link></div>
            </article>
          ))}
          <Link className="btn cta" href={lang === 'en' ? '/en/account/shop' : '/compte/boutique'}>{t('Créer une boutique')}</Link>
        </>)}

        {tab === 'profil' && <ProfileTab onSaved={load} />}

        {tab === 'revendeur' && (<>
          <h1>{t('Espace revendeur')}</h1>
          {me.reseller?.status === 'valide' ? <p className="okline with-ic"><I name="tag" size={16} /> {t('Revendeur validé : -10 % sur tout')}</p> : <ResellerBox status={me.reseller?.status} onDone={load} />}
        </>)}
      </div>
    </section>
  );
}

function ResellerBox({ status, onDone }: { status?: 'en_attente' | 'valide' | 'refuse'; onDone: () => void }) {
  const { t } = useT();
  const [company, setCompany] = useState(''), [siret, setSiret] = useState('');
  const [kbis, setKbis] = useState<{ id?: string; name?: string; busy?: boolean }>({});
  const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
  if (status === 'valide') return null;
  if (status === 'en_attente') return <><p className="nudge">{t('Demande reçue : nous vérifions votre Kbis. Vous serez prévenu dès la validation.')}</p></>;
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
      <p className="muted small">{t('Revendeurs et agences : -10 % sur tout après vérification de votre Kbis.')}</p>
      {status === 'refuse' && <p className="warnline">{t('Votre demande n\'a pas été validée. Vous pouvez envoyer un nouveau Kbis.')}</p>}
      <div className="quote-box">
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t('Société')} aria-label={t('Société')} />
        <input value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="SIRET" aria-label="SIRET" inputMode="numeric" />
        <label className="asst-drop small-drop"><strong>{kbis.busy ? t('Envoi…') : kbis.id ? kbis.name : t('Kbis de moins de 3 mois (PDF ou photo)')}</strong>
          <input type="file" accept="application/pdf,image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setKbis({ busy: true }); const u = await uploadFile(f, f.name); setKbis(u.id ? { id: u.id, name: f.name } : {}); if (u.error) setMsg(t(u.error)); }} /></label>
        <button className="btn cta" disabled={busy || !company || !siret || !kbis.id} onClick={send}>{busy ? t('Envoi…') : t('Demander le statut revendeur')}</button>
        {msg && <p className="err">{msg}</p>}
      </div>
    </>
  );
}

/** Étapes de la commande vues par le client : reçue → en production → contrôlée (photo) → expédition prévue. */
function OrderSteps({ o }: { o: { date: string; status?: string; express?: boolean; photos?: string[] } }) {
  const { t, lang } = useT();
  const paid = !o.status || /paid|payé/i.test(o.status);
  const checked = !!o.photos?.length;
  const steps: [string, boolean][] = [[t('Commande reçue'), true], [t('En production'), paid], [t('Contrôle qualité'), checked]];
  return (
    <div className="steps-o">
      <ol>{steps.map(([label, done]) => <li key={label} className={done ? 'on' : ''}>{label}</li>)}</ol>
      {!checked && <small className="muted">{t('Réception prévue vers le {d}', { d: fmtDay(deliveryDate(new Date(o.date), !!o.express), lang) })}</small>}
    </div>
  );
}
