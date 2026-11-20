// Listes d'équipe : l'acheteur partage un lien, chaque personne donne son nom, son prénom et sa taille.
import { randomBytes } from 'crypto';
import { getJSON, putJSON } from './blobStore';
import type { LineConfig } from './pricing';

export type Member = { id: string; first: string; last: string; size: string; at: string };
export type Team = { id: string; adminKey: string; createdAt: string; title: string; line: Omit<LineConfig, 'qty' | 'logo'>; members: Member[]; closed?: boolean };
export const TEAM_ID = /^[a-f0-9]{24}$/;

export async function createTeam(title: string, line: Team['line']): Promise<Team> {
  const t: Team = { id: randomBytes(12).toString('hex'), adminKey: randomBytes(16).toString('hex'), createdAt: new Date().toISOString(), title, line, members: [] };
  await putJSON('equipes', t.id, t);
  return t;
}
export const getTeam = (id: string) => (TEAM_ID.test(id) ? getJSON<Team>('equipes', id) : Promise.resolve(null));
export const saveTeam = (t: Team) => putJSON('equipes', t.id, t);
