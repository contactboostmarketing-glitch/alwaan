import type { MetadataRoute } from 'next';
import { CATEGORIES, PRODUCTS, SECTORS } from '@/lib/catalog';
import { LEGAL_PAGES, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, priority: number) => ({ url: SITE_URL + path, lastModified: new Date(), priority });
  return [
    u('/', 1),
    ...CATEGORIES.map((c) => u(`/vetements/${c.slug}`, 0.9)),
    ...SECTORS.map((s) => u(`/metiers/${s.slug}`, 0.8)),
    ...PRODUCTS.map((p) => u(`/produits/${p.slug}`, 0.7)),
    u('/faq', 0.6), u('/devis', 0.5),
    ...Object.keys(LEGAL_PAGES).map((k) => u(`/${k}`, 0.2)),
  ];
}
