import type { Metadata } from 'next';
import { BlankView } from '@/views/BlankView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Blank garments: polos, t-shirts, aprons with no printing', description: 'Blank workwear, single pieces or bulk: polos, t-shirts, shirts, aprons, caps and hi-vis with no printing, garment price only. From 1 piece, ships within 2 days.', alternates: alternates('en', '/textile-vierge') };
export default function Page() { return <BlankView lang="en" />; }
