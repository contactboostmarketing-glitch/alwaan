// Packs prêts à commander : une tenue complète en un clic, même logo sur chaque pièce.
export type Pack = { id: string; emoji: string; products: string[]; place: 'heart' | 'heart-back'; fr: { name: string; sub: string }; en: { name: string; sub: string } };

export const PACKS: Pack[] = [
  { id: 'restaurant', emoji: '🍽️', products: ['polo-pegaso', 'tablier-benoit', 'casquette-mercury'], place: 'heart',
    fr: { name: 'Pack restaurant', sub: 'Polo, tablier, casquette' }, en: { name: 'Restaurant pack', sub: 'Polo, apron, cap' } },
  { id: 'nouvel-arrivant', emoji: '👋', products: ['t-shirt-dogo', 'polo-pegaso', 'casquette-mercury'], place: 'heart',
    fr: { name: 'Kit nouvel arrivant', sub: 'T-shirt, polo, casquette' }, en: { name: 'New starter kit', sub: 'T-shirt, polo, cap' } },
  { id: 'chantier', emoji: '🦺', products: ['gilet-hv-beta', 't-shirt-dogo', 'casquette-mercury'], place: 'heart-back',
    fr: { name: 'Pack chantier', sub: 'Gilet HV, t-shirt, casquette' }, en: { name: 'Site pack', sub: 'Hi-vis vest, t-shirt, cap' } },
  { id: 'evenement', emoji: '🎉', products: ['t-shirt-atomic-150', 'casquette-barny'], place: 'heart-back',
    fr: { name: 'Pack événement', sub: 'T-shirt, casquette' }, en: { name: 'Event pack', sub: 'T-shirt, cap' } },
  { id: 'hotel', emoji: '🛎️', products: ['chemise-moscu-homme', 'polo-pegaso', 'tablier-mini'], place: 'heart',
    fr: { name: 'Pack hôtel', sub: 'Chemise, polo, tablier' }, en: { name: 'Hotel pack', sub: 'Shirt, polo, apron' } },
];
