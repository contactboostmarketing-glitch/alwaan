import type { Metadata } from 'next';
import { WorkView, workIndexable } from '@/views/WorkView';
import { alternates } from '@/i18n/seo';

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Customer work and reviews', description: 'Photos of custom workwear worn by our customers and verified reviews.', alternates: alternates('en', '/realisations'), robots: (await workIndexable()) ? undefined : { index: false, follow: true } };
}
export default function Page() { return <WorkView lang="en" />; }
