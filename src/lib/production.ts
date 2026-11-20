// Tableau de production : commandes payées non expédiées (Shopify), regroupées par article,
// avec la date d'expédition à tenir et le blocage tant que le client n'a pas validé un BAT retouché.
import { addBusinessDays, EXPRESS_DAYS, PRODUCTION_DAYS } from './delivery';
import { admin } from './shopifyAdmin';

type Attr = { key: string; value: string | null };
type Li = { title: string; quantity: number; variantTitle: string | null; customAttributes: Attr[]; product: { handle: string } | null };
type Ord = { id: string; name: string; createdAt: string; tags: string[]; note: string | null; lineItems: { nodes: Li[] } };

export type ProdGroup = {
  label: string; zones: string; bat?: string; logo?: string; source?: string; text?: string; rework: boolean;
  sizes: { variant: string; qty: number }[]; pieces: number;
};
export type ProdOrder = { id: string; name: string; createdAt: string; due: string; express: boolean; blocked: boolean; tags: string[]; note?: string; groups: ProdGroup[]; pieces: number };

const attr = (l: Li, k: string) => l.customAttributes.find((a) => a.key === k)?.value || undefined;

export async function productionOrders(): Promise<ProdOrder[]> {
  const since = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
  const d = await admin<{ orders: { nodes: Ord[] } }>(
    `query($q: String!) { orders(first: 100, sortKey: CREATED_AT, reverse: true, query: $q) { nodes { id name createdAt tags note
      lineItems(first: 100) { nodes { title quantity variantTitle customAttributes { key value } product { handle } } } } } }`,
    { q: `financial_status:paid fulfillment_status:unfulfilled -status:cancelled created_at:>=${since}` },
  );
  return d.orders.nodes.map((o) => {
    const groups = new Map<string, ProdGroup>();
    const express = o.lineItems.nodes.some((l) => (l.product?.handle || '').startsWith('production-express'));
    for (const l of o.lineItems.nodes) {
      const h = l.product?.handle || '';
      if (h.startsWith('marquage-') || h === 'retouche-logo' || h.startsWith('production-express')) continue; // lignes de service : déjà décrites par l'article
      const key = attr(l, 'Groupe') || l.title;
      const g = groups.get(key) ?? {
        label: key.replace(/^Article \d+ · /, ''), zones: attr(l, 'Emplacements') || '', bat: attr(l, 'Maquette validée (BAT)'),
        logo: attr(l, 'Fichier logo à imprimer') || attr(l, 'Fichier logo'), source: attr(l, 'Fichier d\'origine du client'), text: attr(l, 'Texte'),
        rework: !!attr(l, 'Retouche graphiste'), sizes: [], pieces: 0,
      };
      g.sizes.push({ variant: l.variantTitle || '', qty: l.quantity }); g.pieces += l.quantity;
      groups.set(key, g);
    }
    const list = [...groups.values()];
    const waitingBat = list.some((g) => g.rework) && !o.tags.includes('BAT-valide');
    return {
      id: o.id, name: o.name, createdAt: o.createdAt, tags: o.tags, note: o.note || undefined,
      due: addBusinessDays(new Date(o.createdAt), express ? EXPRESS_DAYS : PRODUCTION_DAYS).toISOString(), express,
      blocked: waitingBat, groups: list, pieces: list.reduce((a, g) => a + g.pieces, 0),
    };
  }).sort((a, b) => a.due.localeCompare(b.due));
}
