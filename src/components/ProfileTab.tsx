'use client';
// Mon profil : identité (nom, prénom), email et connexion, société (devis et factures), adresses de livraison.
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/client';
import { I } from './Icons';

type Addr = { id?: string; firstName?: string; lastName?: string; company?: string; address1?: string; address2?: string; zip?: string; city?: string; territoryCode?: string; phoneNumber?: string };
type Profile = { firstName: string; lastName: string; email: string; company?: string; siret?: string; vat?: string; defaultAddressId?: string; addresses: Addr[]; accountUrl: string };

export function ProfileTab({ onSaved }: { onSaved: () => void }) {
  const { t } = useT();
  const [p, setP] = useState<Profile | null>(null);
  const [err, setErr] = useState('');
  const [edit, setEdit] = useState<Addr | null>(null);
  useEffect(() => { fetch('/api/compte/profil').then((r) => r.json()).then((d) => (d.error ? setErr(d.error) : setP(d))).catch(() => setErr(t('Chargement impossible.'))); }, [t]);

  const save = async (body: Record<string, unknown>) => {
    const r = await fetch('/api/compte/profil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({ error: t('Enregistrement impossible.') }));
    if (!r.ok) return t(d.error || 'Enregistrement impossible.');
    setP(d); onSaved(); return '';
  };

  if (err && !p) return <><h1>{t('Mon profil')}</h1><p className="warnline">{err}</p></>;
  if (!p) return <><h1>{t('Mon profil')}</h1><p className="muted">{t('Chargement…')}</p></>;

  return (
    <>
      <h1>{t('Mon profil')}</h1>
      <div className="prof-grid">
        <Card icon="user" title={t('Identité')} fields={[['firstName', t('Prénom'), p.firstName], ['lastName', t('Nom'), p.lastName]]}
          onSave={(v) => save({ action: 'identite', ...v })} />

        <section className="prof-card">
          <h2><I name="mail" size={18} /> {t('Email et connexion')}</h2>
          <p className="prof-val">{p.email}</p>
          <p className="muted small with-ic"><I name="lock" size={15} /> {t('Pas de mot de passe à retenir : à chaque connexion, un code à usage unique est envoyé à cet email.')}</p>
          <a className="btn line small" href={p.accountUrl} target="_blank" rel="noopener">{t('Changer d\'email')}</a>
        </section>

        <Card icon="building" title={t('Société')} hint={t('Repris sur vos devis et factures.')}
          fields={[['company', t('Raison sociale'), p.company || ''], ['siret', 'SIRET', p.siret || ''], ['vat', t('N° de TVA intracommunautaire'), p.vat || '']]}
          onSave={(v) => save({ action: 'societe', ...v })} />
      </div>

      <h2 className="with-ic"><I name="pin" size={18} /> {t('Adresses de livraison')}</h2>
      <div className="prof-addrs">
        {p.addresses.map((a) => (
          <article key={a.id} className="prof-addr">
            {a.id === p.defaultAddressId && <span className="chip">{t('Par défaut')}</span>}
            <p><b>{[a.firstName, a.lastName].filter(Boolean).join(' ')}</b>{a.company && <><br />{a.company}</>}<br />{a.address1}{a.address2 && <>, {a.address2}</>}<br />{a.zip} {a.city} · {a.territoryCode === 'BE' ? t('Belgique') : t('France')}</p>
            <div className="atl-files">
              <button className="btn line small" onClick={() => setEdit(a)}>{t('Modifier')}</button>
              <button className="link small" onClick={async () => { if (confirm(t('Supprimer cette adresse ?'))) { const e = await save({ action: 'supprimer-adresse', id: a.id }); if (e) alert(e); } }}>{t('Supprimer')}</button>
            </div>
          </article>
        ))}
        <button className="prof-add" onClick={() => setEdit({ firstName: p.firstName, lastName: p.lastName, company: p.company, territoryCode: 'FR' })}><I name="pin" size={22} />{t('Ajouter une adresse')}</button>
      </div>
      {edit && <AddressForm a={edit} isDefault={!!edit.id && edit.id === p.defaultAddressId} onCancel={() => setEdit(null)}
        onSave={async (a, makeDefault) => { const e = await save({ action: 'adresse', address: a, makeDefault }); if (!e) setEdit(null); return e; }} />}
    </>
  );
}

function Card({ icon, title, hint, fields, onSave }: { icon: string; title: string; hint?: string; fields: [string, string, string][]; onSave: (v: Record<string, string>) => Promise<string> }) {
  const { t } = useT();
  const init = Object.fromEntries(fields.map(([k, , v]) => [k, v]));
  const [v, setV] = useState<Record<string, string>>(init);
  const [state, setState] = useState<'' | 'busy' | 'ok'>(''), [msg, setMsg] = useState('');
  const dirty = fields.some(([k, , val]) => (v[k] || '') !== val);
  return (
    <section className="prof-card">
      <h2><I name={icon} size={18} /> {title}</h2>
      {hint && <p className="muted small">{hint}</p>}
      {fields.map(([k, label]) => (
        <label key={k} className="prof-field"><span>{label}</span><input value={v[k] || ''} onChange={(e) => { setV({ ...v, [k]: e.target.value }); setState(''); }} /></label>
      ))}
      {msg && <p className="err">{msg}</p>}
      <button className="btn cta small" disabled={!dirty || state === 'busy'} onClick={async () => { setState('busy'); setMsg(''); const e = await onSave(v); setMsg(e); setState(e ? '' : 'ok'); }}>
        {state === 'busy' ? t('Enregistrement…') : state === 'ok' && !dirty ? <><I name="check" size={16} /> {t('Enregistré')}</> : t('Enregistrer')}
      </button>
    </section>
  );
}

function AddressForm({ a, isDefault, onSave, onCancel }: { a: Addr; isDefault: boolean; onSave: (a: Addr, d: boolean) => Promise<string>; onCancel: () => void }) {
  const { t } = useT();
  const [v, setV] = useState<Addr>(a), [def, setDef] = useState(isDefault || !a.id), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const f = (k: keyof Addr, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="prof-field"><span>{label}</span><input value={v[k] || ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...extra} /></label>
  );
  return (
    <div className="offer-back" onClick={onCancel}>
      <div className="offer prof-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{a.id ? t('Modifier l\'adresse') : t('Nouvelle adresse')}</h2>
        <div className="prof-row">{f('firstName', t('Prénom'))}{f('lastName', t('Nom'))}</div>
        {f('company', t('Société (facultatif)'))}
        {f('address1', t('Adresse'), { autoComplete: 'address-line1' })}
        {f('address2', t('Complément (facultatif)'), { autoComplete: 'address-line2' })}
        <div className="prof-row">{f('zip', t('Code postal'), { inputMode: 'numeric', autoComplete: 'postal-code' })}{f('city', t('Ville'), { autoComplete: 'address-level2' })}</div>
        <div className="prof-row">
          <label className="prof-field"><span>{t('Pays')}</span><select value={v.territoryCode || 'FR'} onChange={(e) => setV({ ...v, territoryCode: e.target.value })}><option value="FR">{t('France')}</option><option value="BE">{t('Belgique')}</option></select></label>
          {f('phoneNumber', t('Téléphone (facultatif)'), { type: 'tel', autoComplete: 'tel' })}
        </div>
        <label className="prof-check"><input type="checkbox" checked={def} onChange={(e) => setDef(e.target.checked)} /> {t('Adresse par défaut')}</label>
        {msg && <p className="err">{msg}</p>}
        <div className="atl-files">
          <button className="btn cta" disabled={busy} onClick={async () => { setBusy(true); setMsg(await onSave(v, def)); setBusy(false); }}>{busy ? t('Enregistrement…') : t('Enregistrer')}</button>
          <button className="btn line" onClick={onCancel}>{t('Annuler')}</button>
        </div>
      </div>
    </div>
  );
}
