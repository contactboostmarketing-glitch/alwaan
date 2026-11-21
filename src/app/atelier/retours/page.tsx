import type { Metadata } from 'next';
import { AtelierFeedback } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Retours clients', robots: { index: false, follow: false } };
export default function Page() { return <AtelierFeedback />; }
