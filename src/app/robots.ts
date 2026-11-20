import type { MetadataRoute } from 'next';
import { INDEXABLE, SITE_URL } from '@/lib/site';

// Avant le lancement : rien n'est indexé. Après (SITE_INDEXABLE=true) : tout sauf panier, merci et API ;
// les robots des moteurs IA (GPTBot, PerplexityBot, Google-Extended…) sont autorisés, utile pour le GEO.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/panier', '/merci', '/api/', '/atelier', '/bat/', '/recommander/', '/devis/', '/compte', '/en/account', '/en/cart'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
