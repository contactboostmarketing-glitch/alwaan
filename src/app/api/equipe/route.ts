import { limited, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import { sanitize } from '@/lib/cartSanitize';
import { createTeam } from '@/lib/team';

/** Crée une liste d'équipe à partir d'un ou plusieurs articles configurés (maquettes validées). */
export async function POST(req: Request) {
  if (await limited(req, 'equipe', 20, 600)) return tooMany();
  const b = await req.json().catch(() => null);
  const raw = Array.isArray(b?.lines) ? b.lines : b?.line ? [b.line] : [];
  const lines = raw.length && raw.length <= 8 ? sanitize(raw.map((l: object) => ({ ...l, qty: { Total: 1 } }))) : null;
  if (!lines) return NextResponse.json({ error: 'Validez d\'abord votre maquette.' }, { status: 400 });
  const t = await createTeam(String(b?.title || '').trim().slice(0, 80), lines.map(({ qty, ...rest }) => { void qty; return rest; }));
  return NextResponse.json({ id: t.id, adminKey: t.adminKey });
}
