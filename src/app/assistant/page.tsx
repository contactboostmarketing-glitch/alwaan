import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Assistant } from '@/components/Assistant';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = {
  title: 'Créer ma tenue en 1 minute',
  description: 'Envoyez votre logo, choisissez l\'emplacement, les vêtements et la couleur : notre assistant prépare votre commande et vous montre la maquette.',
  alternates: alternates('fr', '/assistant'),
};
export default function AssistantPage() {
  return <section className="wrap"><Suspense><Assistant /></Suspense></section>;
}
