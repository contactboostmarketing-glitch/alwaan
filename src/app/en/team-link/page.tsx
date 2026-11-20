import type { Metadata } from 'next';
import { TeamLinkView } from '@/views/TeamLinkView';
import { alternates } from '@/i18n/seo';

export const metadata: Metadata = { title: 'Team link: everyone gives their size', description: 'Order your whole team’s outfits without a size spreadsheet: share one link, everyone enters their name and size, your cart fills itself.', alternates: alternates('en', '/lien-equipe') };
export default function Page() { return <TeamLinkView lang="en" />; }
