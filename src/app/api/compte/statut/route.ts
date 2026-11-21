import { NextResponse } from 'next/server';
import { customerEnabled, sessionEmail } from '@/lib/customer';
import { isReseller } from '@/lib/reseller';
import { publicOrigin } from '@/lib/site';

/** Statut léger pour l'en-tête et les prix : connecté ? revendeur validé ? */
export async function GET(req: Request) {
  if (!customerEnabled()) return NextResponse.json({ connected: false, reseller: false });
  const email = await sessionEmail(req, publicOrigin(req));
  return NextResponse.json({ connected: !!email, reseller: await isReseller(email) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
