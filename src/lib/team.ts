// Listes d'équipe : l'acheteur partage un lien, chaque personne donne son nom, son prénom
// et sa taille pour chaque vêtement de la tenue (un ou plusieurs).
import { randomBytes } from 'crypto';
import { getJSON, putJSON } from './blobStore';
import type { LineConfig } from './pricing';

export type TeamLine = Omit<LineConfig, 'qty' | 'logo'>;
export type Member = { id: string; first: string; last: string; sizes: Record<string, string>; at: string };
export type Team = { id: string; adminKey: string; createdAt: string; title: string; lines: TeamLine[]; members: Member[]; closed?: boolean };
export const TEAM_ID = /^[a-f0-9]{24}$/;

export async function createTeam(title: string, lines: TeamLine[]): Promise<Team> {
  const t: Team = { id: randomBytes(12).toString('hex'), adminKey: randomBytes(16).toString('hex'), createdAt: new Date().toISOString(), title, lines, members: [] };
  await putJSON('equipes', t.id, t);
  return t;
}
/** Anciennes listes (un seul vêtement) converties au format multi-vêtements. */
type Legacy = Omit<Team, 'members'> & { line?: TeamLine; members: (Omit<Member, 'sizes'> & { sizes?: Record<string, string>; size?: string })[] };
export async function getTeam(id: string): Promise<Team | null> {
  if (!TEAM_ID.test(id)) return null;
  const t = await getJSON<Legacy>('equipes', id);
  if (!t) return null;
  if (!t.lines && t.line) t.lines = [t.line];
  const members: Member[] = t.members.map((m) => ({ id: m.id, first: m.first, last: m.last, at: m.at, sizes: m.sizes ?? { [t.lines[0].slug]: m.size || '' } }));
  return { ...t, members };
}
export const saveTeam = (t: Team) => putJSON('equipes', t.id, t);
