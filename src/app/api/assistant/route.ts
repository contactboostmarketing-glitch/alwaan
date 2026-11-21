import { limited, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import { parseRequest } from '@/lib/assistantParse';


export async function POST(req: Request) {
  if (await limited(req, 'assistant', 15, 60)) return tooMany('Trop de demandes, réessayez dans une minute.');

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text : '';
  if (!text.trim()) return NextResponse.json({ error: 'Décrivez votre commande en une phrase.' }, { status: 400 });
  return NextResponse.json(await parseRequest(text));
}
