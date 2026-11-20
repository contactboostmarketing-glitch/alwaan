import type { Metadata } from 'next';
import { HomeView } from '@/views/HomeView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { alternates: alternates('en', '/') };
export default function Home() { return <HomeView lang="en" />; }
