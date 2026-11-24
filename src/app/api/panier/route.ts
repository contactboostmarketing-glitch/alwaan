import { NextResponse } from 'next/server';
import { sanitize } from '@/lib/cartSanitize';
import { limited, tooMany } from '@/lib/rateLimit';
import { saveCart } from '@/lib/savedCart';
import { publicOrigin } from '@/lib/site';

/** Maquette à faire valider : enregistre la configuration et renvoie un lien à partager (le destinataire la retrouve dans son panier). */
export async function POST(req: Request) {
  if (await limited(req, 'partage', 20, 3600)) return tooMany();
  const b = await req.json().catch(() => null);
  const lines = sanitize(b?.lines);
  if (!lines) return NextResponse.json({ error: 'Configuration incomplète.' }, { status: 400 });
  const c = await saveCart({ kind: 'partage', lines });
  return NextResponse.json({ url: `${publicOrigin(req)}/recommander/${c.id}` });
}
