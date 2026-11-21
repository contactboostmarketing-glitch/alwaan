import { NextResponse } from 'next/server';
import { LOGO_ID } from '@/lib/logoStore';
import { addPhoto, getPhotos } from '@/lib/qcPhotos';
import { isStaff } from '@/lib/rework';

/** Photo de contrôle d'une commande (atelier). */
export async function POST(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b?.order || !LOGO_ID.test(b?.photoId || '')) return NextResponse.json({ error: 'Photo manquante.' }, { status: 400 });
  await addPhoto(String(b.order), b.photoId);
  return NextResponse.json({ photos: await getPhotos(String(b.order)) });
}
