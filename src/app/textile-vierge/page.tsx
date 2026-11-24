import type { Metadata } from 'next';
import { BlankView } from '@/views/BlankView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Textile vierge : polos, t-shirts, tabliers sans marquage', description: 'Textile vierge à l’unité ou en gros : polos, t-shirts, chemises, tabliers, casquettes et haute visibilité sans impression, au prix du vêtement seul. Dès 1 pièce, expédié sous 2 jours.', alternates: alternates('fr', '/textile-vierge') };
export default function Page() { return <BlankView lang="fr" />; }
