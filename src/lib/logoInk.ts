// Lisibilité du logo sur la couleur du textile : couleur moyenne, contraste, et version monochrome (blanc, noir…).
const load = (src: string) => new Promise<HTMLImageElement | null>((ok) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

/** Couleur moyenne des pixels visibles du logo (transparence ignorée) et part de l'image couverte (≈1 : logo sur fond plein). */
export async function logoAverage(src: string): Promise<{ avg: string; cover: number; ratio: number } | null> {
  const img = await load(src); if (!img) return null;
  try {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d')!; x.drawImage(img, 0, 0, 64, 64);
    const d = x.getImageData(0, 0, 64, 64).data; let r = 0, g = 0, b = 0, n = 0;
    let x0 = 64, y0 = 64, x1 = -1, y1 = -1;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; const px = (i / 4) % 64, py = Math.floor(i / 256); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
    // Proportions de la partie visible (marges transparentes exclues).
    const ratio = n ? (((x1 - x0 + 1) / 64) * (img.naturalWidth || 1)) / (((y1 - y0 + 1) / 64) * (img.naturalHeight || 1)) : 1;
    return n ? { avg: '#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join(''), cover: n / (64 * 64), ratio } : null;
  } catch { return null; }
}
const lum = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0); };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/** Logo en une seule couleur (forme conservée, transparence gardée), en PNG prêt à imprimer. */
export async function monochrome(src: string, hex: string): Promise<{ blob: Blob; url: string } | null> {
  const img = await load(src); if (!img) return null;
  const s = Math.min(1, 2400 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round((img.naturalWidth || 600) * s)); c.height = Math.max(1, Math.round((img.naturalHeight || 600) * s));
  const x = c.getContext('2d')!; x.drawImage(img, 0, 0, c.width, c.height);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = hex; x.fillRect(0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/png'));
  return blob ? { blob, url: c.toDataURL('image/png') } : null;
}
