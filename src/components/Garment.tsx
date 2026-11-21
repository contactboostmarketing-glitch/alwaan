import { getProduct, zonesFor, type Shape } from '@/lib/catalog';

const PATHS: Record<Shape, string> = {
  tee: 'M70 40 L112 25 Q130 45 148 25 L190 40 L235 80 L210 115 L185 100 L185 230 L75 230 L75 100 L50 115 L25 80 Z',
  polo: 'M70 40 L112 25 L130 55 L148 25 L190 40 L235 80 L210 115 L185 100 L185 230 L75 230 L75 100 L50 115 L25 80 Z',
  polols: 'M70 40 L112 25 L130 55 L148 25 L190 40 L232 92 L240 200 L218 204 L205 112 L185 100 L185 230 L75 230 L75 100 L55 112 L42 204 L20 200 L28 92 Z',
  shirt: 'M70 40 L112 22 L130 48 L148 22 L190 40 L232 92 L240 205 L218 208 L205 112 L185 100 L185 232 L75 232 L75 100 L55 112 L42 208 L20 205 L28 92 Z',
  hv: 'M85 32 L112 24 Q130 44 148 24 L175 32 Q170 70 192 92 L192 232 L68 232 L68 92 Q90 70 85 32 Z',
  hvjacket: 'M72 38 L112 22 L130 40 L148 22 L188 38 L232 86 L224 226 L198 226 L192 116 L192 232 L68 232 L68 116 L62 226 L36 226 L28 86 Z',
  apron: 'M100 20 L160 20 L160 80 Q190 85 200 100 L200 235 L60 235 L60 100 Q70 85 100 80 Z',
  cap: 'M50 150 Q55 70 130 62 Q205 70 210 150 Z',
};

export const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150;
};

type Props = {
  slug: string;
  color: string;
  view?: 'front' | 'back';
  zones?: string[];
  logo?: string;
  text?: string;
  className?: string;
  width?: number; // taille en pixels (export PNG)
  height?: number;
};

/** Dessin vectoriel du vêtement avec les marquages. À remplacer par les photos détourées de chaque coloris. */
export function Garment({ slug, color, view = 'front', zones = [], logo, text, className, width, height }: Props) {
  const prod = getProduct(slug);
  if (!prod) return null;
  const s = prod.shape;
  const shade = isDark(color) ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.12)';
  const ink = isDark(color) ? '#ffffff' : '#14213f';
  const marks = zonesFor(prod).filter((z) => zones.includes(z.id) && z.view === view);

  return (
    <svg viewBox="0 0 260 250" width={width} height={height} className={className} role="img" aria-label={`${prod.name}, aperçu`}>
      <path d={PATHS[s]} fill={color} stroke="rgba(20,33,63,.35)" strokeWidth="2" strokeLinejoin="round" />
      {(s === 'hv' || s === 'hvjacket') && (<><rect x="68" y="160" width="124" height="10" fill="#c9ccd2" /><rect x="68" y="188" width="124" height="10" fill="#c9ccd2" /></>)}
      {s === 'cap' && <path d="M40 150 Q130 175 225 150 Q240 158 225 166 Q130 190 40 166 Z" fill={color} stroke="rgba(0,0,0,.3)" strokeWidth="2" />}
      {s === 'apron' && (<><path d="M100 22 Q70 -5 60 30 M160 22 Q190 -5 200 30" stroke={shade} strokeWidth="4" fill="none" /><rect x="90" y="165" width="80" height="38" rx="3" fill="none" stroke={shade} strokeWidth="2" /></>)}
      {(s === 'polo' || s === 'polols') && view === 'front' && (<><path d="M130 55 L130 95" stroke={shade} strokeWidth="3" /><circle cx="130" cy="70" r="2.5" fill={shade} /><circle cx="130" cy="84" r="2.5" fill={shade} /></>)}
      {s === 'shirt' && view === 'front' && <path d="M130 48 L130 232" stroke={shade} strokeWidth="2" />}
      {marks.map((z) => {
        const cx = z.x * 2.6, cy = z.y * 2.5, w = z.w * 2.6;
        return (
          <g key={z.id}>
            {logo ? (
              <image href={logo} x={cx - w / 2} y={cy - w * 0.35} width={w} height={w * 0.6} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <path d={`M${cx} ${cy - w * 0.32} L${cx + w * 0.22} ${cy + w * 0.08} L${cx + w * 0.08} ${cy + w * 0.08} L${cx} ${cy - w * 0.08} L${cx - w * 0.08} ${cy + w * 0.08} L${cx - w * 0.22} ${cy + w * 0.08} Z`} fill={ink} />
            )}
            {text && (
              <text x={cx} y={cy + w * 0.3} textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight={600} fontSize={Math.max(6, w * 0.13)} fill={ink}>{text}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
