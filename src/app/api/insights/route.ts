import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { getJSON, listKeys } from '@/lib/blobStore';
import { recent, redact, type Demande, type Question, type Retour } from '@/lib/feedback';
import { limited, tooMany } from '@/lib/rateLimit';
import { listReviews, type Order } from '@/lib/reviews';
import { safeEqual } from '@/lib/secure';
import { currentSeason } from '@/lib/seasons';
import { SITE_URL } from '@/lib/site';
import { getStock } from '@/lib/stock';

/**
 * Voix du client, en lecture seule et SANS donnée personnelle, pour l'agent SEO (et toute analyse) :
 * avis, questions du conseiller en ligne, demandes de devis, retours saisis par l'atelier (litiges, messages…),
 * produits commandés, sources des ventes, références en rupture. Clé : en-tête x-insights-key = INSIGHTS_KEY.
 */
export const maxDuration = 60;
export async function GET(req: Request) {
  if (await limited(req, 'insights', 30, 3600)) return tooMany();
  // Lecture seule : clé INSIGHTS_KEY, ou la clé de synchro (SYNC_KEY) déjà détenue par les sessions de l'atelier.
  const sync = process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY;
  if (!process.env.INSIGHTS_KEY && !sync) return NextResponse.json({ error: 'INSIGHTS_KEY non configurée sur le serveur' }, { status: 503 });
  const ok = (process.env.INSIGHTS_KEY && safeEqual(req.headers.get('x-insights-key'), process.env.INSIGHTS_KEY)) || (sync && safeEqual(req.headers.get('x-sync-key'), sync));
  if (!ok) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const days = Math.min(730, Math.max(7, Number(new URL(req.url).searchParams.get('jours')) || 365));
  const since = Date.now() - days * 864e5;
  const photo = (id?: string) => (id ? `${SITE_URL}/api/logo/${id}?apercu` : undefined);
  const names = (slugs: string[]) => slugs.map((s) => getProduct(s)?.name || s);

  const reviews = (await listReviews()).filter((r) => Date.parse(r.createdAt) >= since).map((r) => ({
    date: r.createdAt.slice(0, 10), note: r.rating, texte: redact(r.text), produits: names(r.slugs), statut: r.status,
    ville: r.city, typeClient: r.company ? 'entreprise, club ou association' : 'non précisé',
    photoPubliable: r.status === 'publie' && r.showInGallery ? photo(r.photoId) : undefined, reponseAlwaan: r.reply,
  }));
  const questions = (await recent<Question>('questions', days, 1000)).map((q) => ({ date: q.at.slice(0, 10), question: q.text, page: q.page, passeALequipe: q.handoff }));
  const demandes = (await recent<Demande>('demandes', days, 500)).map((d) => ({ date: d.at.slice(0, 10), besoin: redact(d.need), typeClient: d.company ? 'entreprise' : 'non précisé' }));
  const retours = (await recent<Retour>('retours', days, 500)).map((r) => ({ date: r.at.slice(0, 10), type: r.type, canal: r.canal, texte: redact(r.text), produits: names(r.slugs), resolu: !!r.resolved, photoPubliable: r.publicPhoto ? photo(r.photoId) : undefined }));

  const prods = new Map<string, number>(), months = new Map<string, number>(), sources = new Map<string, number>();
  // Ventes par campagne (UTM), avec ou sans identifiant de clic : « google / cpc » sans gclid = vente payante sans consentement publicité.
  type Utm = { source?: string; medium?: string; campaign?: string; content?: string; term?: string };
  const camp = new Map<string, { source: string; medium: string; campagne: string; groupe: string; motCle: string; commandes: number; caHT: number; avecGclid: number; sansGclid: number }>();
  for (const k of await listKeys('commandes')) {
    const o = await getJSON<Order & { source?: string; gclid?: boolean; fbclid?: boolean; value?: number; utm?: Utm }>('commandes', k);
    if (!o || Date.parse(o.createdAt) < since) continue;
    const u = o.utm || { source: o.source };
    if (u.medium || u.campaign || o.gclid || o.fbclid) {
      const key = [u.source, u.medium, u.campaign, u.content, u.term].map((x) => x || '').join('|');
      const c = camp.get(key) || { source: u.source || (o.gclid ? 'google' : o.fbclid ? 'meta' : ''), medium: u.medium || '', campagne: u.campaign || '', groupe: u.content || '', motCle: u.term || '', commandes: 0, caHT: 0, avecGclid: 0, sansGclid: 0 };
      c.commandes++; c.caHT = Math.round((c.caHT + (o.value || 0)) * 100) / 100;
      if (o.gclid) c.avecGclid++; else c.sansGclid++;
      camp.set(key, c);
    }
    for (const s of o.slugs || []) prods.set(s, (prods.get(s) || 0) + 1);
    months.set(o.createdAt.slice(0, 7), (months.get(o.createdAt.slice(0, 7)) || 0) + 1);
    const paid = /^(cpc|ppc|paid|shopping)/i.test(o.utm?.medium || '');
    const src = o.gclid || (paid && /google/i.test(o.utm?.source || '')) ? 'Google Ads' : o.fbclid || (paid && /facebook|instagram|meta/i.test(o.utm?.source || '')) ? 'Meta Ads' : o.source || 'direct';
    sources.set(src, (sources.get(src) || 0) + 1);
  }
  const stock = await getStock();
  return NextResponse.json({
    periode: { jours: days, du: new Date(since).toISOString().slice(0, 10) }, saison: currentSeason().id,
    avis: reviews, questionsConseiller: questions, demandesDevis: demandes, retoursClients: retours,
    commandes: { parMois: Object.fromEntries([...months].sort()), parSource: Object.fromEntries(sources), parCampagne: [...camp.values()].sort((a, b) => b.caHT - a.caHT), produits: [...prods].sort((a, b) => b[1] - a[1]).map(([s, n]) => ({ produit: getProduct(s)?.name || s, slug: s, commandes: n })) },
    stockEpuise: stock.tracking ? Object.entries(stock.q).filter(([, n]) => n <= 0).map(([k]) => k) : [],
  }, { headers: { 'Cache-Control': 'no-store' } });
}
