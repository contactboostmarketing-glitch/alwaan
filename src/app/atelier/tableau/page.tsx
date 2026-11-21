import type { Metadata } from 'next';
import { AtelierDashboard } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Tableau de bord', robots: { index: false, follow: false } };
export default function Page() { return <AtelierDashboard />; }
