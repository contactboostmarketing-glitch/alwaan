import { NextResponse } from 'next/server';
import { getJSON } from '@/lib/blobStore';
import type { Draft } from '../route';

/** Reprise d'une demande sauvegardée (lien envoyé par email). L'email n'est pas renvoyé. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return NextResponse.json({ error: 'Lien invalide.' }, { status: 404 });
  const d = await getJSON<Draft>('brouillons', id);
  if (!d) return NextResponse.json({ error: 'Cette demande n\'existe plus.' }, { status: 404 });
  const { email: _e, marketing: _m, ...rest } = d; // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.json(rest);
}
