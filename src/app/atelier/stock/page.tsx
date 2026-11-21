import type { Metadata } from 'next';
import { AtelierStock } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Stock atelier', robots: { index: false, follow: false } };
export default function Page() { return <AtelierStock />; }
