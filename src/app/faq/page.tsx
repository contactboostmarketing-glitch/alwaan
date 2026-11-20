import type { Metadata } from 'next';
import { FaqView } from '@/views/FaqView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Questions fréquentes', description: 'Minimum de commande, délais, logo, tailles, paiement, retours : toutes les réponses sur nos vêtements personnalisés.', alternates: alternates('fr', '/faq') };
export default function Page() { return <FaqView lang="fr" />; }
