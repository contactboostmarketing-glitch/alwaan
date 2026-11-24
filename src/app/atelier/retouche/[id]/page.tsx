import type { Metadata } from 'next';
import { AtelierRework } from '@/components/Atelier';

export const metadata: Metadata = { title: 'Retouche du logo', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AtelierRework id={(await params).id} />;
}
