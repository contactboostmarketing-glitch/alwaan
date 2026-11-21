import { NextResponse } from 'next/server';
import { runRelances } from '@/lib/relance';
import { safeEqual } from '@/lib/secure';

/** Appelé toutes les heures par la fonction planifiée Netlify (netlify/functions/relances.mts). */
export const maxDuration = 60;
export async function POST(req: Request) {
  if (!safeEqual(req.headers.get('x-sync-key'), process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY)) return new Response('Non autorisé', { status: 401 });
  return NextResponse.json({ ok: true, offres: await runRelances() });
}
