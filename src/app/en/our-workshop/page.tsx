import type { Metadata } from 'next';
import { WorkshopView } from '@/views/WorkshopView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Our printing workshop in northern France', description: 'Your custom workwear is DTF-printed in our workshop in Haubourdin, near Lille: approved mock-up, photo check, shipping to France and Belgium.', alternates: alternates('en', '/notre-atelier') };
export default function Page() { return <WorkshopView lang="en" />; }
