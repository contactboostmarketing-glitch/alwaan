// Jeu d'icônes au trait (24 × 24, contour 1,75) : un seul style pour tout le site, à la place des émojis.
import type { SVGProps } from 'react';

const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  box: 'M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8',
  receipt: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2ZM9 7h6M9 11h6M9 15h4',
  file: 'M14 2H6v20h12V6l-4-4ZM14 2v4h4M9 13h6M9 17h6',
  palette: 'M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.8 1.7-1.7 0-1.2-1-1.6-1-2.7 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7ZM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',
  gift: 'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5h4ZM12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5h-4Z',
  bag: 'M5 7h14l-1 14H6L5 7ZM9 7V5a3 3 0 0 1 6 0v2',
  tag: 'M3 12V3h9l9 9-9 9-9-9ZM7.5 7.5h.01',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  check: 'M5 12.5 10 17 19 7',
  sparkles: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5L12 8Z',
  users: 'M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  camera: 'M4 7h3l2-3h6l2 3h3v13H4V7ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12',
  image: 'M3 4h18v16H3zM3 16l5-5 5 5M13 14l3-3 5 5M15.5 8.5h.01',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3ZM8.5 12l2.5 2.5L15.5 10',
  truck: 'M2 6h12v11H2zM14 10h4l4 4v3h-8M6.5 20a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.5 20a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
  bank: 'M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18',
  sample: 'M9 3h6v4H9zM6 5H4v16h16V5h-2M8.5 14l2.5 2.5 4.5-5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  shirt: 'M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.7-2 3-4 3S8.5 4.7 8 3Z',
  cart: 'M3 4h2l2.5 11h11L21 7H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  cake: 'M4 21h16v-8H4zM4 16c1.3 0 1.3 1 2.7 1s1.3-1 2.6-1 1.4 1 2.7 1 1.3-1 2.6-1 1.4 1 2.7 1 1.3-1 2.7-1M12 13V9M12 6c-.8 0-1.2-.7-1.2-1.2S12 3 12 3s1.2 1.3 1.2 1.8S12.8 6 12 6ZM8 13v-2h8v2',
  ring: 'M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM9 4l1.5 3h3L15 4l-1.5-1h-3L9 4Z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  snow: 'M12 2v20M4.2 7l15.6 10M4.2 17 19.8 7M9 4l3 2 3-2M9 20l3-2 3 2',
  leaf: 'M5 21c0-9 5-15 15-16-1 10-7 15-15 16ZM5 21l8-8',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  tree: 'M12 3 6 11h3l-4 6h14l-4-6h3l-6-8ZM12 17v4',
  briefcase: 'M3 7h18v13H3zM8 7V4h8v3M3 13h18',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z',
  flower: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 9V3M12 15v6M9 12H3M21 12h-6M9.9 9.9 6 6M18 18l-3.9-3.9M9.9 14.1 6 18M18 6l-3.9 3.9',
  utensils: 'M6 3v8M4 3v5a2 2 0 0 0 4 0V3M6 11v10M17 3c-2 1-3 3-3 6v3h3v9',
  helmet: 'M3 18h18M5 18v-3a7 7 0 0 1 14 0v3M10 8V5h4v3',
  party: 'M4 20 9 7l8 8-13 5ZM14 3v2M19 5l-1.5 1.5M21 10h-2M14 9l2-2',
  bell: 'M5 17h14M7 17V11a5 5 0 0 1 10 0v6M12 6V4M3 20h18',
  hand: 'M7 11V5.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16l-1.5-3.5a1.5 1.5 0 0 1 2.6-1.5L7 13',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  baby: 'M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM7 21v-4a5 5 0 0 1 10 0v4M9 14l-3-2M15 14l3-2',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  redo: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  upload: 'M12 15V4M7 9l5-5 5 5M4 15v5h16v-5',
  one: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM10.5 9l2-1.5v9',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  x: 'M6 6l12 12M18 6 6 18',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  building: 'M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M2 21h20',
  grandparent: 'M9 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 21v-5a5 5 0 0 1 10 0v5M18 11v10M16 11h4',
};
export type IconName = keyof typeof P;
export const ICON_NAMES = Object.keys(P) as IconName[];

export function I({ name, size = 20, ...rest }: { name: IconName | string; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={P[name] || P.check} />
    </svg>
  );
}
