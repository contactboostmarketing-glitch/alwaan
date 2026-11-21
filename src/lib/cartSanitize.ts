// Revalidation serveur d'un panier envoyé par le navigateur (paiement, devis).
import { getProduct, sizesFor, zonesFor } from './catalog';
import { LOGO_ID } from './logoStore';
import { getDesign } from './designs';
import { qtyOf, type LineConfig } from './pricing';

type InLine = Omit<LineConfig, 'logo'> & { hasLogoPreview?: boolean };

/** Revalide le panier côté serveur (produits, couleurs, zones, tailles) puis recalcule tous les prix. */
export function sanitize(raw: unknown): LineConfig[] | null {
  if (!Array.isArray(raw) || !raw.length || raw.length > 50) return null;
  const out: LineConfig[] = [];
  for (const l of raw as InLine[]) {
    const p = getProduct(l?.slug);
    if (!p || !p.colors.includes(l.color)) return null;
    const zones = (l.zones || []).filter((z) => zonesFor(p).some((x) => x.id === z));
    const sizes = sizesFor(p);
    const qty = Object.fromEntries(Object.entries(l.qty || {}).filter(([s]) => sizes.includes(s) || s === 'Total').map(([s, v]) => [s, Math.max(0, Math.min(5000, Math.floor(Number(v)) || 0))]));
    if (!qtyOf({ qty })) return null;
    // Textile vierge : ni marquage, ni logo, ni maquette.
    if (l.logoStatus === 'blank') {
      out.push({ slug: p.slug, color: l.color, zones: [], qty, logoStatus: 'blank', teamId: /^[a-f0-9]{24}$/.test(l.teamId || '') ? l.teamId : undefined });
      continue;
    }
    if (!zones.length) return null;
    // Sans graphiste : chaque article doit avoir un logo reçu (ou un texte) et une maquette validée.
    const logoOk = l.logoStatus === 'text' ? !!String(l.text || '').trim() : !!(l.logoId && LOGO_ID.test(l.logoId));
    if (!logoOk || !(l.mockupId && LOGO_ID.test(l.mockupId))) return null;
    out.push({ slug: p.slug, color: l.color, zones, qty, text: String(l.text || '').slice(0, 24), text2: String(l.text2 || '').slice(0, 24) || undefined, textFont: ['oswald', 'inter', 'serif', 'mono'].includes(String(l.textFont)) ? String(l.textFont) : undefined, textColor: /^#[0-9a-f]{6}$/i.test(String(l.textColor || '')) ? String(l.textColor) : undefined, logoMono: /^#[0-9a-f]{6}$/i.test(String(l.logoMono || '')) ? String(l.logoMono) : undefined, zoneText: l.zoneText && typeof l.zoneText === 'object' ? (Object.fromEntries(Object.entries(l.zoneText).filter(([z, v]) => zones.includes(z) && typeof v === 'string' && v.trim()).map(([z, v]) => [z, String(v).slice(0, 30)])) as Record<string, string>) : undefined, logoName: l.logoName, logoId: l.logoId && LOGO_ID.test(l.logoId) ? l.logoId : undefined, logoSourceId: l.logoSourceId && LOGO_ID.test(l.logoSourceId) ? l.logoSourceId : undefined, logoCut: (['edges', 'all', 'none'] as const).find((m) => m === l.logoCut), logoRework: !!l.logoRework && l.logoStatus !== 'text', teamId: /^[a-f0-9]{24}$/.test(l.teamId || '') ? l.teamId : undefined, printNames: !!l.printNames, shop: /^[a-z0-9-]{3,40}$/.test(l.shop || '') ? l.shop : undefined, design: l.design && getDesign(l.design) ? l.design : undefined, designText: typeof l.designText === 'string' ? l.designText.slice(0, 200) : undefined, logoStatus: l.logoStatus === 'text' ? 'text' : 'uploaded', logoLowRes: !!l.logoLowRes, mockupId: l.mockupId, approvedAt: typeof l.approvedAt === 'string' ? l.approvedAt.slice(0, 40) : undefined, pack: !!l.pack });
  }
  return out;
}

