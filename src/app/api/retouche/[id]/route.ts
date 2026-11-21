import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { LOGO_ID } from '@/lib/logoStore';
import { getRework, isStaff, saveRework } from '@/lib/rework';
import { attachOrders, tagOrder } from '@/lib/reworkOrders';

type Ctx = { params: Promise<{ id: string }> };

/** Dossier vu par le client (lien /bat/<id>) ou par l'atelier (avec la clé). */
export async function GET(req: Request, { params }: Ctx) {
  const r = await getRework((await params).id);
  if (!r) return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  if (await isStaff(req)) { await attachOrders([r]); return NextResponse.json(r); }
  // Le client ne voit que ce qui le concerne, sans l'historique interne.
  const { decision, ...rest } = r;
  return NextResponse.json({ id: rest.id, status: rest.status, items: rest.items, proof: rest.proof, decision: decision && { at: decision.at, ok: decision.ok, comment: decision.comment } });
}

export async function POST(req: Request, { params }: Ctx) {
  const r = await getRework((await params).id);
  if (!r) return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  const b = await req.json().catch(() => null);
  const now = new Date().toISOString();

  // Atelier : dépôt du logo retravaillé et des nouvelles maquettes.
  if (b?.action === 'proof') {
    if (!(await isStaff(req))) return NextResponse.json({ error: 'Clé atelier incorrecte.' }, { status: 401 });
    if (r.status === 'valide') return NextResponse.json({ error: 'Déjà validé par le client.' }, { status: 409 });
    const mockups = (Array.isArray(b.mockups) ? b.mockups : [])
      .filter((m: { slug?: string; mockupId?: string }) => getProduct(m?.slug || '') && LOGO_ID.test(m?.mockupId || ''))
      .map((m: { slug: string; mockupId: string }) => ({ slug: m.slug, mockupId: m.mockupId }));
    if (!LOGO_ID.test(b.logoId || '') || !mockups.length) return NextResponse.json({ error: 'Logo ou maquettes manquants.' }, { status: 400 });
    r.proof = { logoId: b.logoId, mockups, sentAt: now, note: typeof b.note === 'string' ? b.note.slice(0, 300) : undefined };
    r.status = 'envoye';
    r.decision = undefined;
    r.history.push({ at: now, event: 'Maquette retouchée envoyée au client' });
    await attachOrders([r]);
    await saveRework(r);
    await tagOrder(r);
    return NextResponse.json(r);
  }

  // Client : validation ou demande de modification (une seule réponse par maquette envoyée).
  if (b?.action === 'decide') {
    if (r.status !== 'envoye') return NextResponse.json({ error: r.status === 'valide' ? 'Maquette déjà validée.' : 'Aucune maquette en attente.' }, { status: 409 });
    const ok = b.ok === true;
    const comment = typeof b.comment === 'string' ? b.comment.trim().slice(0, 1000) : '';
    if (!ok && !comment) return NextResponse.json({ error: 'Dites-nous ce qu\'il faut changer.' }, { status: 400 });
    const ip = (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim().slice(0, 64);
    r.decision = { at: now, ok, comment: comment || undefined, ip };
    r.status = ok ? 'valide' : 'modif';
    r.history.push({ at: now, event: ok ? 'Maquette validée par le client (bon à tirer)' : 'Modification demandée par le client', detail: comment || undefined });
    await saveRework(r);
    await tagOrder(r);
    return NextResponse.json({ status: r.status });
  }
  return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
}
