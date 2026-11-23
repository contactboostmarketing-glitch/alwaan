import { ROLY_PHOTOS } from '@/lib/rolyPhotos';
import { rolyColor } from '@/lib/rolyMatch';
import { COLOR_NAMES, PRODUCTS, defaultZone, VAT, getCategory } from '@/lib/catalog';
import { unitAt } from '@/lib/pricing';
import { SITE_URL } from '@/lib/site';

/**
 * Flux produits Google Merchant Center (Google Shopping) : une entrée par vêtement et par couleur.
 * Prix = 1 pièce avec logo au cœur, TTC (prix affiché sur la page produit avant choix des quantités).
 * À déclarer dans Merchant Center : Produits → Flux → URL planifiée : https://alwaan.fr/feeds/google.xml
 */
export const revalidate = 86400; // Merchant Center lit le flux une fois par jour : une régénération par jour suffit (économise les crédits Netlify).

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n: number) => `${(Math.round(n * 100) / 100).toFixed(2)} EUR`;

export function GET() {
  const items: string[] = [];
  for (const p of PRODUCTS) {
    const c = getCategory(p.category)!;
    const price = unitAt({ slug: p.slug, zones: [defaultZone(p)] }, 1) * (1 + VAT);
    for (const hex of p.colors) {
      const color = COLOR_NAMES[hex] || hex;
      const h = hex.slice(1);
      // Vraie photo du vêtement (Roly) dans la couleur : Google Shopping préfère les photos aux dessins.
      const rp = ROLY_PHOTOS[p.slug] ? rolyColor(ROLY_PHOTOS[p.slug].colors, hex) : undefined;
      items.push(`<item>
<g:id>${esc(`${p.slug}-${h}`)}</g:id>
<g:item_group_id>${esc(p.slug)}</g:item_group_id>
<g:title>${esc(`${p.name} personnalisable à votre logo · ${color}`)}</g:title>
<g:description>${esc(`${p.type}. ${p.composition}. Impression DTF de votre logo, maquette en direct, dès 1 pièce. Marquage -40 % dès 30 pièces. ${c.intro}`)}</g:description>
<g:link>${SITE_URL}/produits/${p.slug}?couleur=${h}</g:link>
<g:image_link>${esc(rp?.images[0] || p.photos?.[hex] || `${SITE_URL}/images/produits/${p.slug}-${h}.png`)}</g:image_link>
${(rp?.images.slice(1, 6) || []).map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`).join('\n')}
<g:availability>in_stock</g:availability>
<g:price>${money(price)}</g:price>
<g:brand>alwaan</g:brand>
<g:condition>new</g:condition>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
<g:product_type>${esc(`Vêtements personnalisés > ${c.name}`)}</g:product_type>
<g:color>${esc(color)}</g:color>
<g:size>${esc(p.sizes === 'TU' ? 'Taille unique' : p.sizes.replace('–', '-'))}</g:size>
<g:gender>unisex</g:gender>
<g:age_group>adult</g:age_group>
<g:is_bundle>no</g:is_bundle>
<g:custom_label_0>${esc(c.name)}</g:custom_label_0>
<g:return_policy_label>personnalise</g:return_policy_label>
${p.bestseller ? '<g:custom_label_1>best-seller</g:custom_label_1>\n' : ''}
</item>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>
<title>alwaan · vêtements personnalisés</title><link>${SITE_URL}</link><description>Tenues professionnelles personnalisées à votre logo</description>
${items.join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
}
