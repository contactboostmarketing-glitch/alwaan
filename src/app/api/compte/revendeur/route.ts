import { NextResponse } from 'next/server';
import { customerQuery, getSession } from '@/lib/customer';
import { LOGO_ID } from '@/lib/logoStore';
import { getReseller, saveReseller } from '@/lib/reseller';
import { publicOrigin } from '@/lib/site';

/** Demande du statut revendeur (Kbis joint), validée ensuite par l'équipe. */
export async function POST(req: Request) {
  const { s } = await getSession(req, publicOrigin(req));
  if (!s) return NextResponse.json({ error: 'Connectez-vous d\'abord.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const company = String(b?.company || '').trim().slice(0, 120), siret = String(b?.siret || '').replace(/\s/g, '').slice(0, 14);
  if (!company || !/^\d{9}(\d{5})?$/.test(siret) || !LOGO_ID.test(b?.kbisId || '')) return NextResponse.json({ error: 'Société, SIRET (14 chiffres) et Kbis obligatoires.' }, { status: 400 });
  const d = await customerQuery<{ customer: { emailAddress?: { emailAddress: string } } }>(s, '{ customer { emailAddress { emailAddress } } }');
  const email = d.customer.emailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: 'Email du compte introuvable.' }, { status: 400 });
  const old = await getReseller(email);
  if (old?.status === 'valide') return NextResponse.json({ status: 'valide' });
  await saveReseller({ email, company, siret, kbisId: b.kbisId, status: 'en_attente', createdAt: new Date().toISOString() });
  return NextResponse.json({ status: 'en_attente' });
}
