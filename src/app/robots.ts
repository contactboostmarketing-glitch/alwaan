import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Les robots des moteurs IA (GPTBot, PerplexityBot, Google-Extended…) sont autorisés : utile pour le GEO.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/panier', '/merci', '/api/'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
