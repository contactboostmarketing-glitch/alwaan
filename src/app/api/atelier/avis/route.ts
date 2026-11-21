import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/rework';
import { listReviews, moderate } from '@/lib/reviews';

/** Modération des avis (atelier). */
export async function GET(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  return NextResponse.json({ items: (await listReviews()).map(({ email, code, ...r }) => ({ ...r, email: email.replace(/^(.).*(@.*)$/, '$1…$2') })) });
}
export async function POST(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (typeof b?.id !== 'string' || !['publie', 'refuse'].includes(b?.status)) return NextResponse.json({ error: 'Demande invalide.' }, { status: 400 });
  const r = await moderate(b.id, b.status, typeof b.reply === 'string' ? b.reply : undefined);
  return r ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Avis introuvable.' }, { status: 404 });
}
