import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TeamView } from '@/components/TeamView';

export const metadata: Metadata = { title: 'Liste d’équipe', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense><TeamView id={(await params).id} /></Suspense>;
}
