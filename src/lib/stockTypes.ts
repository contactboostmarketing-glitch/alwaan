// Stock du textile vierge à l'atelier (partagé site et serveur, sans accès disque).
// Une référence (vêtement + couleur + taille) absente du stock, ou commandée au-delà du stock,
// est « sur commande » : le fournisseur livre l'atelier en ON_ORDER_DAYS jours ouvrés, ajoutés au délai.
// Tant qu'aucun stock n'est saisi (tracking = false), tout est considéré comme disponible.

export const ON_ORDER_DAYS = 5;
export type Stock = { tracking: boolean; q: Record<string, number>; updatedAt?: string };
export const skey = (slug: string, color: string, size: string) => `${slug}|${color}|${size}`;

/** Quantité disponible, ou null si le stock n'est pas suivi. « Total » (tailles à préciser) : somme de la couleur. */
export function available(s: Stock | null | undefined, slug: string, color: string, size: string): number | null {
  if (!s?.tracking) return null;
  if (size === 'Total') return Object.entries(s.q).filter(([k]) => k.startsWith(`${slug}|${color}|`)).reduce((a, [, n]) => a + n, 0);
  return s.q[skey(slug, color, size)] ?? 0;
}
/** La couleur a-t-elle du stock suivi à l'atelier (au moins une taille saisie) ? */
export const colorStocked = (s: Stock | null | undefined, slug: string, color: string) =>
  !s?.tracking || Object.keys(s.q).some((k) => k.startsWith(`${slug}|${color}|`));

/** Tailles commandées au-delà du stock (donc sur commande). */
export function shortSizes(s: Stock | null | undefined, l: { slug: string; color: string; qty: Record<string, number> }): string[] {
  if (!s?.tracking) return [];
  return Object.entries(l.qty).filter(([size, n]) => n > 0 && n > (available(s, l.slug, l.color, size) ?? Infinity)).map(([size]) => size);
}
export const onOrder = (s: Stock | null | undefined, l: { slug: string; color: string; qty: Record<string, number> }) => shortSizes(s, l).length > 0;
