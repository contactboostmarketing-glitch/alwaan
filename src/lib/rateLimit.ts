// Limitation des tentatives répétées, partagée entre toutes les instances (Netlify Blobs).
// Une entrée par adresse IP et par usage : nombre d'essais dans la fenêtre en cours.
import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getJSON, putJSON } from './blobStore';

export const clientIp = (req: Request) =>
  (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim().slice(0, 64);

type Hit = { n: number; start: number };
const keyOf = (bucket: string, ip: string) => `${bucket}-${createHash('sha256').update(ip).digest('hex').slice(0, 24)}`;

/** Compte un essai. Renvoie false si la limite (max essais par fenêtre) est déjà atteinte. */
export async function hit(req: Request, bucket: string, max: number, windowSec: number): Promise<boolean> {
  const k = keyOf(bucket, clientIp(req)), now = Date.now();
  try {
    const h = await getJSON<Hit>('limites', k);
    const fresh = !h || now - h.start > windowSec * 1000;
    if (!fresh && h!.n >= max) return false;
    await putJSON('limites', k, fresh ? { n: 1, start: now } : { n: h!.n + 1, start: h!.start });
  } catch { /* stockage indisponible : on ne bloque pas le client */ }
  return true;
}
/** L'adresse est-elle bloquée (sans compter d'essai) ? */
export async function blocked(req: Request, bucket: string, max: number, windowSec: number): Promise<boolean> {
  try {
    const h = await getJSON<Hit>('limites', keyOf(bucket, clientIp(req)));
    return !!h && Date.now() - h.start <= windowSec * 1000 && h.n >= max;
  } catch { return false; }
}
export const tooMany = (msg = 'Trop de tentatives. Réessayez dans quelques minutes.') => NextResponse.json({ error: msg }, { status: 429 });

/** Raccourci : vrai si la requête dépasse la limite (et doit recevoir tooMany()). */
export const limited = async (req: Request, bucket: string, max: number, windowSec: number) => !(await hit(req, bucket, max, windowSec));
