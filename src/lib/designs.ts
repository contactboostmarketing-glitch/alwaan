// Designs prêts à personnaliser pour les particuliers (EVJF/EVG, anniversaires, famille, fêtes).
// Chaque design produit une illustration SVG : le client tape son texte, voit le rendu sur le vêtement,
// et l'image générée devient le fichier imprimé (ce qu'il voit est ce qui est imprimé).
export type Occasion = { id: string; icon: string; fr: { name: string; sub: string }; en: { name: string; sub: string } };
export type Field = { key: string; fr: string; en: string; def: string; max: number };
export type Design = {
  id: string; occasion: string; fr: string; en: string; fields: Field[];
  products: string[]; // vêtements proposés (le premier par défaut)
  colors?: string[]; // couleurs conseillées
  svg: (v: Record<string, string>, ink: string, accent: string) => string;
};

export const OCCASIONS: Occasion[] = [
  { id: 'evjf-evg', icon: 'ring', fr: { name: 'EVJF & EVG', sub: 'Team Bride, Team Groom' }, en: { name: 'Hen & stag parties', sub: 'Team Bride, Team Groom' } },
  { id: 'anniversaire', icon: 'cake', fr: { name: 'Anniversaires', sub: 'Âge, année, prénom' }, en: { name: 'Birthdays', sub: 'Age, year, name' } },
  { id: 'famille', icon: 'users', fr: { name: 'Famille & fêtes', sub: 'Papa, maman, Noël, naissance' }, en: { name: 'Family & holidays', sub: 'Dad, mum, Christmas, baby' } },
  { id: 'papi-mamie', icon: 'grandparent', fr: { name: 'Papi & mamie', sub: 'Super papi, mamie en or' }, en: { name: 'Grandparents', sub: 'Super grandpa, golden granny' } },
  { id: 'retraite', icon: 'sun', fr: { name: 'Retraite', sub: 'Officiellement en retraite' }, en: { name: 'Retirement', sub: 'Officially retired' } },
  { id: 'saint-valentin', icon: 'heart', fr: { name: 'Saint-Valentin', sub: 'Pour les amoureux' }, en: { name: 'Valentine’s Day', sub: 'For lovers' } },
  { id: 'sport', icon: 'trophy', fr: { name: 'Sport & potes', sub: 'Nom et numéro, équipe' }, en: { name: 'Sport & mates', sub: 'Name and number, team' } },
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
    fields: [{ key: 'date', fr: 'Date', en: 'Date', def: '12.07.2027', max: 14 }],
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

DESIGNS.push(
  { id: 'super-papi', occasion: 'papi-mamie', fr: 'Super papi', en: 'Super grandpa', products: ['t-shirt-dogo', 'casquette-mercury', 'tablier-benoit', 'polo-pegaso'], colors: ['#1d2a5c', '#2f8a4d', '#ffffff'],
    fields: [{ key: 'titre', fr: 'Titre', en: 'Title', def: 'SUPER PAPI', max: 14 }, { key: 'prenoms', fr: 'Petits-enfants', en: 'Grandchildren', def: 'Léo · Emma · Jade', max: 30 }],
    svg: (v, ink, a) => svg(star(500, 250, 60, a) + txt(500, 470, 170, D, ink, v.titre, 'textLength="740" lengthAdjust="spacingAndGlyphs"') + `<line x1="200" y1="540" x2="800" y2="540" stroke="${a}" stroke-width="10"/>` + txt(500, 650, 70, G, ink, 'aimé par', 'font-style="italic"') + txt(500, 770, 90, S, a, v.prenoms)) },
  { id: 'mamie-en-or', occasion: 'papi-mamie', fr: 'Mamie en or', en: 'Golden granny', products: ['t-shirt-dogo', 't-shirt-fox', 'tablier-benoit'], colors: ['#ffffff', '#d43f8d', '#9aa0a6'],
    fields: [{ key: 'titre', fr: 'Titre', en: 'Title', def: 'Mamie', max: 12 }, { key: 'texte', fr: 'Sous-titre', en: 'Subtitle', def: 'en or depuis 2018', max: 24 }],
    svg: (v, ink, a) => svg(heart(500, 270, 3.4, a) + txt(500, 560, 240, S, ink, v.titre) + txt(500, 720, 80, G, a, v.texte, 'font-style="italic"') + heart(220, 640, 1.4, a) + heart(780, 640, 1.4, a)) },
  { id: 'papi-depuis', occasion: 'papi-mamie', fr: 'Papi depuis…', en: 'Grandpa since…', products: ['t-shirt-dogo', 'casquette-mercury', 'polo-pegaso'], colors: ['#151a2d', '#1d2a5c', '#9aa0a6'],
    fields: [{ key: 'titre', fr: 'Titre', en: 'Title', def: 'PAPI', max: 10 }, { key: 'annee', fr: 'Depuis', en: 'Since', def: '2020', max: 4 }],
    svg: (v, ink, a) => svg(txt(500, 380, 90, G, a, 'officiellement', 'font-style="italic"') + txt(500, 600, 260, D, ink, v.titre, 'textLength="700" lengthAdjust="spacingAndGlyphs"') + txt(500, 740, 90, D, a, `DEPUIS ${v.annee}`, 'letter-spacing="14"')) },
  { id: 'retraite-officielle', occasion: 'retraite', fr: 'Officiellement en retraite', en: 'Officially retired', products: ['t-shirt-dogo', 'casquette-mercury', 'polo-pegaso', 'tablier-benoit'], colors: ['#2fb3d6', '#ffffff', '#1d2a5c'],
    fields: [{ key: 'prenom', fr: 'Prénom', en: 'Name', def: 'Jean-Pierre', max: 16 }, { key: 'annee', fr: 'Année', en: 'Year', def: '2026', max: 4 }],
    svg: (v, ink, a) => svg(txt(500, 330, 80, D, ink, 'OFFICIELLEMENT', 'letter-spacing="10"') + txt(500, 520, 200, S, a, 'Retraité') + txt(500, 650, 110, D, ink, v.prenom, 'textLength="600" lengthAdjust="spacingAndGlyphs"') + txt(500, 780, 70, D, a, `DEPUIS ${v.annee} · PLUS DE RÉVEIL`, 'textLength="680" lengthAdjust="spacingAndGlyphs"')) },
  { id: 'retraite-mission', occasion: 'retraite', fr: 'Mission accomplie', en: 'Mission accomplished', products: ['t-shirt-dogo', 'casquette-mercury'], colors: ['#2f8a4d', '#151a2d', '#ffffff'],
    fields: [{ key: 'annees', fr: 'Années de carrière', en: 'Years of career', def: '42 ans de carrière', max: 26 }],
    svg: (v, ink, a) => svg(`<rect x="140" y="260" width="720" height="480" rx="30" fill="none" stroke="${ink}" stroke-width="12" stroke-dasharray="40 20"/>` + txt(500, 440, 120, D, ink, 'MISSION', 'letter-spacing="20"') + txt(500, 580, 120, D, a, 'ACCOMPLIE', 'letter-spacing="12"') + txt(500, 690, 60, G, ink, v.annees, 'font-style="italic"') + txt(500, 830, 70, D, ink, 'RETRAITE ✓', 'letter-spacing="12"')) },
  { id: 'love', occasion: 'saint-valentin', fr: 'Love + date', en: 'Love + date', products: ['t-shirt-dogo', 't-shirt-fox'], colors: ['#ffffff', '#c8302f', '#d43f8d'],
    fields: [{ key: 'prenoms', fr: 'Vos prénoms', en: 'Your names', def: 'Léa & Hugo', max: 22 }, { key: 'date', fr: 'Depuis le', en: 'Since', def: '14.02.2019', max: 14 }],
    svg: (v, ink, a) => svg(txt(500, 470, 280, S, a, 'Love') + heart(760, 300, 2.6, a) + txt(500, 640, 100, G, ink, v.prenoms, 'font-style="italic"') + txt(500, 770, 70, D, ink, v.date, 'letter-spacing="14"')) },
  { id: 'maillot', occasion: 'sport', fr: 'Maillot nom + numéro', en: 'Name + number jersey', products: ['t-shirt-dogo', 't-shirt-atomic-150'], colors: ['#3a5bd0', '#c8302f', '#ffffff', '#151a2d'],
    fields: [{ key: 'nom', fr: 'Nom', en: 'Name', def: 'MARTIN', max: 12 }, { key: 'numero', fr: 'Numéro', en: 'Number', def: '10', max: 3 }],
    svg: (v, ink) => svg(txt(500, 330, 120, D, ink, v.nom.toUpperCase(), 'textLength="600" lengthAdjust="spacingAndGlyphs"') + txt(500, 800, 470, D, ink, v.numero)) },
  { id: 'meilleure-maman', occasion: 'famille', fr: 'Meilleure maman', en: 'Best mum', products: ['t-shirt-dogo', 't-shirt-fox', 'tablier-benoit'], colors: ['#ffffff', '#d43f8d', '#f2d33b'],
    fields: [{ key: 'titre', fr: 'Titre', en: 'Title', def: 'Maman', max: 12 }, { key: 'texte', fr: 'Sous-titre', en: 'Subtitle', def: 'la meilleure du monde', max: 26 }],
    svg: (v, ink, a) => svg(star(240, 300, 40, a) + star(760, 300, 40, a) + txt(500, 520, 230, S, a, v.titre) + txt(500, 680, 80, G, ink, v.texte, 'font-style="italic"') + heart(500, 790, 1.8, a)) },
);

export const getDesign = (id: string) => DESIGNS.find((d) => d.id === id);
export const designsOf = (occasion: string) => DESIGNS.filter((d) => d.occasion === occasion);
