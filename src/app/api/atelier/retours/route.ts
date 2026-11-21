import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { RETOUR_CANAUX, RETOUR_TYPES, addRetour, recent, type Retour } from '@/lib/feedback';
import { getJSON, putJSON } from '@/lib/blobStore';
import { isStaff } from '@/lib/rework';

/** Carnet des retours clients (atelier) : litiges, messages WhatsApp ou email, appels, suggestions, photos. */
export async function GET(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  return NextResponse.json({ items: await recent<Retour>('retours', 730, 300) });
}
export async function POST(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (b?.action === 'resolu' && typeof b.id === 'string') {
    const r = await getJSON<Retour>('retours', b.id);
    if (r) { r.resolved = !r.resolved; await putJSON('retours', r.id, r); }
    return NextResponse.json({ ok: true });
  }
  const type = RETOUR_TYPES.find((t) => t === b?.type), canal = RETOUR_CANAUX.find((c) => c === b?.canal);
  const text = typeof b?.text === 'string' ? b.text.trim() : '';
  if (!type || !canal || text.length < 3) return NextResponse.json({ error: 'Type, canal et texte obligatoires.' }, { status: 400 });
  const slugs = (Array.isArray(b?.slugs) ? b.slugs : []).filter((s: string) => getProduct(s)).slice(0, 5);
  const photoId = typeof b?.photoId === 'string' && /^[a-f0-9]{32}\.[a-z]{2,5}$/.test(b.photoId) ? b.photoId : undefined;
  return NextResponse.json(await addRetour({ type, canal, text, slugs, photoId, publicPhoto: !!photoId && b?.publicPhoto === true }));
}
