import { GiftsView, giftsMeta } from '@/views/GiftsView';

export const metadata = giftsMeta('fr');
export default function Page() { return <GiftsView lang="fr" />; }
