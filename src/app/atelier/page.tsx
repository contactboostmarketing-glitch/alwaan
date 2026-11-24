import type { Metadata } from 'next';
import { AtelierList } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Atelier', robots: { index: false, follow: false } };
export default function Page() { return <AtelierList />; }
