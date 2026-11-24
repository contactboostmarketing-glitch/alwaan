import { HomeView } from '@/views/HomeView';

// Saison mise à jour chaque jour (ambiance et produits mis en avant).
export const revalidate = 86400;

export default function Home() { return <HomeView lang="fr" />; }
