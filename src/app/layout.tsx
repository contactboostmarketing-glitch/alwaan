import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { CartProvider } from '@/components/CartProvider';
import { CookieBanner } from '@/components/CookieBanner';
import { Tracking } from '@/components/Tracking';
import { ContactFloat } from '@/components/Contact';
import { SignupNudge } from '@/components/SignupNudge';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { DeadlineStrip } from '@/components/DeadlineStrip';
import { JsonLd } from '@/components/ui';
import { INDEXABLE, SITE_NAME, SITE_URL, TAGLINE } from '@/lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-oswald', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Google Search Console / Merchant Center : code de vérification (méthode « balise HTML ») dans Netlify.
  // Merchant Center alwaan (ID 5915162698) ; un autre code (Search Console…) peut s'ajouter via GOOGLE_SITE_VERIFICATION.
  verification: { google: ['asz915yQZuBiu-wWAUsjPnRklOXhDeygxhWCtTMKBHA', ...(process.env.GOOGLE_SITE_VERIFICATION ? [process.env.GOOGLE_SITE_VERIFICATION] : [])] },
  title: { default: `${SITE_NAME} · ${TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: 'Polos, t-shirts, tabliers, casquettes et haute visibilité à votre logo. Dès 1 pièce, maquette en direct avec votre logo, expédition en 7 jours ouvrés.',
  openGraph: { siteName: SITE_NAME, locale: 'fr_FR', type: 'website' },
  robots: INDEXABLE ? undefined : { index: false, follow: false },
  alternates: { canonical: '/', languages: { 'fr-FR': '/', 'fr-BE': '/', en: '/en', 'x-default': '/' } },
};
export const viewport: Viewport = { themeColor: '#ffffff', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <DeadlineStrip />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
          <Tracking />
          <ContactFloat />
          <SignupNudge />
        </CartProvider>
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: SITE_URL, description: TAGLINE, areaServed: [{ '@type': 'Country', name: 'France' }, { '@type': 'Country', name: 'Belgique' }], knowsAbout: ['vêtements personnalisés', 'impression DTF', 'vêtements de travail', 'haute visibilité EN ISO 20471'] }} />
      </body>
    </html>
  );
}
