import type { Metadata } from 'next';
import { TeamLinkView } from '@/views/TeamLinkView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Lien d’équipe : chacun donne sa taille', description: 'Commandez les tenues de toute l’équipe sans tableau de tailles : partagez un lien, chacun entre son nom, son prénom et sa taille, le panier se remplit tout seul.', alternates: alternates('fr', '/lien-equipe') };
export default function Page() { return <TeamLinkView lang="fr" />; }
