import { NextResponse } from 'next/server';
import { sanitize } from '@/lib/cartSanitize';
import { createTeam } from '@/lib/team';

/** Crée une liste d'équipe à partir d'un article configuré (maquette validée). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const line = sanitize([{ ...(b?.line || {}), qty: { Total: 1 } }])?.[0];
  if (!line) return NextResponse.json({ error: 'Validez d\'abord votre maquette.' }, { status: 400 });
  const { qty, ...rest } = line; void qty;
  const t = await createTeam(String(b?.title || '').trim().slice(0, 80), rest);
  return NextResponse.json({ id: t.id, adminKey: t.adminKey });
}
