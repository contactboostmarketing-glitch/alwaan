import type { Metadata } from 'next';
import { SavedCartView } from '@/components/SavedCartView';

export const metadata: Metadata = { title: 'Votre devis', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <SavedCartView id={(await params).id} />;
}
