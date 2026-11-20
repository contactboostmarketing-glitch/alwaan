import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'alwaan · Custom workwear with your logo', template: '%s · alwaan' },
  description: 'Polo shirts, t-shirts, aprons, caps and hi-vis printed with your logo. From 1 piece, live mock-up with your logo, delivered in 7 days in France and Belgium.',
  openGraph: { siteName: 'alwaan', locale: 'en_GB', type: 'website' },
};
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
