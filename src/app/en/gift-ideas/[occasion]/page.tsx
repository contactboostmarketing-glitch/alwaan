import { OCCASIONS } from '@/lib/designs';
import { GiftsView, giftsMeta } from '@/views/GiftsView';

export const dynamicParams = false;
export const generateStaticParams = () => OCCASIONS.map((o) => ({ occasion: o.id }));
export async function generateMetadata({ params }: { params: Promise<{ occasion: string }> }) { return giftsMeta('en', (await params).occasion); }
export default async function Page({ params }: { params: Promise<{ occasion: string }> }) { return <GiftsView lang="en" occasion={(await params).occasion} />; }
