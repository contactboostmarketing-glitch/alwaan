'use client';
// Date limite de la saison (Noël : « commandez avant le … pour être livré au plus tard le 24 décembre ») sur les pages
// produits, catégories, métiers et villes : les annonces y renvoient, la promesse doit y être visible.
// Calcul côté navigateur : les pages sont générées à l'avance, la date doit être celle du jour.
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { currentSeason, orderBy } from '@/lib/seasons';
import { I } from '@/components/Icons';

const PAGES = /^\/(en\/)?(vetements|vetements-personnalises|metiers|produits|clothing|industries|products)(\/|$)/;

export function DeadlineStrip() {
  const path = usePathname() || '';
  const [txt, setTxt] = useState('');
  useEffect(() => {
    if (!PAGES.test(path)) { setTxt(''); return; }
    const s = currentSeason(), until = orderBy(s);
    if (!until || s.id !== 'noel') { setTxt(''); return; }
    const en = path.startsWith('/en');
    const d = until.toLocaleDateString(en ? 'en-GB' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    setTxt(en ? `Christmas: order by ${d} to receive it by 24 December` : `Noël : commandez avant le ${d} pour être livré au plus tard le 24 décembre`);
  }, [path]);
  if (!txt) return null;
  return <div className="deadline-strip" role="note"><I name="clock" size={15} /> {txt}</div>;
}
