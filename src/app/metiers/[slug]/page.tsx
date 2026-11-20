import { SECTORS } from '@/lib/catalog';
import { SectorView, sectorMeta } from '@/views/SectorView';

export const dynamicParams = false;
export const generateStaticParams = () => SECTORS.map((s) => ({ slug: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return sectorMeta('fr', (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <SectorView lang="fr" slug={(await params).slug} />; }
