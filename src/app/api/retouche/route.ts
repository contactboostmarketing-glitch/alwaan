import { NextResponse } from 'next/server';
import { isStaff, listReworks } from '@/lib/rework';

/** Liste des dossiers de retouche (atelier). */
export async function GET(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  return NextResponse.json({ items: await listReworks() });
}
