import type { Metadata } from 'next';
import { WorkView } from '@/views/WorkView';
import { alternates } from '@/i18n/seo';

export const revalidate = 3600;
export const metadata: Metadata = { title: 'Customer work and reviews', description: 'Photos of custom workwear worn by our customers and verified reviews.', alternates: alternates('en', '/realisations') };
export default function Page() { return <WorkView lang="en" />; }
