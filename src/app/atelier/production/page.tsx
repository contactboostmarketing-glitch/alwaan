import type { Metadata } from 'next';
import { AtelierProduction } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Production', robots: { index: false, follow: false } };
export default function Page() { return <AtelierProduction />; }
