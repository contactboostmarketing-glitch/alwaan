import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ShopPage } from '@/components/ShopPage';

export const metadata: Metadata = { title: 'Boutique', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense><ShopPage slug={(await params).slug} /></Suspense>;
}
