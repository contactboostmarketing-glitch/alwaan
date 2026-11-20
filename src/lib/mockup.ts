'use client';
// Maquette validée (BAT) : on fige en image exactement ce que le client a vu et validé,
// puis on l'envoie au serveur. Le lien est joint à la commande pour l'atelier (et sert de preuve).

/** Dessine des SVG côte à côte sur fond blanc et renvoie un PNG. */
export async function snapshot(svgs: SVGSVGElement[], caption: string): Promise<Blob> {
  const W = 600, H = 577, pad = 20, top = 50;
  const c = document.createElement('canvas');
  c.width = svgs.length * W + pad * (svgs.length + 1); c.height = H + top + pad;
  const x = c.getContext('2d')!;
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#14213f'; x.font = 'bold 22px Arial, sans-serif'; x.fillText(caption, pad, 34);
  for (const [i, svg] of svgs.entries()) {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(W)); clone.setAttribute('height', String(H));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
    x.drawImage(img, pad + i * (W + pad), top, W, H);
    URL.revokeObjectURL(url);
  }
  return await new Promise<Blob>((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('PNG'))), 'image/png'));
}

/** Envoie la maquette et renvoie son identifiant (même stockage que les logos). */
export async function uploadMockup(png: Blob): Promise<string | null> {
  try {
    const body = new FormData(); body.append('file', new File([png], 'maquette-validee.png', { type: 'image/png' }));
    const r = await fetch('/api/logo', { method: 'POST', body });
    return r.ok ? (await r.json()).id : null;
  } catch { return null; }
}

/** Convertit un lien d'image en data URL (pour que l'image apparaisse dans la maquette exportée). */
export async function toDataUrl(src: string): Promise<string | undefined> {
  try {
    const b = await (await fetch(src)).blob();
    return await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(b); });
  } catch { return undefined; }
}
