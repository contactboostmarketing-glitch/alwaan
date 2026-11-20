import type { MetadataRoute } from 'next';
import { CATEGORIES, PRODUCTS, SECTORS } from '@/lib/catalog';
import { LEGAL_PAGES, SITE_URL } from '@/lib/site';
import { GUIDES } from '@/lib/guides';
import { href } from '@/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages traduites : chacune déclare sa version anglaise (hreflang dans le plan du site).
  const u = (path: string, priority: number) => ({ url: SITE_URL + path, lastModified: new Date(), priority });
  const both = (path: string, priority: number) => {
    const languages = { fr: SITE_URL + path, en: SITE_URL + href('en', path) };
    return [{ ...u(path, priority), alternates: { languages } }, { ...u(href('en', path), priority * 0.9), alternates: { languages } }];
  };
  return [
    ...both('/', 1),
    ...CATEGORIES.flatMap((c) => both(`/vetements/${c.slug}`, 0.9)),
    ...SECTORS.flatMap((s) => both(`/metiers/${s.slug}`, 0.8)),
    ...PRODUCTS.flatMap((p) => both(`/produits/${p.slug}`, 0.7)),
    ...both('/assistant', 0.8), u('/guides', 0.7), u('/a-propos', 0.4),
    ...GUIDES.map((g) => u(`/guides/${g.slug}`, 0.7)), ...both('/faq', 0.6), ...both('/devis', 0.5),
    ...Object.keys(LEGAL_PAGES).map((k) => u(`/${k}`, 0.2)),
  ];
}
