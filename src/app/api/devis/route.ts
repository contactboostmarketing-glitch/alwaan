import { NextResponse } from 'next/server';
import { addDemande } from '@/lib/feedback';
import { atelierEmail, esc, layout, sendMail } from '@/lib/mail';
import { limited, tooMany } from '@/lib/rateLimit';
import { adminEnabled, upsertProspect } from '@/lib/shopifyAdmin';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
const clean = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/** Demande de devis : enregistrée, envoyée à l'atelier par email, et le prospect est créé dans Shopify. */
export async function POST(req: Request) {
  if (await limited(req, 'devis-form', 10, 3600)) return tooMany();
  const d = await req.json().catch(() => null);
  const email = clean(d?.email, 190).toLowerCase(), name = clean(d?.name, 80), need = clean(d?.need, 3000);
  if (!EMAIL.test(email) || !name || !need || !d?.rgpd) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  const company = clean(d?.company, 120) || undefined, phone = clean(d?.phone, 30) || undefined;
  await addDemande({ company, name, email, phone, need });
  await sendMail({
    to: atelierEmail(), replyTo: email, subject: `Demande de devis : ${company || name}`,
    html: layout({ title: 'Nouvelle demande de devis', intro: esc(need).replace(/\n/g, '<br>'), rows: [esc(`${name}${company ? ` · ${company}` : ''}`), esc(email), phone ? esc(phone) : ''].filter(Boolean) }),
  }).catch((e) => console.error('[devis mail]', e));
  if (adminEnabled()) await upsertProspect({ email, marketing: false, tags: ['demande-devis'], note: `Demande de devis du ${new Date().toLocaleDateString('fr-FR')} :\n${need}${phone ? `\nTél. ${phone}` : ''}` }).catch((e) => console.error('[devis crm]', e));
  return NextResponse.json({ ok: true });
}
