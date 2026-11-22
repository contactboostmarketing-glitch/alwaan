import { fontCss, getProduct, zonesFor, type Shape } from '@/lib/catalog';

const PATHS: Record<Shape, string> = {
  tee: 'M70 40 L112 25 Q130 45 148 25 L190 40 L235 80 L210 115 L185 100 L185 230 L75 230 L75 100 L50 115 L25 80 Z',
  polo: 'M70 40 L112 25 L130 55 L148 25 L190 40 L235 80 L210 115 L185 100 L185 230 L75 230 L75 100 L50 115 L25 80 Z',
  polols: 'M70 40 L112 25 L130 55 L148 25 L190 40 L232 92 L240 200 L218 204 L205 112 L185 100 L185 230 L75 230 L75 100 L55 112 L42 204 L20 200 L28 92 Z',
  shirt: 'M70 40 L112 22 L130 48 L148 22 L190 40 L232 92 L240 205 L218 208 L205 112 L185 100 L185 232 L75 232 L75 100 L55 112 L42 208 L20 205 L28 92 Z',
  hv: 'M85 32 L112 24 Q130 44 148 24 L175 32 Q170 70 192 92 L192 232 L68 232 L68 92 Q90 70 85 32 Z',
  hvjacket: 'M72 38 L112 22 L130 40 L148 22 L188 38 L232 86 L224 226 L198 226 L192 116 L192 232 L68 232 L68 116 L62 226 L36 226 L28 86 Z',
  apron: 'M100 20 L160 20 L160 80 Q190 85 200 100 L200 235 L60 235 L60 100 Q70 85 100 80 Z',
  cap: 'M50 150 Q55 70 130 62 Q205 70 210 150 Z',
  sweat: 'M70 40 L112 25 Q130 40 148 25 L190 40 L232 92 L240 200 L218 204 L205 112 L185 100 L185 230 L75 230 L75 100 L55 112 L42 204 L20 200 L28 92 Z',
  hoodie: 'M70 40 L112 25 Q130 40 148 25 L190 40 L232 92 L240 200 L218 204 L205 112 L185 100 L185 230 L75 230 L75 100 L55 112 L42 204 L20 200 L28 92 Z',
  zipjacket: 'M70 40 L112 25 Q130 40 148 25 L190 40 L232 92 L240 200 L218 204 L205 112 L185 100 L185 230 L75 230 L75 100 L55 112 L42 204 L20 200 L28 92 Z',
  jacket: 'M72 38 L112 22 L130 40 L148 22 L188 38 L232 86 L240 200 L216 204 L204 114 L192 106 L192 232 L68 232 L68 106 L56 114 L44 204 L20 200 L28 86 Z',
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
  text2?: string;
  textFont?: string;
  textColor?: string;
  zoneText?: Record<string, string>;
  className?: string;
  width?: number; // taille en pixels (export PNG)
  height?: number;
};

/** Dessin vectoriel du vêtement avec les marquages. À remplacer par les photos détourées de chaque coloris. */
export function Garment({ slug, color, view = 'front', zones = [], logo, text, text2, textFont, textColor, zoneText, className, width, height }: Props) {
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
      {(s === 'hoodie' || s === 'zipjacket') && <path d={view === 'front' ? 'M106 30 Q130 -4 154 30 Q146 46 130 52 Q114 46 106 30 Z' : 'M104 30 Q130 -10 156 30 Q150 70 130 74 Q110 70 104 30 Z'} fill={color} stroke="rgba(20,33,63,.35)" strokeWidth="2" />}
      {s === 'hoodie' && view === 'front' && <path d="M95 175 L165 175 L172 215 L88 215 Z" fill="none" stroke={shade} strokeWidth="2" />}
      {(s === 'zipjacket' || s === 'jacket') && view === 'front' && <path d="M130 50 L130 230" stroke={shade} strokeWidth="2.5" />}
      {(s === 'sweat' || s === 'hoodie' || s === 'zipjacket') && <path d="M75 220 L185 220 M42 196 L64 198 M196 198 L218 196" stroke={shade} strokeWidth="3" fill="none" />}
      {s === 'jacket' && <path d="M110 22 L130 46 L150 22" stroke={shade} strokeWidth="3" fill="none" />}
      {marks.map((z) => {
        const cx = z.x * 2.6, cy = z.y * 2.5, w = z.w * 2.6;
        const zt = zoneText?.[z.id];
        if (zt) return (
          <text key={z.id} x={cx} y={cy + w * 0.06} textAnchor="middle" fontFamily={fontCss(textFont)} fontWeight={700} fontSize={Math.max(7, Math.min(w * 0.22, (w * 1.6) / Math.max(4, zt.length)))} fill={textColor || ink}>{zt}</text>
        );
        // Cadre du logo aux proportions réelles du gabarit (ex. 10 × 10 cm : carré) : la maquette montre la taille imprimée.
        const [GW, GH] = (z.size.match(/[\d.,]+/g) || ['1', '1']).map((n) => Number(n.replace(',', '.')));
        const fs = Math.max(6, w * 0.13), bh = w * (GH / GW) * (text ? 0.78 : 1), bw = w * (text ? 0.78 : 1);
        const by = cy - bh / 2 - (text ? fs * 0.6 : 0);
        return (
          <g key={z.id}>
            {logo ? (
              <image href={logo} x={cx - bw / 2} y={by} width={bw} height={bh} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <path d={`M${cx} ${cy - w * 0.32} L${cx + w * 0.22} ${cy + w * 0.08} L${cx + w * 0.08} ${cy + w * 0.08} L${cx} ${cy - w * 0.08} L${cx - w * 0.08} ${cy + w * 0.08} L${cx - w * 0.22} ${cy + w * 0.08} Z`} fill={ink} />
            )}
            {text && (
              <text x={cx} y={logo ? by + bh + fs : cy + w * 0.3} textAnchor="middle" fontFamily={fontCss(textFont)} fontWeight={600} fontSize={fs} fill={textColor || ink}>{text}</text>
            )}
            {text2 && (
              <text x={cx} y={(logo ? by + bh + fs : cy + w * 0.3) + fs * 1.15} textAnchor="middle" fontFamily={fontCss(textFont)} fontWeight={600} fontSize={Math.max(5, w * 0.11)} fill={textColor || ink}>{text2}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
