import { href, type Lang } from './index';

/** Canonique + hreflang : chaque page française a sa jumelle anglaise sous /en. */
export function alternates(lang: Lang, frPath: string) {
  const en = href('en', frPath);
  return { canonical: lang === 'en' ? en : frPath, languages: { 'fr-FR': frPath, 'fr-BE': frPath, en, 'x-default': frPath } };
}
