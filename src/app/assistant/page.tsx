import type { Metadata } from 'next';
import { Assistant } from '@/components/Assistant';

export const metadata: Metadata = {
  title: 'Créer ma tenue en 1 minute',
  description: 'Envoyez votre logo, choisissez l\'emplacement, les vêtements et la couleur : notre assistant prépare votre commande et vous montre la maquette.',
  alternates: { canonical: '/assistant' },
};
export default function AssistantPage() {
  return <section className="wrap"><Assistant /></section>;
}
