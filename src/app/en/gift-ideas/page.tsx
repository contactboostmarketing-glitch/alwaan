import { GiftsView, giftsMeta } from '@/views/GiftsView';

export const metadata = giftsMeta('en');
export default function Page() { return <GiftsView lang="en" />; }
