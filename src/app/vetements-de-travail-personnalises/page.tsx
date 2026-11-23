import { WorkwearView, workwearMeta } from '@/views/WorkwearView';

// Date de réception estimée et date limite de saison (Noël) mises à jour chaque jour.
export const revalidate = 86400;
export const metadata = workwearMeta('fr');
export default function Page() { return <WorkwearView lang="fr" />; }
