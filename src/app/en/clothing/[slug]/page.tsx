import { CATEGORIES } from '@/lib/catalog';
import { CategoryView, categoryMeta } from '@/views/CategoryView';

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ slug: c.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return categoryMeta('en', (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <CategoryView lang="en" slug={(await params).slug} />; }
