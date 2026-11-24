// Rendu des designs particuliers (navigateur et serveur) : couleurs du texte selon le vêtement.
import { isDark } from '@/components/Garment';
import type { Design } from './designs';

export const inkFor = (garment: string) => (isDark(garment) ? '#ffffff' : '#151a2d');
export const accentFor = (garment: string) => (isDark(garment) ? '#f2d33b' : '#d12f7c');
export const designValues = (d: Design, v: Record<string, string> = {}) => Object.fromEntries(d.fields.map((f) => [f.key, (v[f.key] ?? f.def).slice(0, f.max)]));
export const designSvg = (d: Design, garment: string, v?: Record<string, string>) => d.svg(designValues(d, v), inkFor(garment), accentFor(garment));
export const designDataUrl = (d: Design, garment: string, v?: Record<string, string>) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(designSvg(d, garment, v))}`;
import { defaultZone, zonesFor, type Product } from './catalog';
/** Emplacement d'un design : grand devant (t-shirt, tablier), face (casquette). */
export const designZone = (p: Product) => (zonesFor(p).some((z) => z.id === 'chest') ? 'chest' : defaultZone(p));
