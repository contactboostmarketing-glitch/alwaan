import type { Metadata } from 'next';
import { ClubsView } from '@/views/ClubsView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Tenues de club et d’association personnalisées (foot, rugby, basket…)', description: 'T-shirts, polos et casquettes à l’effigie de votre club ou association, dès 1 pièce. Boutique du club : chacun commande sa tenue, le club touche une commission. Imprimé dans le Nord.', alternates: alternates('fr', '/clubs-associations') };
export default function Page() { return <ClubsView lang="fr" />; }
