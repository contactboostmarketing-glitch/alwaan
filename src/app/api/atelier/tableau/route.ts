import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { getJSON, listKeys } from '@/lib/blobStore';
import type { Relance } from '@/lib/relance';
import { isStaff } from '@/lib/rework';
import { publishedReviews, stats, type Order } from '@/lib/reviews';
import { getStock, STOCK_ALERT } from '@/lib/stock';

type Row = Order & { source?: string; campaign?: string; gclid?: boolean; fbclid?: boolean };

/** Tableau de bord : ventes (commandes payées), sources, produits, avis, relances, stock bas. */
export const maxDuration = 60;
export async function GET(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const orders: Row[] = [];
  for (const k of await listKeys('commandes')) { const o = await getJSON<Row>('commandes', k); if (o) orders.push(o); }
  const now = Date.now(), DAY = 864e5;
  const sum = (l: Row[]) => Math.round(l.reduce((a, o) => a + (o.value || 0), 0) * 100) / 100;
  const inRange = (from: number, to: number) => orders.filter((o) => { const t = now - Date.parse(o.createdAt); return t >= from * DAY && t < to * DAY; });
  const last30 = inRange(0, 30), prev30 = inRange(30, 60);
  const months = new Map<string, { ht: number; n: number }>();
  for (const o of orders) { const m = o.createdAt.slice(0, 7); const x = months.get(m) || { ht: 0, n: 0 }; x.ht += o.value || 0; x.n++; months.set(m, x); }
  const sources = new Map<string, { ht: number; n: number }>();
  for (const o of orders) { const s = o.gclid ? 'Google Ads' : o.fbclid ? 'Meta Ads' : o.source || 'direct'; const x = sources.get(s) || { ht: 0, n: 0 }; x.ht += o.value || 0; x.n++; sources.set(s, x); }
  const prods = new Map<string, number>();
  for (const o of orders) for (const s of o.slugs || []) prods.set(s, (prods.get(s) || 0) + 1);
  const emails = new Map<string, number>();
  for (const o of orders) if (o.email) emails.set(o.email, (emails.get(o.email) || 0) + 1);
  const relances: Relance[] = [];
  for (const k of await listKeys('relances')) { const r = await getJSON<Relance>('relances', k); if (r) relances.push(r); }
  const rv = stats(await publishedReviews());
  const stock = await getStock();
  return NextResponse.json({
    total: { ht: sum(orders), n: orders.length, aov: orders.length ? Math.round((sum(orders) / orders.length) * 100) / 100 : 0 },
    last30: { ht: sum(last30), n: last30.length }, prev30: { ht: sum(prev30), n: prev30.length },
    repeatRate: emails.size ? Math.round(([...emails.values()].filter((n) => n > 1).length / emails.size) * 100) : 0,
    months: [...months].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12).map(([m, x]) => ({ m, ht: Math.round(x.ht * 100) / 100, n: x.n })),
    sources: [...sources].sort((a, b) => b[1].ht - a[1].ht).map(([s, x]) => ({ s, ht: Math.round(x.ht * 100) / 100, n: x.n })),
    products: [...prods].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s, n]) => ({ name: getProduct(s)?.name || s, n })),
    relances: { total: relances.length, offres: relances.filter((r) => r.step === 2).length, commandes: relances.filter((r) => r.done === 'commande').length },
    reviews: { count: rv.count, avg: rv.avg },
    lowStock: Object.entries(stock.q).filter(([, n]) => n <= STOCK_ALERT).length,
  });
}
