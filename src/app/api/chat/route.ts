import { NextResponse } from 'next/server';
import { limited, tooMany } from '@/lib/rateLimit';
import { answer, type ChatTurn } from '@/lib/supportChat';

export const maxDuration = 30;

/** Conseiller IA : la conversation entière est renvoyée à chaque message (pas d'état côté serveur). */
export async function POST(req: Request) {
  if (await limited(req, 'chat', 40, 600)) return tooMany('Beaucoup de messages : écrivez-nous plutôt sur WhatsApp.');
  const b = await req.json().catch(() => null);
  const raw: unknown[] = Array.isArray(b?.messages) ? b.messages.slice(-16) : [];
  const turns: ChatTurn[] = raw
    .filter((m): m is ChatTurn => !!m && typeof m === 'object' && ((m as ChatTurn).role === 'user' || (m as ChatTurn).role === 'assistant') && typeof (m as ChatTurn).content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1500) }))
    .filter((m) => m.content);
  // La conversation commence et se termine par un message du client.
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
  try { return NextResponse.json(await answer(turns)); }
  catch (e) {
    console.error('[chat]', e);
    return NextResponse.json({ text: 'Petit souci technique de notre côté. Écrivez à l\'équipe sur WhatsApp, on vous répond vite.', handoff: true });
  }
}
