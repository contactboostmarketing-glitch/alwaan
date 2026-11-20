import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { LOGO_TYPES, MAX_LOGO_BYTES, saveLogo } from '@/lib/logoStore';

/** Reçoit le fichier logo d'origine et renvoie son identifiant (joint ensuite à la commande). */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  if (file.size > MAX_LOGO_BYTES) return NextResponse.json({ error: 'Fichier trop lourd (15 Mo maximum).' }, { status: 413 });
  const byExt = file.name.toLowerCase().match(/\.(ai|eps|pdf|svg|png|jpe?g|webp|heic|heif|gif)$/)?.[1];
  const ext = LOGO_TYPES[file.type] ?? (byExt === 'jpeg' ? 'jpg' : byExt);
  if (!ext) return NextResponse.json({ error: 'Format non accepté. Envoyez une image, un PDF, un AI ou un EPS.' }, { status: 415 });
  const id = `${randomBytes(16).toString('hex')}.${ext}`;
  try {
    await saveLogo(id, await file.arrayBuffer(), { type: file.type || 'application/octet-stream', name: file.name.slice(0, 120) });
  } catch (e) {
    console.error('[logo]', e);
    return NextResponse.json({ error: 'Envoi impossible pour le moment. Réessayez.' }, { status: 500 });
  }
  return NextResponse.json({ id, url: `/api/logo/${id}` });
}
