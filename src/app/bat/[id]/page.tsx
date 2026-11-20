import type { Metadata } from 'next';
import { BatValidation } from '@/components/BatValidation';

export const metadata: Metadata = { title: 'Validez votre maquette', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <BatValidation id={(await params).id} />;
}
