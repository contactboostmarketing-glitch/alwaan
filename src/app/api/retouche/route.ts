import { NextResponse } from 'next/server';
import { isStaff, listReworks } from '@/lib/rework';
import { attachOrders, isAbandoned } from '@/lib/reworkOrders';

/** Dossiers de retouche des commandes payées ; les paniers abandonnés sont seulement comptés. */
export async function GET(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  const all = await attachOrders(await listReworks());
  const items = all.filter((r) => r.order && !r.order.cancelled);
  const pending = all.filter((r) => !r.order && !isAbandoned(r)).length;
  const abandoned = all.filter(isAbandoned);
  const last30 = abandoned.filter((r) => Date.now() - Date.parse(r.createdAt) < 30 * 864e5);
  return NextResponse.json({ items, pending, abandoned: { total: abandoned.length, last30: last30.length } });
}
