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
  if (!safeEqual(req.headers.get('x-insights-key'), process.env.INSIGHTS_KEY)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
  for (const k of await listKeys('commandes')) {
    const o = await getJSON<Order & { source?: string; gclid?: boolean; fbclid?: boolean }>('commandes', k);
    if (!o || Date.parse(o.createdAt) < since) continue;
    for (const s of o.slugs || []) prods.set(s, (prods.get(s) || 0) + 1);
    months.set(o.createdAt.slice(0, 7), (months.get(o.createdAt.slice(0, 7)) || 0) + 1);
    const src = o.gclid ? 'Google Ads' : o.fbclid ? 'Meta Ads' : o.source || 'direct';
    sources.set(src, (sources.get(src) || 0) + 1);
  }
  const stock = await getStock();
  return NextResponse.json({
    periode: { jours: days, du: new Date(since).toISOString().slice(0, 10) }, saison: currentSeason().id,
    avis: reviews, questionsConseiller: questions, demandesDevis: demandes, retoursClients: retours,
    commandes: { parMois: Object.fromEntries([...months].sort()), parSource: Object.fromEntries(sources), produits: [...prods].sort((a, b) => b[1] - a[1]).map(([s, n]) => ({ produit: getProduct(s)?.name || s, slug: s, commandes: n })) },
    stockEpuise: stock.tracking ? Object.entries(stock.q).filter(([, n]) => n <= 0).map(([k]) => k) : [],
  }, { headers: { 'Cache-Control': 'no-store' } });
}
