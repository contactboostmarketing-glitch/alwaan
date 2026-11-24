import type { Metadata } from 'next';
import { DESIGNS, getDesign } from '@/lib/designs';
import { DesignStudio } from '@/components/DesignStudio';
import { Breadcrumbs } from '@/components/ui';
import { href } from '@/i18n';
import { alternates } from '@/i18n/seo';

export const dynamicParams = false;
export const generateStaticParams = () => DESIGNS.map((d) => ({ design: d.id }));
export async function generateMetadata({ params }: { params: Promise<{ design: string }> }): Promise<Metadata> {
  const d = getDesign((await params).design)!;
  return { title: `${d.en}: personalised t-shirt`, alternates: alternates('en', `/idees-cadeaux/creer/${d.id}`) };
}
export default async function Page({ params }: { params: Promise<{ design: string }> }) {
  const d = getDesign((await params).design)!;
  return <><Breadcrumbs lang="en" items={[['Gift ideas', href('en', '/idees-cadeaux')], [d.en]]} /><DesignStudio id={d.id} /></>;
}
