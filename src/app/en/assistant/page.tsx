import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Assistant } from '@/components/Assistant';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = {
  title: 'Create your outfit in 1 minute',
  description: 'Send your logo, pick the placement, the garments and the colour: our assistant prepares your order and shows you the mock-up.',
  alternates: alternates('en', '/assistant'),
};
export default function AssistantPage() { return <section className="wrap"><Suspense><Assistant /></Suspense></section>; }
