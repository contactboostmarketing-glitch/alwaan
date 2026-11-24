import { PRODUCTS } from '@/lib/catalog';
import { ProductView, productMeta } from '@/views/ProductView';

export const dynamicParams = false;
export const revalidate = 3600; // avis clients publiés
export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return productMeta('fr', (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <ProductView lang="fr" slug={(await params).slug} />; }
