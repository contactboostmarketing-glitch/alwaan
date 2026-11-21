import type { Metadata } from 'next';
import { ShopEditor } from '@/components/ShopEditor';

export const metadata: Metadata = { title: 'Créer une boutique', robots: { index: false, follow: false } };
export default function Page() { return <ShopEditor />; }
