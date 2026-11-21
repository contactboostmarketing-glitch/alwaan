'use client';
// Reprendre un panier enregistré : « Recommander » (commande passée) ou « Commander ce devis ».
// Logo et maquette validée sont repris tels quels : le client n'ajuste que les quantités.
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COLOR_NAMES, getProduct, zonesFor } from '@/lib/catalog';
import { toDataUrl } from '@/lib/mockup';
import { qtyOf, type LineConfig } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { Garment } from './Garment';

type Saved = { kind: 'commande' | 'devis' | 'relance' | 'partage'; promo?: string | null; lines: LineConfig[]; quote?: { number: string; validUntil: string } };

export function SavedCartView({ id }: { id: string }) {
  const [c, setC] = useState<Saved | null>(null);
  const [err, setErr] = useState('');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const { add, clear, setPromo } = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const relanceCode = params.get('code');

  useEffect(() => {
    fetch(`/api/panier/${id}`).then(async (r) => {
      const d = await r.json(); if (!r.ok) { setErr(d.error); return; } setC(d);
      const ids = [...new Set((d.lines as LineConfig[]).map((l) => l.logoId).filter(Boolean) as string[])];
      const out: Record<string, string> = {};
      for (const lid of ids) { const src = await toDataUrl(`/api/logo/${lid}?apercu`); if (src) out[lid] = src; }
      setPreviews(out);
      // Relance : le client est revenu, on note l'activité (l'offre -10 % est repoussée de 24 h).
      if (d.kind === 'relance' && !relanceCode) fetch('/api/relance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'activite', id }) }).catch(() => {});
    }).catch(() => setErr('Connexion impossible.'));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) return <section className="wrap bat-page"><p className="muted">{err || 'Chargement…'}</p></section>;
  const expired = c.quote && Date.parse(c.quote.validUntil) < Date.now();
  const go = () => {
    setBusy(true);
    if (c.kind === 'relance') {
      clear();
      try { localStorage.setItem('alwaan-relance', id); } catch {}
      if (relanceCode || c.promo) setPromo((relanceCode || c.promo)!.toUpperCase());
    }
    for (const l of c.lines) add({ ...l, logo: l.logoId ? previews[l.logoId] : undefined, approvedAt: l.approvedAt || new Date().toISOString() });
    router.push('/panier');
  };
  return (
    <section className="wrap bat-page">
      <h1>{c.kind === 'devis' ? `Devis ${c.quote?.number}` : c.kind === 'relance' ? 'Votre panier vous attend' : c.kind === 'partage' ? 'Maquette à valider' : 'Recommander'}</h1>
      <p className="muted">{c.kind === 'devis' ? 'Votre devis, prêt à commander.' : c.kind === 'relance' ? (relanceCode ? `Code ${relanceCode.toUpperCase()} : -10 % appliqué au panier.` : 'Votre logo et votre maquette validée sont gardés.') : c.kind === 'partage' ? 'On vous a partagé cette tenue. Si elle vous convient, ajoutez-la au panier pour la commander.' : 'Même logo, même maquette. Ajustez les tailles dans le panier.'}</p>
      <div className="atl-items">{c.lines.map((l, i) => {
        const p = getProduct(l.slug);
        return p && (
          <figure key={i}><Garment slug={l.slug} color={l.color} zones={l.zones} logo={l.logoId ? previews[l.logoId] : undefined} text={l.text} text2={l.text2} textFont={l.textFont} textColor={l.textColor} zoneText={l.zoneText} />
            <figcaption><b>{qtyOf(l)} × {p.name}</b><small>{COLOR_NAMES[l.color]} · {zonesFor(p).filter((z) => l.zones.includes(z.id)).map((z) => z.name).join(' + ')}</small></figcaption></figure>
        );
      })}</div>
      {expired ? <p className="warnline">Ce devis a expiré : les prix ont pu changer. Le panier sera recalculé au tarif du jour.</p> : null}
      <div className="bat-actions"><button className="btn cta" disabled={busy} onClick={go}>{c.kind === 'devis' ? 'Commander ce devis' : c.kind === 'relance' ? 'Reprendre mon panier' : 'Remettre dans mon panier'}</button></div>
    </section>
  );
}
