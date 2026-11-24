import type { Metadata } from 'next';
import { AtelierReviews } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Avis clients', robots: { index: false, follow: false } };
export default function Page() { return <AtelierReviews />; }
