'use client';
// Détourage automatique des logos, dans le navigateur (aucun envoi à un service tiers).
// Les logos arrivent souvent en JPG ou PNG sur fond blanc ou coloré : on repère la couleur du fond
// sur le pourtour de l'image, puis on rend transparent tout le fond relié au bord (remplissage depuis les bords).
// Le blanc À L'INTÉRIEUR du logo (lettres blanches, contours) est conservé, sauf si le client demande
// de retirer aussi le fond intérieur (ex. l'intérieur d'un « O »).
// Bords adoucis : les pixels de transition reçoivent une transparence partielle et perdent la teinte du fond.

export type CutMode = 'edges' | 'all' | 'none';
export type Cutout = { blob: Blob; url: string; w: number; h: number };
export type Analysis = { img: HTMLImageElement | HTMLCanvasElement; w: number; h: number; bg: [number, number, number] | null };

const MAX = 2400; // côté maximal traité (au-delà, on réduit : largement suffisant pour un gabarit de 30 cm)
const TOL = 42; // distance de couleur sous laquelle un pixel est du fond
const SOFT = 96; // jusqu'à cette distance, transparence partielle (bords lissés)

async function load(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  try { await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; }); }
  finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
  return img;
}

function pixels(src: CanvasImageSource, w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(src, 0, 0, w, h);
  return { c, x, d: x.getImageData(0, 0, w, h) };
}

/** Repère le fond : couleur dominante et uniforme du pourtour, ou null si le logo est déjà transparent ou sans fond net. */
export async function analyze(file: File): Promise<Analysis> {
  const img = await load(file);
  const s = Math.min(1, MAX / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const w = Math.max(1, Math.round((img.naturalWidth || img.width) * s)), h = Math.max(1, Math.round((img.naturalHeight || img.height) * s));
  if (/svg/.test(file.type)) return { img, w, h, bg: null };
  const { d } = pixels(img, w, h);
  const p = d.data, border: number[] = [];
  const step = Math.max(1, Math.floor((w + h) / 400));
  for (let i = 0; i < w; i += step) border.push(i, (h - 1) * w + i);
  for (let j = 0; j < h; j += step) border.push(j * w, j * w + w - 1);
  let transparent = 0;
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (const k of border) {
    const o = k * 4;
    if (p[o + 3] < 40) { transparent++; continue; }
    const key = ((p[o] >> 4) << 8) | ((p[o + 1] >> 4) << 4) | (p[o + 2] >> 4);
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += p[o]; e.g += p[o + 1]; e.b += p[o + 2]; buckets.set(key, e);
  }
  if (transparent > border.length * 0.5) return { img, w, h, bg: null }; // déjà détouré
  const top = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
  if (!top) return { img, w, h, bg: null };
  const bg: [number, number, number] = [top.r / top.n, top.g / top.n, top.b / top.n];
  // Le fond doit couvrir l'essentiel du pourtour, sinon c'est une photo ou un logo plein cadre : on ne touche à rien.
  let close = 0;
  for (const k of border) { const o = k * 4; if (p[o + 3] >= 40 && dist(p, o, bg) < TOL) close++; }
  return { img, w, h, bg: close > border.length * 0.6 ? bg : null };
}

const dist = (p: Uint8ClampedArray, o: number, c: [number, number, number]) =>
  Math.sqrt((p[o] - c[0]) ** 2 + (p[o + 1] - c[1]) ** 2 + (p[o + 2] - c[2]) ** 2);

/** Applique le détourage et recadre au plus près du logo. */
export async function cutout(a: Analysis, mode: CutMode): Promise<Cutout> {
  const { w, h, bg } = a;
  const { c, x, d } = pixels(a.img, w, h);
  const p = d.data;
  if (bg && mode !== 'none') {
    const alphaOf = (o: number) => { const k = dist(p, o, bg); return k <= TOL ? 0 : k >= SOFT ? 1 : (k - TOL) / (SOFT - TOL); };
    const clear = (i: number, al: number) => {
      const o = i * 4;
      if (al <= 0) { p[o + 3] = 0; return; }
      // Retire la teinte du fond mélangée au bord (sinon liseré blanc autour du logo).
      for (let ch = 0; ch < 3; ch++) p[o + ch] = Math.max(0, Math.min(255, (p[o + ch] - bg[ch] * (1 - al)) / al));
      p[o + 3] = Math.round(p[o + 3] * al);
    };
    if (mode === 'all') {
      for (let i = 0; i < w * h; i++) { const al = alphaOf(i * 4); if (al < 1) clear(i, al); }
    } else {
      // Remplissage depuis les bords : on ne traverse que le fond franc, les bords adoucis sont traités au passage.
      const seen = new Uint8Array(w * h), stack: number[] = [];
      const push = (i: number) => { if (!seen[i]) { seen[i] = 1; stack.push(i); } };
      for (let i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
      for (let j = 0; j < h; j++) { push(j * w); push(j * w + w - 1); }
      while (stack.length) {
        const i = stack.pop()!, o = i * 4;
        const al = p[o + 3] < 10 ? 0 : alphaOf(o);
        if (al >= 1) continue;
        clear(i, al);
        if (al > 0) continue; // pixel de bord : on s'arrête là
        const cx = i % w;
        if (cx > 0) push(i - 1);
        if (cx < w - 1) push(i + 1);
        if (i >= w) push(i - w);
        if (i < w * (h - 1)) push(i + w);
      }
    }
    x.putImageData(d, 0, 0);
  }
  // Recadrage au contenu visible (le logo remplit ainsi le gabarit choisi).
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (p[(j * w + i) * 4 + 3] > 12) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
  let out = c;
  if (x1 >= x0 && (x0 > 0 || y0 > 0 || x1 < w - 1 || y1 < h - 1)) {
    out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
    out.getContext('2d')!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  }
  const blob = await new Promise<Blob>((ok, ko) => out.toBlob((b) => (b ? ok(b) : ko(new Error('PNG'))), 'image/png'));
  // Aperçu léger pour la maquette (le fichier complet part à l'atelier).
  const s = Math.min(1, 480 / Math.max(out.width, out.height));
  const pv = document.createElement('canvas'); pv.width = Math.round(out.width * s); pv.height = Math.round(out.height * s);
  pv.getContext('2d')!.drawImage(out, 0, 0, pv.width, pv.height);
  return { blob, url: pv.toDataURL('image/png'), w: out.width, h: out.height };
}

/** Envoie un fichier au stockage des logos et renvoie son identifiant. */
export async function uploadFile(file: Blob, name: string): Promise<{ id?: string; error?: string }> {
  try {
    const body = new FormData(); body.append('file', new File([file], name, { type: file.type || 'image/png' }));
    const r = await fetch('/api/logo', { method: 'POST', body });
    const d = await r.json();
    return r.ok ? { id: d.id } : { error: d.error || 'Envoi du logo impossible.' };
  } catch { return { error: 'Envoi du logo impossible. Vérifiez votre connexion.' }; }
}
