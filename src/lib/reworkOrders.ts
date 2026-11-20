// Rattache les dossiers de retouche aux commandes Shopify (droits read_orders / write_orders).
// Un dossier sans commande = client arrivé au paiement sans payer : il ne compte que pour les statistiques.
import { admin, adminEnabled } from './shopifyAdmin';
import { REWORK_ID, saveRework, type Rework } from './rework';

type OrderNode = {
  id: string; name: string; createdAt: string; cancelledAt: string | null; email?: string | null;
  lineItems: { nodes: { customAttributes: { key: string; value: string | null }[] }[] };
};

const FIELDS = (withEmail: boolean) => `id name createdAt cancelledAt ${withEmail ? 'email' : ''} lineItems(first: 50) { nodes { customAttributes { key value } } }`;

/** Commandes récentes (60 jours) qui contiennent un lien de dossier de retouche. */
async function recentOrders(): Promise<Map<string, NonNullable<Rework['order']>>> {
  const map = new Map<string, NonNullable<Rework['order']>>();
  if (!adminEnabled()) return map;
  const since = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
  const q = (withEmail: boolean) => admin<{ orders: { nodes: OrderNode[] } }>(
    `query($q: String!) { orders(first: 100, sortKey: CREATED_AT, reverse: true, query: $q) { nodes { ${FIELDS(withEmail)} } } }`, { q: `created_at:>=${since}` });
  // L'email du client relève des données protégées : s'il est refusé, on fait sans.
  const d = await q(true).catch(() => q(false));
  for (const o of d.orders.nodes) {
    for (const li of o.lineItems.nodes) for (const a of li.customAttributes) {
      const m = a.key === 'Dossier retouche (atelier)' && a.value?.match(/retouche\/([a-f0-9]{32})/);
      if (m && REWORK_ID.test(m[1])) map.set(m[1], { id: o.id, name: o.name, email: o.email || undefined, createdAt: o.createdAt, cancelled: !!o.cancelledAt });
    }
  }
  return map;
}

/** Complète les dossiers avec leur commande (enregistrée une fois trouvée). */
export async function attachOrders(list: Rework[]): Promise<Rework[]> {
  if (!list.some((r) => !r.order)) return list;
  const map = await recentOrders().catch(() => new Map());
  for (const r of list) {
    const o = !r.order && map.get(r.id);
    if (o) { r.order = o; r.history.push({ at: new Date().toISOString(), event: `Commande ${o.name} payée` }); await saveRework(r); }
  }
  return list;
}

/** Délai après lequel un dossier sans commande est considéré comme un panier abandonné. */
export const ABANDON_AFTER_MS = 3 * 3600e3;
export const isAbandoned = (r: Rework) => !r.order && Date.now() - Date.parse(r.createdAt) > ABANDON_AFTER_MS;

const BAT_TAGS = ['BAT-a-retoucher', 'BAT-envoye', 'BAT-valide', 'BAT-modif'];
const TAG: Record<Rework['status'], string> = { a_retoucher: 'BAT-a-retoucher', envoye: 'BAT-envoye', valide: 'BAT-valide', modif: 'BAT-modif' };

/** Étiquette la commande Shopify selon l'état du BAT (visible et filtrable dans le back office). */
export async function tagOrder(r: Rework) {
  if (!r.order || !adminEnabled()) return;
  const tag = TAG[r.status];
  try {
    await admin(`mutation($id: ID!, $t: [String!]!) { tagsRemove(id: $id, tags: $t) { userErrors { message } } }`, { id: r.order.id, t: BAT_TAGS.filter((x) => x !== tag) });
    await admin(`mutation($id: ID!, $t: [String!]!) { tagsAdd(id: $id, tags: $t) { userErrors { message } } }`, { id: r.order.id, t: [tag] });
  } catch { /* l'étiquette est un plus : le dossier reste la référence */ }
}
