import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/rework';
import { getReseller, listResellers, saveReseller } from '@/lib/reseller';

/** Demandes revendeur : liste et décision (atelier). */
export async function GET(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  return NextResponse.json({ items: await listResellers() });
}
export async function POST(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const r = b?.email && await getReseller(String(b.email));
  if (!r || !['valide', 'refuse'].includes(b.decision)) return NextResponse.json({ error: 'Demande introuvable.' }, { status: 400 });
  r.status = b.decision; r.decidedAt = new Date().toISOString(); r.note = typeof b.note === 'string' ? b.note.slice(0, 300) : undefined;
  await saveReseller(r);
  return NextResponse.json(r);
}
