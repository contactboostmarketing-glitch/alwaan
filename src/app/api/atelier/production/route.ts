import { NextResponse } from 'next/server';
import { productionOrders } from '@/lib/production';
import { isStaff } from '@/lib/rework';

/** Commandes à produire (atelier). */
export async function GET(req: Request) {
  if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
  try { return NextResponse.json({ orders: await productionOrders() }); }
  catch (e) { return NextResponse.json({ error: `Lecture des commandes Shopify impossible : ${String((e as Error).message).slice(0, 200)}` }, { status: 502 }); }
}
