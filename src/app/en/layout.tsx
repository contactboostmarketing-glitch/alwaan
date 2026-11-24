import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'alwaan · Custom workwear with your logo', template: '%s · alwaan' },
  description: 'Polo shirts, t-shirts, aprons, caps and hi-vis printed with your logo. From 1 piece, live mock-up with your logo, shipped in 7 business days to France and Belgium.',
  openGraph: { siteName: 'alwaan', locale: 'en_GB', type: 'website' },
};
export default function EnLayout({ children }: { children: React.ReactNode }) {
  // La balise <html> est commune au site (lang="fr") : on la passe en anglais dès le chargement des pages /en.
  return <div lang="en"><script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='en'" }} />{children}</div>;
}
