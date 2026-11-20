import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import { Breadcrumbs } from '@/components/ui';

export const metadata: Metadata = { title: 'Cart', robots: { index: false } };
export default function CartPage() { return <><Breadcrumbs lang="en" items={[['Cart']]} /><CartView /></>; }
