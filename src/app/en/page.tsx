import type { Metadata } from 'next';
import { HomeView } from '@/views/HomeView';

// Saison mise à jour chaque jour (ambiance et produits mis en avant).
export const revalidate = 86400;
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { alternates: alternates('en', '/') };
export default function Home() { return <HomeView lang="en" />; }
