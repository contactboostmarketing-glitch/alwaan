import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { CartProvider } from '@/components/CartProvider';
import { CookieBanner } from '@/components/CookieBanner';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { JsonLd } from '@/components/ui';
import { SITE_NAME, SITE_URL, TAGLINE } from '@/lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-oswald', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: 'Polos, t-shirts, tabliers, casquettes et haute visibilité à votre logo. Dès 1 pièce, maquette en direct avec votre logo, livraison en 7 jours.',
  openGraph: { siteName: SITE_NAME, locale: 'fr_FR', type: 'website' },
  alternates: { canonical: '/' },
};
export const viewport: Viewport = { themeColor: '#ffffff', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
        </CartProvider>
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: SITE_URL, description: TAGLINE }} />
      </body>
    </html>
  );
}
