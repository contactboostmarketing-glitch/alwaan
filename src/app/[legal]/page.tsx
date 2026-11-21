import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui';
import { ConsentLink } from '@/components/CookieBanner';
import { LEGAL_PAGES } from '@/lib/site';
import { CGV, COOKIES, LIVRAISON, PRIVACY } from '@/lib/legalTexts';

const TEXTS: Record<string, string[]> = { cgv: CGV, confidentialite: PRIVACY, cookies: COOKIES, livraison: LIVRAISON };

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(LEGAL_PAGES).map((legal) => ({ legal }));
export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }): Promise<Metadata> {
  const k = (await params).legal;
  return { title: LEGAL_PAGES[k]?.title, alternates: { canonical: `/${k}` } };
}
export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const k = (await params).legal, page = LEGAL_PAGES[k];
  if (!page) notFound();
  return (
    <>
      <Breadcrumbs items={[[page.title]]} />
      <section className="wrap legal">
        <h1>{page.title}</h1>
        {!page.final && <p className="draft">Texte définitif à rédiger avec votre juriste. Cette page doit contenir :</p>}
        {(TEXTS[k] ?? page.body).map((b, i) => b.startsWith('## ') ? <h2 key={i}>{b.slice(3)}</h2> : b.startsWith('- ') ? <p key={i} className="li">• {b.slice(2)}</p> : <p key={i}>{b}</p>)}
        {k === 'cookies' && <p><ConsentLink /></p>}
      </section>
    </>
  );
}
