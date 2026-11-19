import { NextResponse } from 'next/server';

// TODO : brancher l'envoi (email transactionnel ou CRM). Pour l'instant la demande est validée puis journalisée.
export async function POST(req: Request) {
  const d = await req.json().catch(() => null);
  if (!d?.email || !d?.name || !d?.need || !d?.rgpd) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  console.log('[devis]', { company: d.company, name: d.name, email: d.email, phone: d.phone, need: String(d.need).slice(0, 2000) });
  return NextResponse.json({ ok: true });
}
