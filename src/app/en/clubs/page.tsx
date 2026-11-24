import type { Metadata } from 'next';
import { ClubsView } from '@/views/ClubsView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Custom club and association outfits', description: 'T-shirts, polos and caps for your club or association, from 1 piece. Club shop: members order their own, the club earns a commission.', alternates: alternates('en', '/clubs-associations') };
export default function Page() { return <ClubsView lang="en" />; }
