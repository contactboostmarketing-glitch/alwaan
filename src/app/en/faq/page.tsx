import type { Metadata } from 'next';
import { FaqView } from '@/views/FaqView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'FAQ', description: 'Minimum order, lead times, logo files, sizes, payment, returns: all the answers about our custom workwear.', alternates: alternates('en', '/faq') };
export default function Page() { return <FaqView lang="en" />; }
