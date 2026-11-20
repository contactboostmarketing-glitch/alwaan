// Designs prêts à personnaliser pour les particuliers (EVJF/EVG, anniversaires, famille, fêtes).
// Chaque design produit une illustration SVG : le client tape son texte, voit le rendu sur le vêtement,
// et l'image générée devient le fichier imprimé (ce qu'il voit est ce qui est imprimé).
export type Occasion = { id: string; emoji: string; fr: { name: string; sub: string }; en: { name: string; sub: string } };
export type Field = { key: string; fr: string; en: string; def: string; max: number };
export type Design = {
  id: string; occasion: string; fr: string; en: string; fields: Field[];
  products: string[]; // vêtements proposés (le premier par défaut)
  colors?: string[]; // couleurs conseillées
  svg: (v: Record<string, string>, ink: string, accent: string) => string;
};

export const OCCASIONS: Occasion[] = [
  { id: 'evjf-evg', emoji: '💍', fr: { name: 'EVJF & EVG', sub: 'Team Bride, Team Groom' }, en: { name: 'Hen & stag parties', sub: 'Team Bride, Team Groom' } },
  { id: 'anniversaire', emoji: '🎂', fr: { name: 'Anniversaires', sub: 'Âge, année, prénom' }, en: { name: 'Birthdays', sub: 'Age, year, name' } },
  { id: 'famille', emoji: '👨‍👩‍👧', fr: { name: 'Famille & fêtes', sub: 'Papa, maman, Noël, naissance' }, en: { name: 'Family & holidays', sub: 'Dad, mum, Christmas, baby' } },
];

const D = "Impact, 'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const S = "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive";
const G = "Georgia, 'Times New Roman', serif";
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Cadre serré autour du texte (les designs sont dessinés dans un carré de 1000) : le design remplit le gabarit d'impression.
const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="90 160 820 740" width="1640" height="1480">${body}</svg>`;
const txt = (x: number, y: number, size: number, font: string, fill: string, s: string, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${fill}" text-anchor="middle" ${extra}>${esc(s)}</text>`;
const heart = (x: number, y: number, s: number, fill: string) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6C-4 -16 -20 -14 -20 -2C-20 8 -8 14 0 22C8 14 20 8 20 -2C20 -14 4 -16 0 -6Z" fill="${fill}"/>`;
const star = (x: number, y: number, r: number, fill: string) => `<path transform="translate(${x} ${y})" d="M0 ${-r}L${r * .29} ${-r * .4}L${r * .95} ${-r * .31}L${r * .47} ${r * .15}L${r * .59} ${r * .81}L0 ${r * .5}L${-r * .59} ${r * .81}L${-r * .47} ${r * .15}L${-r * .95} ${-r * .31}L${-r * .29} ${-r * .4}Z" fill="${fill}"/>`;
const flake = (x: number, y: number, r: number, c: string) => `<g transform="translate(${x} ${y})" stroke="${c}" stroke-width="${r / 6}" stroke-linecap="round">${[0, 60, 120].map((a) => `<line x1="0" y1="${-r}" x2="0" y2="${r}" transform="rotate(${a})"/>`).join('')}</g>`;

export const DESIGNS: Design[] = [
  { id: 'team-bride', occasion: 'evjf-evg', fr: 'Team Bride', en: 'Team Bride', products: ['t-shirt-dogo', 't-shirt-fox', 'casquette-mercury'], colors: ['#d43f8d', '#ffffff', '#151a2d'],
    fields: [{ key: 'date', fr: 'Date', en: 'Date', def: '12.07.2026', max: 14 }],
    svg: (v, ink, a) => svg(txt(500, 330, 120, D, ink, 'TEAM', 'letter-spacing="30"') + txt(500, 560, 250, S, a, 'Bride') + heart(500, 650, 2.2, a) + txt(500, 800, 80, D, ink, v.date, 'letter-spacing="10"')) },
  { id: 'bride', occasion: 'evjf-evg', fr: 'La mariée', en: 'The bride', products: ['t-shirt-dogo', 't-shirt-fox'], colors: ['#ffffff', '#d43f8d'],
    fields: [{ key: 'prenom', fr: 'Prénom de la mariée', en: 'Bride’s name', def: 'Julie', max: 14 }],
    svg: (v, ink, a) => svg(txt(500, 420, 260, S, a, 'Bride') + txt(500, 560, 70, D, ink, 'TO BE', 'letter-spacing="24"') + txt(500, 740, 130, G, ink, v.prenom, 'font-style="italic"') + heart(820, 300, 2, a)) },
  { id: 'team-groom', occasion: 'evjf-evg', fr: 'Team Groom', en: 'Team Groom', products: ['t-shirt-dogo', 'casquette-mercury', 't-shirt-atomic-150'], colors: ['#151a2d', '#1d2a5c', '#ffffff'],
    fields: [{ key: 'prenom', fr: 'Prénom du marié', en: 'Groom’s name', def: 'Thomas', max: 14 }, { key: 'date', fr: 'Date', en: 'Date', def: '2026', max: 12 }],
    svg: (v, ink, a) => svg(`<rect x="120" y="230" width="760" height="540" rx="40" fill="none" stroke="${a}" stroke-width="16"/>` + txt(500, 400, 140, D, ink, 'TEAM GROOM', 'textLength="680" lengthAdjust="spacingAndGlyphs"') + txt(500, 560, 110, S, a, v.prenom) + txt(500, 700, 70, D, ink, v.date, 'letter-spacing="14"')) },
  { id: 'since', occasion: 'anniversaire', fr: 'Since (année de naissance)', en: 'Since (birth year)', products: ['t-shirt-dogo', 't-shirt-fox', 'casquette-mercury'], colors: ['#151a2d', '#9aa0a6', '#ffffff'],
    fields: [{ key: 'annee', fr: 'Année', en: 'Year', def: '1986', max: 4 }],
    svg: (v, ink, a) => svg(txt(500, 330, 90, D, ink, 'LIMITED EDITION', 'letter-spacing="12"') + txt(500, 470, 110, G, a, 'since', 'font-style="italic"') + txt(500, 720, 300, D, ink, v.annee) + `<line x1="200" y1="770" x2="800" y2="770" stroke="${a}" stroke-width="12"/>`) },
  { id: 'age', occasion: 'anniversaire', fr: 'Mon âge en grand', en: 'Big age', products: ['t-shirt-dogo', 't-shirt-fox'], colors: ['#f2d33b', '#ffffff', '#3a5bd0'],
    fields: [{ key: 'age', fr: 'Âge', en: 'Age', def: '40', max: 3 }, { key: 'prenom', fr: 'Prénom', en: 'Name', def: 'Sophie', max: 14 }],
    svg: (v, ink, a) => svg(star(220, 260, 50, a) + star(800, 330, 36, a) + txt(500, 620, 420, D, ink, v.age) + txt(500, 760, 120, S, a, v.prenom) + txt(500, 860, 60, D, ink, 'ANS · YEARS', 'letter-spacing="14"')) },
  { id: 'joyeux-anniv', occasion: 'anniversaire', fr: 'Joyeux anniversaire', en: 'Happy birthday', products: ['t-shirt-dogo', 'casquette-mercury'], colors: ['#ffffff', '#2fb3d6', '#d43f8d'],
    fields: [{ key: 'prenom', fr: 'Prénom', en: 'Name', def: 'Lucas', max: 14 }],
    svg: (v, ink, a) => svg(txt(500, 360, 110, D, ink, 'JOYEUX', 'letter-spacing="20"') + txt(500, 500, 110, D, ink, 'ANNIVERSAIRE', 'textLength="720" lengthAdjust="spacingAndGlyphs"') + txt(500, 700, 170, S, a, v.prenom) + star(200, 650, 30, a) + star(800, 650, 30, a)) },
  { id: 'papa-depuis', occasion: 'famille', fr: 'Papa depuis…', en: 'Dad since…', products: ['t-shirt-dogo', 'tablier-benoit', 'casquette-mercury'], colors: ['#1d2a5c', '#151a2d', '#9aa0a6'],
    fields: [{ key: 'titre', fr: 'Titre', en: 'Title', def: 'PAPA', max: 10 }, { key: 'annee', fr: 'Depuis', en: 'Since', def: '2015', max: 4 }],
    svg: (v, ink, a) => svg(txt(500, 520, 260, D, ink, v.titre, 'textLength="740" lengthAdjust="spacingAndGlyphs"') + `<line x1="180" y1="590" x2="820" y2="590" stroke="${a}" stroke-width="10"/>` + txt(500, 700, 90, G, a, `depuis ${v.annee}`, 'font-style="italic"')) },
  { id: 'chef-papa', occasion: 'famille', fr: 'Chef du barbecue', en: 'BBQ chef', products: ['tablier-benoit', 'tablier-batali', 't-shirt-dogo'], colors: ['#151a2d', '#8b1e2d', '#1d2a5c'],
    fields: [{ key: 'prenom', fr: 'Prénom ou surnom', en: 'Name or nickname', def: 'Chef Papa', max: 14 }],
    svg: (v, ink, a) => svg(`<circle cx="500" cy="500" r="330" fill="none" stroke="${ink}" stroke-width="14"/>` + txt(500, 400, 80, D, a, 'GRILL MASTER', 'letter-spacing="10"') + txt(500, 560, 130, S, ink, v.prenom) + txt(500, 680, 60, D, a, 'BBQ · DEPUIS TOUJOURS', 'letter-spacing="6"')) },
  { id: 'noel-famille', occasion: 'famille', fr: 'Noël en famille', en: 'Family Christmas', products: ['t-shirt-dogo', 't-shirt-fox', 'casquette-mercury'], colors: ['#c8302f', '#2f8a4d', '#151a2d'],
    fields: [{ key: 'nom', fr: 'Nom de famille', en: 'Family name', def: 'Martin', max: 14 }, { key: 'annee', fr: 'Année', en: 'Year', def: '2026', max: 4 }],
    svg: (v, ink, a) => svg(flake(200, 230, 50, ink) + flake(800, 260, 40, ink) + flake(500, 180, 30, ink) + txt(500, 450, 130, D, ink, 'JOYEUX NOËL', 'textLength="720" lengthAdjust="spacingAndGlyphs"') + txt(500, 620, 140, S, a === ink ? ink : '#f2d33b', `famille ${v.nom}`) + txt(500, 760, 80, D, ink, v.annee, 'letter-spacing="20"')) },
  { id: 'bebe', occasion: 'famille', fr: 'Bientôt bébé', en: 'Baby on the way', products: ['t-shirt-dogo', 't-shirt-fox'], colors: ['#ffffff', '#9aa0a6', '#2fb3d6'],
    fields: [{ key: 'mois', fr: 'Arrivée prévue', en: 'Due date', def: 'Mars 2027', max: 14 }],
    svg: (v, ink, a) => svg(txt(500, 380, 110, D, ink, 'BIENTÔT', 'letter-spacing="24"') + heart(500, 520, 4, a) + txt(500, 700, 130, S, a, 'Baby') + txt(500, 820, 70, D, ink, v.mois, 'letter-spacing="8"')) },
];

export const getDesign = (id: string) => DESIGNS.find((d) => d.id === id);
export const designsOf = (occasion: string) => DESIGNS.filter((d) => d.occasion === occasion);
