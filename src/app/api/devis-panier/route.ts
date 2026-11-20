import { NextResponse } from 'next/server';
import { PROMO_CODES } from '@/lib/catalog';
import { sanitize } from '@/lib/cartSanitize';
import { quotePdf } from '@/lib/quotePdf';
import { saveCart } from '@/lib/savedCart';
import { publicOrigin } from '@/lib/site';
import { sessionEmail } from '@/lib/customer';
import { addQuoteToEmail, isReseller } from '@/lib/reseller';

/** Devis PDF du panier, enregistré pour être repris et payé en ligne (/devis/<id>). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const lines = sanitize(b?.lines);
  if (!lines) return NextResponse.json({ error: 'Validez la maquette de chaque article avant de demander le devis.' }, { status: 400 });
  const promo = b?.promo && PROMO_CODES[String(b.promo).toUpperCase()] ? String(b.promo).toUpperCase() : null;
  const company = typeof b?.company === 'string' ? b.company.trim().slice(0, 80) : '';
  const email = typeof b?.email === 'string' && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(b.email.trim()) ? b.email.trim().slice(0, 120) : '';
  const express = b?.express === true;
  const customerEmail = await sessionEmail(req, publicOrigin(req));
  const reseller = await isReseller(customerEmail);
  const now = new Date(), validUntil = new Date(now.getTime() + 30 * 864e5);
  const number = `D${now.toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const saved = await saveCart({ kind: 'devis', lines, promo, express, reseller, quote: { number, company: company || undefined, email: email || undefined, validUntil: validUntil.toISOString() } });
  const quoteEmail = email || customerEmail || '';
  if (quoteEmail) await addQuoteToEmail(quoteEmail, saved.id);
  const pdf = await quotePdf({ number, date: now, validUntil, lines, promo, express, reseller, company, email: quoteEmail, link: `${publicOrigin(req)}/devis/${saved.id}` });
  return new Response(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="devis-alwaan-${number}.pdf"`, 'X-Devis-Id': saved.id } });
}
