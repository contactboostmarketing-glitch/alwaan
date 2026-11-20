// English catalogue content (same products, prices and slugs as the French site).
import type { Category, Product, Sector } from '@/lib/catalog';

export const COLOR_EN: Record<string, string> = {
  '#ffffff': 'White', '#f2d33b': 'Yellow', '#e8892b': 'Orange', '#c8302f': 'Red', '#8b1e2d': 'Burgundy',
  '#d43f8d': 'Fuchsia', '#3a5bd0': 'Royal blue', '#1d2a5c': 'Navy', '#2fb3d6': 'Turquoise', '#2f8a4d': 'Green',
  '#9aa0a6': 'Heather grey', '#151a2d': 'Black', '#b8a98d': 'Sand', '#d7f22c': 'Fluo yellow', '#ff7a1a': 'Fluo orange',
};

export const ZONE_EN: Record<string, string> = {
  heart: 'Left chest', antiheart: 'Right chest', chest: 'Large front', 'shoulder-right': 'Right sleeve',
  'shoulder-left': 'Left sleeve', back: 'Back', neck: 'Nape', face: 'Front',
};

export const GENERAL_FAQ_EN: [string, string][] = [
  ['Is there a minimum order?', 'No, you can order from 1 piece. Printing gets cheaper automatically: -15% from 5 pieces, -20% from 10 and -40% from 30 (except the large front, which has a fixed price). Pieces carrying the same logo add up, even across different garments.'],
  ['When will I receive my order?', '7 working days after your order. The estimated delivery date is shown on the product page and in the cart.'],
  ['Which logo file should I send?', 'A PNG with a transparent background or an SVG, as large as possible (at least 800 pixels wide). If your logo has a background, the site removes it for you or keeps it, your choice. No logo? You can print a simple text.'],
  ['Can I return a personalised garment?', 'Garments printed with your logo are made to order, so the right of withdrawal does not apply (French Consumer Code, art. L221-28 3°). A printing defect or a mistake on our side is reprinted at our expense.'],
];

type CatEn = Pick<Category, 'name' | 'singular' | 'title' | 'intro' | 'faq'> & { details: string[] };
export const CATEGORIES_EN: Record<string, CatEn> = {
  'polos-personnalises': { name: 'Polo shirts', singular: 'polo shirt', title: 'Custom polo shirts printed with your logo',
    intro: 'Polo shirts printed with your logo for restaurants, front desks and field teams. Piqué cotton, short or long sleeves, S to 5XL.',
    faq: [['Which fabric weight for a work polo?', '180 to 220 g/m² for daily wear in a restaurant or shop. Heavier polos are thicker and handle frequent washing better.'],
      ['What is DTF printing?', 'DTF (Direct To Film) prints your logo on a film, then heat-transfers it onto the fabric. It reproduces every colour, gradient and fine detail, on cotton or polyester, from 1 piece, and is wash-resistant.']],
    details: [
      'The polo shirt is the most versatile workwear: smarter than a t-shirt, more practical than a shirt. It suits restaurants, front desks, retail, tradespeople and field teams.',
      'For daily wear, choose a 200 to 220 g/m² piqué: it keeps its shape and withstands frequent washing. Polyester-cotton blends dry faster and pill less than 100% cotton.',
      'The logo usually goes on the left chest, often with a large print on the back to be seen from afar. Women’s cuts, more fitted, let you dress the whole team in the same model.'] },
  't-shirts-personnalises': { name: 'T-shirts', singular: 't-shirt', title: 'Custom t-shirts from 1 piece',
    intro: 'Custom t-shirts for events, associations, clubs and teams. Organic or classic cotton, 12+ colours, from 1 piece.',
    faq: [['Which t-shirt for a one-day event?', 'A 150 g/m² such as the Atomic 150 is enough and is the most affordable in large quantities.'],
      ['Can a photo be printed on a t-shirt?', 'Yes, DTF printing reproduces photos and gradients on light or dark fabric.']],
    details: [
      'The custom t-shirt is the most affordable way to dress a team, a club or event participants. It comes in classic cotton, organic cotton or breathable technical fabric for sport.',
      'Fabric weight makes the difference: 150 g/m² for a one-off event, 180 g/m² and more for a t-shirt worn all year. Side-seamless models fit better and stay comfortable.',
      'DTF printing reproduces a colour logo, a photo or an event design, from 1 piece and with no set-up fee.'] },
  'chemises-personnalisees': { name: 'Shirts', singular: 'shirt', title: 'Custom shirts with your logo',
    intro: 'Shirts with your logo for hotels, reception desks and hospitality. Men’s and women’s cuts, easy-iron.',
    faq: [['Where should the logo go on a shirt?', 'Most often on the left chest, with a logo 6 to 9 cm wide.']],
    details: [
      'A custom shirt gives a polished image to hotels, reception and consulting. A discreet logo on the chest is enough to identify your team.',
      'Choose a fabric with a little elastane and an easy-iron finish: the shirt stays comfortable all day and looks sharp after washing.',
      'Men’s and women’s cuts come in the same colour for a consistent look.'] },
  'tabliers-personnalises': { name: 'Aprons', singular: 'apron', title: 'Custom aprons for restaurants',
    intro: 'Bib, waist and denim aprons with your logo for restaurants, bars, bakeries and cafés.',
    faq: [['What logo size on an apron?', '8 to 12 cm wide on the bib to stay readable from a distance.']],
    details: [
      'The apron is often the most visible part of a restaurant, bakery, bar or café outfit. It protects clothes and carries your logo at the customer’s eye level.',
      'Bib aprons suit the kitchen and counter, waist aprons the dining room, denim aprons trendier venues.',
      'All our aprons are one size with adjustable ties: one reference for the whole team.'] },
  'casquettes-personnalisees': { name: 'Caps', singular: 'cap', title: 'Custom caps with your logo',
    intro: '6-panel, trucker and technical caps with your logo, DTF printed. Adjustable, ideal in the kitchen, at trade shows and outdoors.',
    faq: [['Are the caps adjustable?', 'Yes, all our caps have an adjustable strap: one size fits the whole team.']],
    details: [
      'A custom cap is a simple, affordable visibility item: in the kitchen, for take-away, at a trade show, on a building site or an outdoor event.',
      'All our caps are adjustable: one size fits everyone, which makes ordering easy.',
      'The logo goes on the front, the most visible area. Light technical caps suit sport and summer, cotton caps everyday wear.'] },
  'haute-visibilite-personnalisee': { name: 'Hi-vis', singular: 'hi-vis garment', title: 'Custom hi-vis workwear EN ISO 20471',
    intro: 'EN ISO 20471 compliant hi-vis vests, jackets and parkas with your logo for construction, logistics and road works.',
    faq: [['Does the print void the EN ISO 20471 standard?', 'No, as long as the logo does not cover the reflective tapes or the minimum fluorescent area. We place the print accordingly.']],
    details: [
      'Hi-vis garments protect people exposed to traffic or machinery: construction, road works, logistics, warehouses, security. They must comply with EN ISO 20471.',
      'The standard defines three classes based on fluorescent material and reflective tape area. A class 2 vest covers most uses; class 3 is required for the most exposed work.',
      'Your logo can be added without losing compliance, as long as it does not cover the tapes and keeps the minimum fluorescent area: we place the print accordingly.'] },
};

export const SECTORS_EN: Record<string, Pick<Sector, 'name' | 'sub' | 'h1' | 'intro'>> = {
  restauration: { name: 'Restaurants', sub: 'Polos, aprons, caps', h1: 'Custom restaurant uniforms', intro: 'Polo shirts, aprons and caps with your logo for the dining room, the counter and the kitchen.' },
  hotellerie: { name: 'Hotels', sub: 'Shirts, polos, aprons', h1: 'Hotel uniforms with your logo', intro: 'Shirts and polo shirts with your logo for reception, service and housekeeping.' },
  'btp-logistique': { name: 'Construction & logistics', sub: 'Hi-vis, t-shirts', h1: 'Custom workwear for building sites', intro: 'Certified hi-vis, t-shirts and caps with your logo for your field teams.' },
  'evenementiel-associations': { name: 'Events & associations', sub: 'T-shirts, caps', h1: 'T-shirts and caps for your events', intro: 'Custom t-shirts, caps and polo shirts for trade shows, clubs, associations and parties.' },
};

export const PRODUCTS_EN: Record<string, Pick<Product, 'name' | 'type' | 'composition'>> = {
  'polo-pegaso': { name: 'Pegaso polo shirt', type: 'Premium piqué polo', composition: '65% polyester, 35% cotton · 210 g/m²' },
  'polo-montreal': { name: 'Montreal polo shirt', type: 'Contrast trim polo', composition: '100% piqué cotton · 220 g/m²' },
  'polo-estrella': { name: 'Estrella polo shirt', type: 'Long sleeves', composition: '100% cotton · 210 g/m²' },
  't-shirt-dogo': { name: 'Dogo t-shirt', type: 'Premium cotton crew neck', composition: '100% combed cotton · 180 g/m²' },
  't-shirt-atomic-150': { name: 'Atomic 150 t-shirt', type: 'Best value', composition: '100% cotton · 150 g/m²' },
  't-shirt-fox': { name: 'Fox t-shirt', type: 'Organic heather cotton', composition: '85% organic cotton, 15% viscose · 160 g/m²' },
  'chemise-moscu-homme': { name: 'Moscu shirt, men', type: 'Long sleeves', composition: '97% cotton, 3% elastane' },
  'chemise-moscu-femme': { name: 'Moscu shirt, women', type: 'Fitted cut', composition: '97% cotton, 3% elastane' },
  'tablier-benoit': { name: 'Benoit apron', type: 'Adjustable bib', composition: '65% polyester, 35% cotton · 210 g/m²' },
  'tablier-mini': { name: 'Mini apron', type: 'Waist apron', composition: '65% polyester, 35% cotton' },
  'tablier-batali': { name: 'Batali apron', type: 'Denim, front pocket', composition: '100% cotton denim · 250 g/m²' },
  'casquette-mercury': { name: 'Mercury cap', type: 'Technical 6-panel', composition: '90% polyester, 10% elastane' },
  'casquette-wizer': { name: 'Wizer cap', type: 'Light microfibre', composition: '100% polyester' },
  'casquette-barny': { name: 'Barny cap', type: 'Mesh trucker', composition: 'Polyester, mesh back' },
  'gilet-hv-beta': { name: 'Beta hi-vis vest', type: 'Multi-pocket, EN ISO 20471 class 2', composition: '100% polyester' },
  'veste-hv-persei': { name: 'Persei hi-vis jacket', type: 'Reversible, lined, class 3', composition: '100% polyester' },
  'parka-hv-epsilon': { name: 'Epsilon hi-vis parka', type: 'Waterproof, hood, class 3', composition: 'PU-coated polyester' },
};

export const HOME_EN_ABOUT = [
  'alwaan prints your workwear and promotional clothing with your logo: polo shirts, t-shirts, shirts, aprons, caps and EN ISO 20471 hi-vis garments. We equip restaurants, hotels, shops, tradespeople, construction and logistics companies, clubs and associations in France and Belgium.',
  'Printing is done in high-definition DTF: vivid colours, gradients and fine details, on light or dark fabric. Order from 1 piece, with no set-up fee. Printing gets cheaper automatically: 15% off from 5 pieces, 20% from 10 and 40% from 30, adding up all pieces carrying the same logo.',
  'The mock-up is shown live with your logo, background removed automatically if needed. The approved mock-up is your print proof: the print reproduces it faithfully. Production in 7 working days, free delivery from €150 excl. VAT.',
];
