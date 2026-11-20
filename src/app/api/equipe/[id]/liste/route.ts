import { getTeam } from '@/lib/team';

/** Liste nominative pour l'atelier (tri et prénoms imprimés), en tableau CSV. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await getTeam((await params).id);
  if (!t) return new Response('Liste introuvable', { status: 404 });
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = [['Nom', 'Prénom', 'Taille'], ...[...t.members].sort((a, b) => a.size.localeCompare(b.size) || a.last.localeCompare(b.last)).map((m) => [m.last, m.first, m.size])];
  return new Response('﻿' + rows.map((r) => r.map(esc).join(';')).join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `inline; filename="liste-${t.id}.csv"`, 'X-Robots-Tag': 'noindex' } });
}
