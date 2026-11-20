import { NextResponse } from 'next/server';
import { customerEnabled, customerQuery, getSession, type Session } from '@/lib/customer';
import { cartTotals } from '@/lib/pricing';
import { getReseller, quotesOfEmail } from '@/lib/reseller';
import { getCart } from '@/lib/savedCart';
import { publicOrigin } from '@/lib/site';

type Attr = { key: string; value: string | null };
type Order = {
  id: string; name: string; processedAt: string; financialStatus?: string; statusPageUrl?: string;
  totalPrice: { amount: string; currencyCode: string }; customAttributes?: Attr[];
  lineItems: { nodes: { title: string; quantity: number; variantTitle?: string | null; customAttributes?: Attr[] }[] };
};
const FULL = `{ customer { firstName emailAddress { emailAddress } orders(first: 30, sortKey: PROCESSED_AT, reverse: true) { nodes {
  id name processedAt financialStatus statusPageUrl totalPrice { amount currencyCode } customAttributes { key value }
  lineItems(first: 60) { nodes { title quantity variantTitle customAttributes { key value } } } } } } }`;
const LIGHT = `{ customer { firstName emailAddress { emailAddress } orders(first: 30) { nodes {
  id name processedAt statusPageUrl totalPrice { amount currencyCode } lineItems(first: 60) { nodes { title quantity } } } } } }`;

const val = (a: Attr[] | undefined, k: string) => a?.find((x) => x.key === k)?.value || undefined;
const idFrom = (url?: string) => url?.match(/\/api\/logo\/([a-f0-9]{32}\.[a-z]{2,5})/)?.[1];

/** Données de l'espace client : commandes, devis, logos, statut revendeur. */
export async function GET(req: Request) {
  if (!customerEnabled()) return NextResponse.json({ enabled: false });
  const { s, setCookieHeader } = await getSession(req, publicOrigin(req));
  if (!s) return NextResponse.json({ enabled: true, connected: false });
  type C = { customer: { firstName?: string; emailAddress?: { emailAddress: string }; orders: { nodes: Order[] } } };
  let d: C;
  try { d = await customerQuery<C>(s as Session, FULL); } catch { d = await customerQuery<C>(s as Session, LIGHT); }
  const email = d.customer.emailAddress?.emailAddress || '';
  const logos = new Map<string, { id: string; bat?: string; order: string }>();
  const orders = d.customer.orders.nodes.map((o) => {
    const items = o.lineItems.nodes.filter((l) => !/^Marquage|^Retouche|^Production express/.test(l.title));
    for (const l of o.lineItems.nodes) {
      const id = idFrom(val(l.customAttributes, 'Fichier logo à imprimer') || val(l.customAttributes, 'Fichier logo'));
      if (id && !logos.has(id)) logos.set(id, { id, bat: idFrom(val(l.customAttributes, 'Maquette validée (BAT)')), order: o.name });
    }
    return {
      id: o.id, name: o.name, date: o.processedAt, total: Number(o.totalPrice.amount), status: o.financialStatus, statusUrl: o.statusPageUrl,
      reorder: val(o.customAttributes, '_recommander'), express: val(o.customAttributes, '_express') === 'oui',
      items: items.map((l) => ({ title: l.title, quantity: l.quantity, variant: l.variantTitle || undefined })),
    };
  });
  const quotes = (await Promise.all((email ? await quotesOfEmail(email) : []).map(getCart))).filter(Boolean).map((c) => ({
    id: c!.id, number: c!.quote?.number, date: c!.createdAt, validUntil: c!.quote?.validUntil, totalHT: cartTotals(c!.lines, c!.promo, c!.express).ht,
  }));
  const r = email ? await getReseller(email) : null;
  const res = NextResponse.json({ enabled: true, connected: true, firstName: d.customer.firstName, email, orders, quotes, logos: [...logos.values()],
    reseller: r ? { status: r.status, company: r.company } : null });
  if (setCookieHeader) res.headers.append('Set-Cookie', setCookieHeader);
  return res;
}
