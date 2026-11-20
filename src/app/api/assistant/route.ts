import { NextResponse } from 'next/server';
import { parseRequest } from '@/lib/assistantParse';

// Limite simple par adresse pour éviter les abus (mémoire de l'instance).
const hits = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'local';
  const now = Date.now(), h = hits.get(ip);
  if (h && now - h.t < 60_000 && h.n >= 10) return NextResponse.json({ error: 'Trop de demandes, réessayez dans une minute.' }, { status: 429 });
  hits.set(ip, h && now - h.t < 60_000 ? { n: h.n + 1, t: h.t } : { n: 1, t: now });

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text : '';
  if (!text.trim()) return NextResponse.json({ error: 'Décrivez votre commande en une phrase.' }, { status: 400 });
  return NextResponse.json(await parseRequest(text));
}
