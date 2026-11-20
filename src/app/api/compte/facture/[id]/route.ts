import { customerQuery, getSession } from '@/lib/customer';
import { invoicePdf } from '@/lib/invoicePdf';
import { publicOrigin } from '@/lib/site';

/** Facture d'une commande du client connecté (on vérifie d'abord que la commande lui appartient). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const num = (await params).id.replace(/\D/g, '');
  const { s } = await getSession(req, publicOrigin(req));
  if (!s) return new Response('Connectez-vous', { status: 401 });
  const d = await customerQuery<{ customer: { orders: { nodes: { id: string }[] } } }>(s, '{ customer { orders(first: 100) { nodes { id } } } }');
  const own = d.customer.orders.nodes.find((o) => o.id.endsWith(`/${num}`));
  if (!own) return new Response('Commande introuvable', { status: 404 });
  try {
    const { pdf, name } = await invoicePdf(`gid://shopify/Order/${num}`);
    return new Response(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="facture-alwaan-${name}.pdf"` } });
  } catch (e) { return new Response(`Facture indisponible : ${(e as Error).message}`, { status: 502 }); }
}
