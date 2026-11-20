// Devis PDF généré depuis le panier : numéro, validité 30 jours, détail des lignes, conditions,
// et lien pour reprendre le devis et payer en ligne (carte ou virement).
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { COLOR_NAMES, REWORK_FEE, getProduct, zonesFor } from './catalog';
import { cartTotals, pools, qtyOf, reworkLogos, unitPrice, type LineConfig } from './pricing';

// Polices standard PDF (WinAnsi) : on remplace les caractères qu'elles ne savent pas écrire.
const clean = (s: string) => s.replace(/[  ]/g, ' ').replace(/[–—]/g, '-').replace(/[’]/g, "'").replace(/[^\x20-\x7e -ÿ€œŒ×•]/g, '');
const eur = (n: number) => clean(n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }));

export const COMPANY = {
  name: process.env.COMPANY_NAME || 'alwaan',
  address: process.env.COMPANY_ADDRESS || '',
  siret: process.env.COMPANY_SIRET || '',
  vat: process.env.COMPANY_VAT || '',
  email: process.env.COMPANY_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_PHONE || '',
  iban: process.env.COMPANY_IBAN || '',
};

export async function quotePdf(o: { number: string; date: Date; validUntil: Date; lines: LineConfig[]; promo?: string | null; company?: string; email?: string; link: string }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Devis ${o.number}`); doc.setAuthor(COMPANY.name);
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.13, 0.25), muted = rgb(0.4, 0.45, 0.55), pink = rgb(0.82, 0.18, 0.49);
  let page = doc.addPage([595, 842]);
  let y = 790;
  const text = (s: string, x: number, size = 10, f = font, color = ink) => page.drawText(clean(s), { x, y, size, font: f, color });
  const right = (s: string, xr: number, size = 10, f = font) => { const t = clean(s); page.drawText(t, { x: xr - f.widthOfTextAtSize(t, size), y, size, font: f, color: ink }); };
  const newPageIfNeeded = (h: number) => { if (y - h < 90) { page = doc.addPage([595, 842]); y = 790; } };

  text(COMPANY.name, 40, 22, bold); right(`DEVIS ${o.number}`, 555, 14, bold); y -= 16;
  for (const l of [COMPANY.address, COMPANY.siret && `SIRET ${COMPANY.siret}`, COMPANY.vat && `TVA ${COMPANY.vat}`, COMPANY.email, COMPANY.phone].filter(Boolean) as string[]) { text(l, 40, 9, font, muted); y -= 12; }
  y = 758; right(`Date : ${o.date.toLocaleDateString('fr-FR')}`, 555, 9); y -= 12; right(`Valable jusqu'au ${o.validUntil.toLocaleDateString('fr-FR')}`, 555, 9);
  y = 700;
  if (o.company || o.email) { text('Client', 40, 9, bold, muted); y -= 13; if (o.company) { text(o.company, 40, 11, bold); y -= 13; } if (o.email) { text(o.email, 40, 9); y -= 13; } y -= 8; }

  // En-tête du tableau
  page.drawRectangle({ x: 40, y: y - 6, width: 515, height: 20, color: rgb(0.95, 0.96, 0.98) });
  text('Article', 46, 9, bold); right('Qté', 400, 9, bold); right('PU HT', 475, 9, bold); right('Total HT', 550, 9, bold); y -= 24;
  const pool = pools(o.lines);
  o.lines.forEach((l, i) => {
    const p = getProduct(l.slug)!, q = qtyOf(l), u = unitPrice(l, pool[i]);
    const zones = zonesFor(p).filter((z) => l.zones.includes(z.id)).map((z) => `${z.name} ${z.size}`).join(' + ');
    const sizes = Object.entries(l.qty).filter(([, v]) => v).map(([s, v]) => `${s} x${v}`).join(', ');
    newPageIfNeeded(46);
    text(`${p.name} · ${COLOR_NAMES[l.color] || ''}`, 46, 10, bold); right(String(q), 400); right(eur(u), 475); right(eur(u * q), 550); y -= 13;
    text(`Marquage DTF : ${zones}${l.text ? ` · texte « ${l.text} »` : ''}`, 46, 8.5, font, muted); y -= 11;
    text(`Tailles : ${sizes}`, 46, 8.5, font, muted); y -= 16;
  });
  const t = cartTotals(o.lines, o.promo);
  if (reworkLogos(o.lines).length) { newPageIfNeeded(20); text('Retouche du logo par notre graphiste', 46, 10); right(String(reworkLogos(o.lines).length), 400); right(eur(REWORK_FEE), 475); right(eur(t.rework), 550); y -= 18; }
  page.drawLine({ start: { x: 300, y: y + 6 }, end: { x: 555, y: y + 6 }, thickness: 0.6, color: muted }); y -= 8;
  const row = (label: string, v: string, b = false) => { newPageIfNeeded(16); text(label, 320, 10, b ? bold : font); right(v, 550, b ? 12 : 10, b ? bold : font); y -= b ? 18 : 14; };
  row('Sous-total HT', eur(t.goods));
  if (t.discount) row(`Code ${o.promo}`, `-${eur(t.discount)}`);
  row('Livraison HT', t.shipping ? eur(t.shipping) : 'Offerte');
  row('Total HT', eur(t.ht), true);
  row('TVA 20 %', eur(t.vat));
  row('Total TTC', eur(t.ttc), true);
  if (t.saved > 0.5) { text(`Remise quantité incluse : ${eur(t.saved)}`, 320, 9, font, pink); y -= 14; }

  y -= 14; newPageIfNeeded(120);
  text('Conditions', 40, 10, bold); y -= 14;
  for (const c of [
    'Paiement à la commande par carte bancaire ou par virement. La production démarre à réception du paiement.',
    'Production en 7 jours ouvrés après paiement et validation de la maquette (bon à tirer), puis livraison en France et en Belgique.',
    'Articles personnalisés : pas de droit de rétractation (art. L221-28 3° du Code de la consommation). Un défaut d\'impression est refait à nos frais.',
    ...(COMPANY.iban ? [`Virement : IBAN ${COMPANY.iban}, référence ${o.number}.`] : []),
  ]) { for (const part of wrap(c, 105)) { text(part, 40, 8.5, font, muted); y -= 11; } y -= 3; }
  y -= 8; text('Commander ce devis en ligne :', 40, 10, bold); y -= 13; text(o.link, 40, 9, font, pink);
  return doc.save();
}

function wrap(s: string, n: number): string[] {
  const out: string[] = []; let cur = '';
  for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
