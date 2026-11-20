// Compréhension d'une demande écrite librement (« 20 polos marine et 20 tabliers, logo cœur et dos »)
// en choix du configurateur. L'IA ne fait que remplir des champs : le catalogue, la maquette
// et les prix restent calculés par le site.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { CATEGORIES, COLOR_NAMES, PRODUCTS } from './catalog';

export const PLACES = ['heart', 'chest', 'back', 'heart-back'] as const;

export type ParsedRequest = {
  products: string[]; // slugs du catalogue
  color: string | null; // code couleur du catalogue
  place: (typeof PLACES)[number] | null;
  people: number | null;
  source: 'ia' | 'mots-cles';
};

const COLORS = Object.entries(COLOR_NAMES); // [hex, nom]

const Schema = z.object({
  products: z.array(z.enum(PRODUCTS.map((p) => p.slug) as [string, ...string[]])).describe('Vêtements demandés, au plus 4'),
  color: z.enum(['aucune', ...COLORS.map(([, n]) => n)] as [string, ...string[]]).describe('Couleur de vêtement demandée, ou "aucune"'),
  place: z.enum(['aucun', ...PLACES]).describe('Emplacement du logo, ou "aucun"'),
  people: z.number().int().describe('Nombre de personnes ou de pièces par vêtement, 0 si non précisé'),
});

// Stable d'une requête à l'autre : mis en cache côté Anthropic.
const SYSTEM = `Tu remplis le formulaire de commande d'une boutique de vêtements professionnels personnalisés (impression DTF).
À partir de la demande du client, choisis uniquement parmi le catalogue ci-dessous. Si un type de vêtement est demandé sans modèle précis, prends le modèle marqué "best-seller" de cette catégorie. Ne devine rien qui n'est pas dans la demande : utilise "aucune", "aucun" ou 0.
Emplacements : heart = cœur, chest = grand devant (poitrine en grand, 26 × 26 cm), back = dos, heart-back = cœur et dos.

Catalogue (slug · nom · catégorie · couleurs) :
${PRODUCTS.map((p) => `${p.slug} · ${p.name} · ${CATEGORIES.find((c) => c.slug === p.category)!.name}${p.bestseller ? ' · best-seller' : ''} · ${p.colors.map((c) => COLOR_NAMES[c]).join(', ')}`).join('\n')}`;

let client: Anthropic | null = null;

export async function parseRequest(text: string): Promise<ParsedRequest> {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 500);
  if (!process.env.ANTHROPIC_API_KEY) return keywordParse(clean);
  client ??= new Anthropic();
  try {
    const r = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(Schema) },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: clean }],
    });
    const o = r.stop_reason === 'refusal' ? null : r.parsed_output;
    if (!o) return keywordParse(clean);
    const hex = COLORS.find(([, n]) => n === o.color)?.[0] ?? null;
    return {
      products: [...new Set(o.products)].slice(0, 4),
      color: hex,
      place: o.place === 'aucun' ? null : (o.place as ParsedRequest['place']),
      people: o.people > 0 && o.people <= 5000 ? o.people : null,
      source: 'ia',
    };
  } catch (e) {
    console.error('[assistant]', e);
    return keywordParse(clean);
  }
}

/** Repli sans IA (clé absente ou service indisponible) : simple recherche de mots-clés. */
export function keywordParse(text: string): ParsedRequest {
  const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const products: string[] = [];
  for (const c of CATEGORIES) {
    const words = { 'polos-personnalises': /polo/, 't-shirts-personnalises': /t-?shirt|tee/, 'chemises-personnalisees': /chemise/,
      'tabliers-personnalises': /tablier/, 'casquettes-personnalisees': /casquette/, 'haute-visibilite-personnalisee': /gilet|haute visibilite|\bhv\b|chantier/ }[c.slug];
    if (words?.test(t)) {
      const p = PRODUCTS.find((x) => x.category === c.slug && x.bestseller) ?? PRODUCTS.find((x) => x.category === c.slug);
      if (p) products.push(p.slug);
    }
  }
  const color = COLORS.find(([, n]) => t.includes(n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')))?.[0] ?? null;
  const place = /c(oe|œ)ur/.test(t) && /dos/.test(t) ? 'heart-back' : /dos/.test(t) ? 'back' : /c(oe|œ)ur/.test(t) ? 'heart' : /poitrine|devant/.test(t) ? 'chest' : null;
  const n = parseInt(t.match(/\d+/)?.[0] ?? '', 10);
  return { products, color, place, people: n > 0 && n <= 5000 ? n : null, source: 'mots-cles' };
}
