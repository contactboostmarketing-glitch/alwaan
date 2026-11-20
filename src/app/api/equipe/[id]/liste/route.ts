import { getProduct } from '@/lib/catalog';
import { getTeam } from '@/lib/team';

/** Liste nominative pour l'atelier (tri, préparation par personne, prénoms imprimés), en CSV. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await getTeam((await params).id);
  if (!t) return new Response('Liste introuvable', { status: 404 });
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const head = ['Nom', 'Prénom', ...t.lines.map((l) => `Taille ${getProduct(l.slug)?.name}`)];
  const rows = [...t.members].sort((a, b) => a.last.localeCompare(b.last)).map((m) => [m.last, m.first, ...t.lines.map((l) => m.sizes[l.slug] || '')]);
  return new Response('﻿' + [head, ...rows].map((r) => r.map(esc).join(';')).join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `inline; filename="liste-${t.id}.csv"`, 'X-Robots-Tag': 'noindex' } });
}
