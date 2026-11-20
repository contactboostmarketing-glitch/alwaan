'use client';
// Logo du client : détourage automatique, choix en un tap, envoi du fichier final à l'atelier.
// Le fichier envoyé (logoId) est exactement celui affiché sur la maquette validée (BAT).
import { useRef, useState } from 'react';
import { analyze, cutout, uploadFile, type Analysis, type CutMode } from '@/lib/cutout';

export const LOW_RES = 800;

export type LogoState = {
  name: string;
  preview?: string; // aperçu affiché sur la maquette
  id?: string; // fichier final pour l'atelier (détouré si demandé)
  sourceId?: string; // fichier d'origine envoyé par le client
  hasBg: boolean; // un fond a été détecté
  decided: boolean; // le client a choisi lui-même : avec ou sans fond (obligatoire si un fond est détecté)
  previews?: Partial<Record<CutMode, string>>; // aperçus de chaque choix
  mode: CutMode;
  lowRes: boolean;
  busy: boolean;
  error?: string;
};

export function useLogo(onChange?: (l: LogoState) => void) {
  const [logo, setLogoState] = useState<LogoState | null>(null);
  const job = useRef(0);
  const ana = useRef<{ a: Analysis; file: File } | null>(null);
  const set = (l: LogoState | null) => { setLogoState(l); if (l) onChange?.(l); };

  const render = async (mode: CutMode, base0: LogoState, n: number): Promise<LogoState | null> => {
    const { a, file } = ana.current!;
    let base = base0;
    set({ ...base, mode, busy: true, id: undefined, error: undefined });
    try {
      const svg = /svg/.test(file.type);
      // SVG ou fond conservé : on garde le fichier d'origine tel quel (pas de recompression).
      const keep = svg || mode === 'none' || !a.bg;
      const cut = keep && svg ? null : await cutout(a, keep ? 'none' : mode);
      if (n !== job.current) return null;
      const preview = cut ? cut.url : base.preview;
      base = { ...base, previews: { ...base.previews, [mode]: preview } };
      set({ ...base, mode, preview, busy: true, id: undefined });
      const up = keep && base.sourceId ? { id: base.sourceId } : await uploadFile(cut ? cut.blob : file, keep ? file.name : `${file.name.replace(/\.[a-z0-9]+$/i, '')}-detoure.png`);
      if (n !== job.current) return null;
      const done = { ...base, mode, preview, busy: false, id: up.id, error: up.error };
      set(done);
      return done;
    } catch {
      if (n === job.current) set({ ...base, mode, busy: false, error: 'Ce fichier ne s\'ouvre pas. Essayez un PNG ou un JPG.' });
      return null;
    }
  };

  /** Nouveau fichier : analyse du fond, détourage par défaut si un fond uni est détecté. */
  const pick = async (file: File): Promise<LogoState | null> => {
    if (!file.type.startsWith('image/')) {
      set({ name: file.name, hasBg: false, decided: true, mode: 'none', lowRes: false, busy: false, error: 'Envoyez votre logo en PNG, JPG ou SVG pour le voir sur la maquette.' });
      return null;
    }
    const n = ++job.current;
    set({ name: file.name, hasBg: false, decided: true, mode: 'none', lowRes: false, busy: true });
    try {
      const a = await analyze(file);
      if (n !== job.current) return null;
      ana.current = { a, file };
      const nat = a.img instanceof HTMLImageElement ? Math.max(a.img.naturalWidth, a.img.naturalHeight) : Math.max(a.w, a.h);
      const lowRes = !/svg/.test(file.type) && nat < LOW_RES;
      // Original conservé pour l'atelier, en parallèle.
      const src = uploadFile(file, file.name);
      const first = await cutout(a, 'none');
      // Fond détecté : on montre le logo sans fond, mais le client doit confirmer son choix.
      const base: LogoState = { name: file.name, preview: first.url, previews: { none: first.url }, hasBg: !!a.bg, decided: !a.bg, mode: a.bg ? 'edges' : 'none', lowRes, busy: true, sourceId: (await src).id };
      if (n !== job.current) return null;
      return await render(base.mode, base, n);
    } catch {
      if (n === job.current) set({ name: file.name, hasBg: false, decided: true, mode: 'none', lowRes: false, busy: false, error: 'Ce fichier ne s\'ouvre pas. Essayez un PNG ou un JPG.' });
      return null;
    }
  };

  const choose = (mode: CutMode) => {
    if (!logo || !ana.current) return;
    if (mode === logo.mode) { set({ ...logo, decided: true }); return; }
    render(mode, { ...logo, decided: true }, ++job.current);
  };

  const clear = () => { job.current++; ana.current = null; setLogoState(null); };
  return { logo, pick, choose, clear };
}

/** Question posée au client quand son logo a un fond : deux images, un tap. */
export function CutoutChoice({ logo, choose }: { logo: LogoState | null; choose: (m: CutMode) => void }) {
  if (!logo?.hasBg) return null;
  const pv = logo.previews || {};
  const cut = logo.mode === 'all' ? pv.all : pv.edges;
  const tile = (m: CutMode, src: string | undefined, label: string) => (
    <button className="cut-opt" aria-pressed={logo.decided && (m === 'none' ? logo.mode === 'none' : logo.mode !== 'none')} disabled={logo.busy && !src} onClick={() => choose(m)}>
      <span className="cut-prev">{src ? <img src={src} alt="" /> : <i className="spin" />}</span>
      <b>{label}</b>
    </button>
  );
  return (
    <div className={`cutout ${logo.decided ? '' : 'ask'}`} role="group" aria-label="Fond du logo">
      <p><b>Votre logo a un fond. On le garde ?</b></p>
      <div className="cut-opts">
        {tile(logo.mode === 'all' ? 'all' : 'edges', cut, 'Sans fond')}
        {tile('none', pv.none, 'Avec fond')}
      </div>
      {logo.decided && logo.mode !== 'none' && (
        <button className="link small" disabled={logo.busy} onClick={() => choose(logo.mode === 'all' ? 'edges' : 'all')}>
          {logo.mode === 'all' ? 'Garder l\'intérieur du logo' : 'Retirer aussi le fond dans les lettres'}
        </button>
      )}
    </div>
  );
}
