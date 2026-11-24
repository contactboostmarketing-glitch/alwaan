import type { Metadata } from 'next';
import { ReviewForm } from '@/components/Reviews';

export const metadata: Metadata = { title: 'Votre avis', robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ order: string }>; searchParams: Promise<{ sig?: string }> }) {
  return <ReviewForm order={(await params).order} sig={(await searchParams).sig || ''} />;
}
