import { WorkwearView, workwearMeta } from '@/views/WorkwearView';

export const revalidate = 86400;
export const metadata = workwearMeta('en');
export default function Page() { return <WorkwearView lang="en" />; }
