// Types des dossiers de retouche, utilisables côté navigateur (sans accès au stockage).
import type { LineConfig } from './pricing';

export type ReworkStatus = 'a_retoucher' | 'envoye' | 'valide' | 'modif';
export type ReworkItem = Pick<LineConfig, 'slug' | 'color' | 'zones' | 'text' | 'logoId' | 'logoSourceId' | 'mockupId'> & { pieces: number };
export type Proof = { logoId: string; mockups: { slug: string; mockupId: string }[]; sentAt: string; note?: string };
export type Rework = {
  id: string;
  createdAt: string;
  status: ReworkStatus;
  items: ReworkItem[];
  proof?: Proof;
  decision?: { at: string; ok: boolean; comment?: string; ip?: string };
  history: { at: string; event: string; detail?: string }[];
  order?: { id: string; name: string; email?: string; createdAt: string; cancelled?: boolean }; // commande Shopify payée qui contient ce dossier
};

export const STATUS_LABEL: Record<ReworkStatus, string> = { a_retoucher: 'À retoucher', envoye: 'Envoyé au client', valide: 'Validé : à imprimer', modif: 'Modification demandée' };
