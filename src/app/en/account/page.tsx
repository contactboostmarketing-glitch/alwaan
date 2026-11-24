import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountView } from '@/components/AccountView';

export const metadata: Metadata = { title: 'My account', robots: { index: false, follow: false } };
export default function Page() { return <Suspense><AccountView /></Suspense>; }
