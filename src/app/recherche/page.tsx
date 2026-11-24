import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Search } from '@/components/Search';

export const metadata: Metadata = { title: 'Rechercher', robots: { index: false, follow: true } };
export default function Page() { return <Suspense><Search lang="fr" /></Suspense>; }
