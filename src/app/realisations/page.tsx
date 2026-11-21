import type { Metadata } from 'next';
import { WorkView } from '@/views/WorkView';
import { alternates } from '@/i18n/seo';

export const revalidate = 3600;
export const metadata: Metadata = { title: 'Réalisations et avis clients', description: 'Photos de tenues personnalisées portées par nos clients (restaurants, artisans, clubs, entreprises) et avis vérifiés.', alternates: alternates('fr', '/realisations') };
export default function Page() { return <WorkView lang="fr" />; }
