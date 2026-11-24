import { limited, tooMany } from '@/lib/rateLimit';
import { safeEqual } from '@/lib/secure';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getProduct, sizesFor } from '@/lib/catalog';
import { getTeam, saveTeam } from '@/lib/team';

type Ctx = { params: Promise<{ id: string }> };
const sizesOf = (slug: string) => sizesFor(getProduct(slug)!);

/** Vue d'une liste : publique (sans les noms) ou acheteur (avec ?cle=). */
export async function GET(req: Request, { params }: Ctx) {
  const t = await getTeam((await params).id);
  if (!t) return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  const admin = safeEqual(new URL(req.url).searchParams.get('cle'), t.adminKey);
  return NextResponse.json({
    id: t.id, title: t.title, closed: !!t.closed, count: t.members.length,
    lines: t.lines.map((l) => ({ ...l, sizes: sizesOf(l.slug) })),
    ...(admin ? { admin: true, members: t.members } : {}),
  });
}

/** Ajout d'une personne (lien partagé), ou actions de l'acheteur (clôturer, retirer, renommer). */
export async function POST(req: Request, { params }: Ctx) {
  if (await limited(req, 'equipe-reponse', 60, 600)) return tooMany();
  const t = await getTeam((await params).id);
  if (!t) return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  const b = await req.json().catch(() => null);
  if (typeof b?.cle === 'string' && safeEqual(b.cle, t.adminKey)) {
    if (typeof b.closed === 'boolean') t.closed = b.closed;
    if (typeof b.remove === 'string') t.members = t.members.filter((m) => m.id !== b.remove);
    if (typeof b.title === 'string') t.title = b.title.trim().slice(0, 80);
    await saveTeam(t);
    return NextResponse.json({ ok: true, members: t.members, closed: !!t.closed });
  }
  if (t.closed) return NextResponse.json({ error: 'La liste est close.' }, { status: 409 });
  const first = String(b?.first || '').trim().slice(0, 40), last = String(b?.last || '').trim().slice(0, 60);
  const sizes: Record<string, string> = {};
  for (const l of t.lines) { const s = String(b?.sizes?.[l.slug] || ''); if (sizesOf(l.slug).includes(s)) sizes[l.slug] = s; }
  if (!first || !last || Object.keys(sizes).length !== t.lines.length) return NextResponse.json({ error: 'Nom, prénom et taille obligatoires.' }, { status: 400 });
  if (t.members.length >= 1000) return NextResponse.json({ error: 'Liste complète.' }, { status: 409 });
  t.members.push({ id: randomBytes(6).toString('hex'), first, last, sizes, at: new Date().toISOString() });
  await saveTeam(t);
  return NextResponse.json({ ok: true });
}
