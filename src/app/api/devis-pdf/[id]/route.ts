import { quotePdf } from '@/lib/quotePdf';
import { getCart } from '@/lib/savedCart';
import { publicOrigin } from '@/lib/site';

/** Retélécharger un devis enregistré (lien de l'espace client). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCart((await params).id);
  if (!c || c.kind !== 'devis' || !c.quote) return new Response('Devis introuvable', { status: 404 });
  const pdf = await quotePdf({ number: c.quote.number, date: new Date(c.createdAt), validUntil: new Date(c.quote.validUntil), lines: c.lines, promo: c.promo, express: c.express, reseller: c.reseller, company: c.quote.company, legal: c.quote.legal, email: c.quote.email, link: `${publicOrigin(req)}/devis/${c.id}` });
  return new Response(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="devis-alwaan-${c.quote.number}.pdf"` } });
}
