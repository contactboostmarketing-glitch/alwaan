import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/rework';
import { getStock, setStock } from '@/lib/stock';

/** Stock atelier : lecture publique (disponibilités affichées au client), saisie réservée à l'atelier. */
export async function GET() {
  return NextResponse.json(await getStock(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
export async function POST(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b?.changes || typeof b.changes !== 'object') return NextResponse.json({ error: 'Rien à enregistrer.' }, { status: 400 });
  return NextResponse.json(await setStock(b.changes));
}
