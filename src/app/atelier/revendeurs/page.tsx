import type { Metadata } from 'next';
import { AtelierResellers } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Revendeurs', robots: { index: false, follow: false } };
export default function Page() { return <AtelierResellers />; }
