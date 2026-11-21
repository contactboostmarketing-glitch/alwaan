'use client';
import { usePathname } from 'next/navigation';
import { href, langOf, tr, type Lang } from './index';

export function useLang(): Lang { return langOf(usePathname()); }
/** t('Texte français') dans un composant navigateur ; l(path) pour les liens. */
export function useT() {
  const lang = useLang();
  return { lang, t: (fr: string, vars?: Record<string, string | number>) => tr(lang, fr, vars), l: (path: string) => href(lang, path) };
}
