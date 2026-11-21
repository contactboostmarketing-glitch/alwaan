import { limited, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import { getProduct, zonesFor } from '@/lib/catalog';
import { sessionEmail } from '@/lib/customer';
import { LOGO_ID } from '@/lib/logoStore';
import { addShopToOwner, getShop, saveShop, slugify, type ShopItem } from '@/lib/shops';
import { publicOrigin } from '@/lib/site';

/** Création d'une boutique par un client connecté. */
export async function POST(req: Request) {
  if (await limited(req, 'boutique', 20, 600)) return tooMany();
  const email = await sessionEmail(req, publicOrigin(req));
  if (!email) return NextResponse.json({ error: 'Connectez-vous d\'abord.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const name = String(b?.name || '').trim().slice(0, 60);
  const items: ShopItem[] = (Array.isArray(b?.items) ? b.items : []).slice(0, 12).filter((i: ShopItem) => {
    const p = getProduct(i?.slug);
    return p && p.colors.includes(i.color) && Array.isArray(i.zones) && i.zones.length && i.zones.every((z) => zonesFor(p).some((x) => x.id === z)) && LOGO_ID.test(i.mockupId || '');
  }).map((i: ShopItem) => ({ slug: i.slug, color: i.color, zones: i.zones, mockupId: i.mockupId }));
  if (!name || !LOGO_ID.test(b?.logoId || '') || !items.length) return NextResponse.json({ error: 'Nom, logo et au moins un article obligatoires.' }, { status: 400 });
  let slug = slugify(name) || 'boutique';
  for (let i = 2; await getShop(slug); i++) slug = `${slugify(name)}-${i}`;
  await saveShop({ slug, name, ownerEmail: email.toLowerCase(), logoId: b.logoId, items, createdAt: new Date().toISOString(), active: true, stats: { orders: 0, revenueHT: 0, commission: 0, pending: 0 } });
  await addShopToOwner(email, slug);
  return NextResponse.json({ slug });
}
