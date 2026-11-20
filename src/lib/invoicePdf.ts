// Facture PDF d'une commande Shopify (numéro = numéro de commande, séquentiel), mentions légales du vendeur.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { admin } from './shopifyAdmin';
import { COMPANY } from './site';

const clean = (s: string) => s.replace(/[  ]/g, ' ').replace(/[–—]/g, '-').replace(/[’]/g, "'").replace(/[^\x20-\x7e -ÿ€œŒ×•]/g, '');
const eur = (n: number) => clean(n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }));
type Money = { shopMoney: { amount: string } };
type AdminOrder = {
  name: string; createdAt: string; currentSubtotalPriceSet: Money; currentTotalTaxSet: Money; totalShippingPriceSet: Money; currentTotalPriceSet: Money; totalDiscountsSet: Money;
  billingAddress?: { company?: string | null; name?: string | null; address1?: string | null; address2?: string | null; zip?: string | null; city?: string | null; country?: string | null } | null;
  lineItems: { nodes: { title: string; variantTitle: string | null; quantity: number; originalUnitPriceSet: Money; originalTotalSet: Money }[] };
};
const FIELDS = (addr: boolean) => `name createdAt currentSubtotalPriceSet { shopMoney { amount } } currentTotalTaxSet { shopMoney { amount } }
  totalShippingPriceSet { shopMoney { amount } } currentTotalPriceSet { shopMoney { amount } } totalDiscountsSet { shopMoney { amount } }
  ${addr ? 'billingAddress { company name address1 address2 zip city country }' : ''}
  lineItems(first: 100) { nodes { title variantTitle quantity originalUnitPriceSet { shopMoney { amount } } originalTotalSet { shopMoney { amount } } } }`;

export async function invoicePdf(orderGid: string): Promise<{ pdf: Uint8Array; name: string }> {
  const q = (addr: boolean) => admin<{ order: AdminOrder | null }>(`query($id: ID!) { order(id: $id) { ${FIELDS(addr)} } }`, { id: orderGid });
  // L'adresse relève des données client protégées : sans accès, la facture sort sans adresse.
  const o = (await q(true).catch(() => q(false))).order;
  if (!o) throw new Error('Commande introuvable');
  const n = (m: Money) => Number(m.shopMoney.amount);
  const doc = await PDFDocument.create();
  doc.setTitle(`Facture ${o.name}`); doc.setAuthor(COMPANY.name);
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.13, 0.25), muted = rgb(0.4, 0.45, 0.55);
  let page = doc.addPage([595, 842]); let y = 790;
  const text = (s: string, x: number, size = 10, f = font, color = ink) => page.drawText(clean(s), { x, y, size, font: f, color });
  const right = (s: string, xr: number, size = 10, f = font) => { const t = clean(s); page.drawText(t, { x: xr - f.widthOfTextAtSize(t, size), y, size, font: f, color: ink }); };
  text(COMPANY.brand, 40, 22, bold); right(`FACTURE ${o.name.replace('#', 'N° ')}`, 555, 14, bold); y -= 16;
  for (const l of [`${COMPANY.name} · ${COMPANY.legalForm}${COMPANY.capital ? ` au capital de ${COMPANY.capital}` : ''}`, COMPANY.address, `SIRET ${COMPANY.siret} · ${COMPANY.rcs}`, `TVA ${COMPANY.vat}`]) { text(l, 40, 9, font, muted); y -= 12; }
  y = 758; right(`Date : ${new Date(o.createdAt).toLocaleDateString('fr-FR')}`, 555, 9);
  y = 690;
  const b = o.billingAddress;
  if (b) { text('Facturé à', 40, 9, bold, muted); y -= 13; for (const l of [b.company, b.name, b.address1, b.address2, [b.zip, b.city].filter(Boolean).join(' '), b.country].filter(Boolean) as string[]) { text(l, 40, 10); y -= 12; } y -= 10; }
  page.drawRectangle({ x: 40, y: y - 6, width: 515, height: 20, color: rgb(0.95, 0.96, 0.98) });
  text('Désignation', 46, 9, bold); right('Qté', 400, 9, bold); right('PU HT', 475, 9, bold); right('Total HT', 550, 9, bold); y -= 22;
  for (const l of o.lineItems.nodes) {
    if (y < 140) { page = doc.addPage([595, 842]); y = 790; }
    text(`${l.title}${l.variantTitle ? ` · ${l.variantTitle}` : ''}`.slice(0, 70), 46, 9); right(String(l.quantity), 400, 9); right(eur(n(l.originalUnitPriceSet)), 475, 9); right(eur(n(l.originalTotalSet)), 550, 9); y -= 14;
  }
  y -= 6; page.drawLine({ start: { x: 300, y: y + 6 }, end: { x: 555, y: y + 6 }, thickness: 0.6, color: muted }); y -= 8;
  const row = (label: string, v: string, bb = false) => { text(label, 320, 10, bb ? bold : font); right(v, 550, bb ? 12 : 10, bb ? bold : font); y -= bb ? 18 : 14; };
  if (n(o.totalDiscountsSet)) row('Remises', `-${eur(n(o.totalDiscountsSet))}`);
  row('Sous-total HT', eur(n(o.currentSubtotalPriceSet)));
  row('Livraison HT', eur(n(o.totalShippingPriceSet)));
  row('TVA', eur(n(o.currentTotalTaxSet)));
  row('Total TTC', eur(n(o.currentTotalPriceSet)), true);
  y -= 10; text('Facture acquittée : paiement reçu à la commande.', 40, 9, font, muted); y -= 12;
  text('Pas d\'escompte pour paiement anticipé. Pénalités de retard : taux légal ; indemnité forfaitaire de recouvrement : 40 € (professionnels).', 40, 7.5, font, muted);
  return { pdf: await doc.save(), name: o.name.replace('#', '') };
}
