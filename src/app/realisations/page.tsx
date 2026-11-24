import type { Metadata } from 'next';
import { WorkView, workIndexable } from '@/views/WorkView';
import { alternates } from '@/i18n/seo';

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Réalisations et avis clients', description: 'Photos de tenues personnalisées portées par nos clients (restaurants, artisans, clubs, entreprises) et avis vérifiés.', alternates: alternates('fr', '/realisations'), robots: (await workIndexable()) ? undefined : { index: false, follow: true } };
}
export default function Page() { return <WorkView lang="fr" />; }
