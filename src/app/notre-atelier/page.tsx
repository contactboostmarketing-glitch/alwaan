import type { Metadata } from 'next';
import { WorkshopView } from '@/views/WorkshopView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Notre atelier d’impression dans le Nord (Haubourdin)', description: 'Vos vêtements personnalisés sont imprimés en DTF dans notre atelier à Haubourdin, près de Lille : maquette validée, contrôle photo, expédition en France et en Belgique.', alternates: alternates('fr', '/notre-atelier') };
export default function Page() { return <WorkshopView lang="fr" />; }
