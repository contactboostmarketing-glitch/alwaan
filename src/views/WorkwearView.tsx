import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CATEGORIES, EXPRESS_FEES, FREE_SHIPPING_HT, PREMIUM_MARK, PREMIUM_PRICE, RELAY_HT, SAMPLE_EXTRA_DAYS, SAMPLE_MIN, SHIPPING_HT, TIERS, ZONES,
  capPrice, defaultColor, fromPrice, getProduct, productsIn,
} from '@/lib/catalog';
import { EXPRESS_DAYS, PRODUCTION_DAYS, deliveryDate, fmtDay } from '@/lib/delivery';
import { eur } from '@/lib/pricing';
import { currentSeason, orderBy } from '@/lib/seasons';
import { getGuide } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';
import type { PriceRow } from '@/lib/categorySeo';
import { Breadcrumbs, Faq, JsonLd, LinkChips, Perks } from '@/components/ui';
import { Garment } from '@/components/Garment';
import { Price } from '@/components/Price';
import { PriceExamples } from '@/components/PriceExamples';
import { I } from '@/components/Icons';
import { categoryL, href, productL, tr, type Lang } from '@/i18n';
import { alternates } from '@/i18n/seo';

// Page hub « Vêtements de travail personnalisés » (I7 de l'audit Ads, priorité Semrush) :
// vetement de travail personnalisé 480, vêtement personnalisé entreprise 590, personnalisation / personnalisable 210 + 210,
// tenue de travail personnalisée 110, vêtement logo entreprise 70. Page d'arrivée du groupe Google Ads du même nom.
export const WORKWEAR_PATH = '/vetements-de-travail-personnalises';

const tiers = TIERS.filter(([, d]) => d > 0);
const pct = (d: number) => Math.round(d * 100);
const [maxQty, maxOff] = [tiers[tiers.length - 1][0], pct(tiers[tiers.length - 1][1])];
/** Montant rond sans décimales (« 6 € », « €6 »), sinon format monétaire complet. */
const e = (n: number, lang: Lang) => (Number.isInteger(n) ? (lang === 'en' ? `€${n}` : `${n} €`) : eur(n, lang));
const tiersTxt = (lang: Lang) => tiers.map(([m, d], i) => (lang === 'en' ? `-${pct(d)}% from ${m}${i ? '' : ' pieces'}` : `-${pct(d)} % dès ${m}${i ? '' : ' pièces'}`))
  .join(', ').replace(/, (?=[^,]*$)/, lang === 'en' ? ' and ' : ' et ');
const expressTxt = (lang: Lang) => EXPRESS_FEES.map(([max, fee], i) => (lang === 'en'
  ? (max === Infinity ? `${e(fee, lang)} above` : `${e(fee, lang)}${i ? '' : ' excl. VAT'} up to ${max}${i ? '' : ' pieces'}`)
  : (max === Infinity ? `${e(fee, lang)} au-delà` : `${e(fee, lang)}${i ? '' : ' HT'} jusqu'à ${max}${i ? '' : ' pièces'}`))).join(', ');
const BACK = ZONES.find((z) => z.id === 'back')!.price;
const CAP = 'casquette-mercury';

/** Exemples de prix : un modèle phare par famille, logo à l'emplacement le plus courant. */
const ROWS: [string, string[], string, string][] = [
  ['polo-pegaso', ['heart'], 'logo au cœur', 'left-chest logo'],
  ['t-shirt-dogo', ['heart'], 'logo au cœur', 'left-chest logo'],
  ['chemise-moscu-homme', ['heart'], 'logo au cœur', 'left-chest logo'],
  ['sweat-clasica', ['heart'], 'logo au cœur', 'left-chest logo'],
  ['softshell-nebraska', ['heart'], 'logo au cœur', 'left-chest logo'],
  ['gilet-hv-beta', ['heart'], 'logo au cœur', 'left-chest logo'],
  ['tablier-benoit', ['pocket'], 'logo sur la poche', 'pocket logo'],
  [CAP, ['heart'], 'logo de face', 'front logo'],
];
const rows = (lang: Lang): PriceRow[] => ROWS.flatMap(([slug, zones, fr, en]) => {
  const p = getProduct(slug); return p ? [{ slug, zones, label: `${productL(lang, p).name}, ${lang === 'en' ? en : fr}` }] : [];
});

const T = {
  fr: {
    title: 'Vêtements de travail personnalisés pour entreprise',
    description: `Polos, t-shirts, sweats, gilets haute visibilité et tabliers à votre logo, dès 1 pièce. Maquette et prix en direct, expédiés en ${PRODUCTION_DAYS} jours ouvrés.`,
    crumb: 'Vêtements de travail personnalisés', kicker: 'Entreprises, artisans, commerces, associations',
    h1: 'Vêtements de travail personnalisés à votre logo',
    lead: `alwaan imprime vos vêtements de travail à votre logo dans son atelier d'Haubourdin, près de Lille : polos, t-shirts, chemises, sweats, vestes, haute visibilité, tabliers et casquettes. Vous commandez dès 1 pièce, sans frais de préparation, avec la maquette et le prix affichés en direct. Production en ${PRODUCTION_DAYS} jours ouvrés, livraison en France et en Belgique.`,
    perks: ['Dès 1 pièce', 'Maquette et prix en direct', `Marquage -${maxOff} % dès ${maxQty} pièces`, 'Commandé aujourd\'hui, reçu vers le {d}'],
    cta: 'Créer ma tenue en 1 minute', cta2: 'Lien d\'équipe', cta3: 'Demander un devis',
    deadline: 'Pour Noël : commandez avant le {d} pour être livré au plus tard le {t}.',
    catsH: 'Choisissez votre vêtement de travail',
    catsSub: 'Chaque modèle se personnalise à votre logo, en impression DTF, sur coton comme sur polyester. Prix « dès » au meilleur palier de quantité.',
    jobsH: 'Quel vêtement pour quel métier ?',
    jobs: [
      ['utensils', 'Restauration, cafés et horeca', 'Polo ou t-shirt en salle, tablier à votre logo, casquette en cuisine.', '/metiers/restauration'],
      ['building', 'Hôtellerie et accueil', 'Chemise ou polo à la réception, tablier pour le service.', '/metiers/hotellerie'],
      ['helmet', 'BTP, artisans et logistique', 'Gilet haute visibilité, t-shirt, softshell ou polaire pour l\'hiver.', '/metiers/btp-logistique'],
      ['party', 'Événements et associations', 'T-shirts et casquettes pour l\'équipe, gilets jaunes pour les bénévoles.', '/metiers/evenementiel-associations'],
      ['trophy', 'Clubs sportifs', 'Tenues d\'équipe et boutique du club : chacun commande la sienne.', '/clubs-associations'],
      ['briefcase', 'Commerces et bureaux', 'Polo, chemise ou sweat à votre logo, pour une équipe reconnaissable.', '/vetements/polos-personnalises'],
    ],
    priceH: 'Combien coûte un vêtement de travail personnalisé ?',
    price1: `Le prix comprend le vêtement et le marquage, sans frais de préparation. Le marquage baisse automatiquement : ${tiersTxt('fr')}, en cumulant toutes les pièces au même logo, même sur des vêtements différents (hors grand devant, à prix fixe). Le vêtement garde son prix.`,
    price2: `Un logo au dos ajoute ${e(BACK, 'fr')} HT par pièce avant remise (${e(PREMIUM_MARK, 'fr')} HT sur les vêtements vendus plus de ${e(PREMIUM_PRICE, 'fr')} HT). Casquettes : prix logo compris, dégressif jusqu'à ${eur(capPrice(CAP, 100) ?? 0)} HT dès 100 pièces. Livraison offerte dès ${e(FREE_SHIPPING_HT, 'fr')} HT d'articles, sinon ${eur(SHIPPING_HT)} HT à domicile ou ${eur(RELAY_HT)} HT en point relais.`,
    stepsH: 'Commander pour toute une équipe',
    steps: [['shirt', 'Choisissez le vêtement', 'Modèle, couleur et emplacement du logo'], ['upload', 'Ajoutez votre logo', 'Fond retiré automatiquement, maquette en direct'], ['users', 'Partagez le lien d\'équipe', 'Chacun indique son nom et sa taille'], ['truck', `Expédié en ${PRODUCTION_DAYS} jours ouvrés`, `${EXPRESS_DAYS} en express, photo de contrôle avant envoi`]],
    pay: 'Paiement par carte, Apple Pay ou Google Pay, ou par virement pour les pros connectés à leur compte client. Le devis PDF se télécharge en un clic depuis le panier. Au-delà de 50 pièces ou pour plusieurs modèles, demandez un devis : réponse sous 24 h ouvrées.',
    whyH: 'Ce qui change avec alwaan',
    why: [['home', 'Imprimé dans notre atelier', 'À Haubourdin, près de Lille'], ['eye', 'Maquette = bon à tirer', 'Imprimé comme vous l\'avez validé'], ['one', 'Dès 1 pièce', 'Sans minimum ni frais de préparation'], ['tag', `-${maxOff} % dès ${maxQty} pièces`, `Marquage dégressif dès ${tiers[0][0]} pièces au même logo`], ['zap', `Express ${EXPRESS_DAYS} jours ouvrés`, 'En option, pour les urgences'], ['camera', 'Photo avant envoi', 'Chaque commande contrôlée'], ['redo', 'Défaut ? Refait', 'À nos frais, signalé sous 7 jours avec photo'], ['bank', 'Virement pour les pros', 'Depuis votre compte client']],
    faqH: 'Questions fréquentes',
    faq: [
      ['Y a-t-il un minimum pour des vêtements de travail personnalisés ?', `Non, vous commandez dès 1 pièce, sans frais de préparation. Le marquage baisse automatiquement : ${tiersTxt('fr')} au même logo, tous vêtements confondus.`],
      ['Quel délai pour recevoir les tenues de mon équipe ?', `${PRODUCTION_DAYS} jours ouvrés de production après la commande, puis la livraison. En express, la production passe à ${EXPRESS_DAYS} jours ouvrés (${expressTxt('fr')}). La date estimée s'affiche sur la page produit et dans le panier.`],
      ['Brodez-vous les logos ?', 'Non. Tous nos marquages sont imprimés en DTF : le logo garde toutes ses couleurs et ses détails, sur coton comme sur polyester, dès 1 pièce. Nous ne faisons ni broderie ni sérigraphie.'],
      ['Comment récupérer les tailles de toute l\'équipe ?', 'Avec le lien d\'équipe : vous le partagez, chacun indique son nom, son prénom et sa taille, et votre panier se remplit seul. Vous validez ensuite une seule commande.'],
      ['Peut-on payer par virement et obtenir un devis ?', 'Oui. Les pros connectés à leur compte client peuvent payer par virement : la production démarre à réception des fonds. Un devis PDF se télécharge en un clic depuis le panier. Pour plus de 50 pièces ou plusieurs modèles, le formulaire de devis vous apporte une réponse sous 24 h ouvrées.'],
      ['Livrez-vous en Belgique ?', `Oui, en France métropolitaine et en Belgique, aux mêmes conditions : livraison offerte dès ${e(FREE_SHIPPING_HT, 'fr')} HT d'articles, sinon ${eur(SHIPPING_HT)} HT (Colissimo) ou ${eur(RELAY_HT)} HT en point relais Mondial Relay. Un client professionnel établi en Belgique qui communique un numéro de TVA intracommunautaire valide avant la commande est facturé hors taxes (autoliquidation).`],
      ['Peut-on recevoir un échantillon avant une grande série ?', `Oui, dès ${SAMPLE_MIN} pièces : une pièce imprimée vous est envoyée pour validation avant la série, offerte. Comptez ${SAMPLE_EXTRA_DAYS} jours ouvrés de plus.`],
    ] as [string, string][],
    guidesH: 'Nos guides pour bien choisir', moreH: 'À voir aussi',
    more: [['Notre atelier', '/notre-atelier'], ['Réalisations clients', '/realisations'], ['Livraison et délais', '/livraison'], ['Demander un devis', '/devis']] as [string, string][],
    service: 'Personnalisation de vêtements de travail', countries: ['France', 'Belgique'],
  },
  en: {
    title: 'Custom workwear for businesses',
    description: `Polo shirts, t-shirts, sweatshirts, hi-vis vests and aprons with your logo, from 1 piece. Live mock-up and price, shipped in ${PRODUCTION_DAYS} business days.`,
    crumb: 'Custom workwear', kicker: 'Businesses, tradespeople, shops, associations',
    h1: 'Custom workwear with your logo',
    lead: `alwaan prints your workwear with your logo in its workshop in Haubourdin, near Lille: polo shirts, t-shirts, shirts, sweatshirts, jackets, hi-vis, aprons and caps. Order from 1 piece with no setup fee, and see the mock-up and the price live. Produced in ${PRODUCTION_DAYS} business days, delivered to France and Belgium.`,
    perks: ['From 1 piece', 'Live mock-up and price', `-${maxOff}% printing from ${maxQty} pieces`, 'Order today, receive it around {d}'],
    cta: 'Create my outfit in 1 minute', cta2: 'Team link', cta3: 'Request a quote',
    deadline: 'For Christmas: order by {d} to receive it by {t}.',
    catsH: 'Choose your workwear',
    catsSub: 'Every garment is printed with your logo using DTF, on cotton or polyester. "From" prices at the best quantity tier.',
    jobsH: 'Which garment for which trade?',
    jobs: [
      ['utensils', 'Restaurants, cafés and bars', 'Polo shirt or t-shirt for front of house, apron with your logo, cap in the kitchen.', '/metiers/restauration'],
      ['building', 'Hotels and reception', 'Shirt or polo shirt at the front desk, apron for service.', '/metiers/hotellerie'],
      ['helmet', 'Construction, trades and logistics', 'Hi-vis vest, t-shirt, softshell or fleece for winter.', '/metiers/btp-logistique'],
      ['party', 'Events and associations', 'T-shirts and caps for the team, yellow vests for volunteers.', '/metiers/evenementiel-associations'],
      ['trophy', 'Sports clubs', 'Team outfits and a club shop: everyone orders their own.', '/clubs-associations'],
      ['briefcase', 'Shops and offices', 'Polo shirt, shirt or sweatshirt with your logo, for a recognisable team.', '/vetements/polos-personnalises'],
    ],
    priceH: 'How much does custom workwear cost?',
    price1: `The price includes the garment and the print, with no setup fee. Printing gets cheaper automatically: ${tiersTxt('en')}, counting every piece with the same logo, even across different garments (except the large front, which has a fixed price). The garment price stays the same.`,
    price2: `A back logo adds ${e(BACK, 'en')} excl. VAT per piece before discount (${e(PREMIUM_MARK, 'en')} on garments sold above ${e(PREMIUM_PRICE, 'en')} excl. VAT). Caps: logo included, down to ${eur(capPrice(CAP, 100) ?? 0, 'en')} excl. VAT from 100 pieces. Free delivery from ${e(FREE_SHIPPING_HT, 'en')} excl. VAT of items, otherwise ${eur(SHIPPING_HT, 'en')} excl. VAT to your address or ${eur(RELAY_HT, 'en')} to a pickup point.`,
    stepsH: 'Ordering for a whole team',
    steps: [['shirt', 'Choose the garment', 'Model, colour and logo position'], ['upload', 'Add your logo', 'Background removed automatically, live mock-up'], ['users', 'Share the team link', 'Everyone enters their name and size'], ['truck', `Shipped in ${PRODUCTION_DAYS} business days`, `${EXPRESS_DAYS} with express, photo check before shipping`]],
    pay: 'Pay by card, Apple Pay or Google Pay, or by bank transfer for business customers signed in to their account. A PDF quote downloads in one click from the cart. Above 50 pieces or for several models, request a quote: we reply within 24 business hours.',
    whyH: 'What alwaan changes',
    why: [['home', 'Printed in our workshop', 'In Haubourdin, near Lille'], ['eye', 'Mock-up = print proof', 'Printed exactly as approved'], ['one', 'From 1 piece', 'No minimum, no setup fee'], ['tag', `-${maxOff}% from ${maxQty} pieces`, `Printing discount from ${tiers[0][0]} pieces with the same logo`], ['zap', `Express ${EXPRESS_DAYS} business days`, 'Optional, for urgent orders'], ['camera', 'Photo before shipping', 'Every order checked'], ['redo', 'Defect? Reprinted', 'At our cost, reported within 7 days with a photo'], ['bank', 'Bank transfer for businesses', 'From your customer account']],
    faqH: 'Frequently asked questions',
    faq: [
      ['Is there a minimum order for custom workwear?', `No, you can order from 1 piece with no setup fee. Printing gets cheaper automatically: ${tiersTxt('en')} with the same logo, across all garments.`],
      ['How long does it take to receive my team\'s outfits?', `${PRODUCTION_DAYS} business days of production after your order, plus delivery. With express, production takes ${EXPRESS_DAYS} business days (${expressTxt('en')}). The estimated date is shown on the product page and in the cart.`],
      ['Do you embroider logos?', 'No. All our prints are made with DTF: your logo keeps every colour and detail, on cotton or polyester, from 1 piece. We do not offer embroidery or screen printing.'],
      ['How do I collect everyone\'s sizes?', 'With the team link: share it, everyone enters their first name, last name and size, and your cart fills itself. You then confirm a single order.'],
      ['Can I pay by bank transfer and get a quote?', 'Yes. Business customers signed in to their account can pay by bank transfer: production starts when the funds arrive. A PDF quote downloads in one click from the cart. For more than 50 pieces or several models, the quote form gets you an answer within 24 business hours.'],
      ['Do you deliver to Belgium?', `Yes, to mainland France and Belgium, on the same terms: free delivery from ${e(FREE_SHIPPING_HT, 'en')} excl. VAT of items, otherwise ${eur(SHIPPING_HT, 'en')} excl. VAT (Colissimo) or ${eur(RELAY_HT, 'en')} to a Mondial Relay pickup point. A business customer established in Belgium who provides a valid EU VAT number before ordering is invoiced without VAT (reverse charge).`],
      ['Can I get a sample before a large run?', `Yes, from ${SAMPLE_MIN} pieces: one printed piece is sent to you for approval before the run, free of charge. Allow ${SAMPLE_EXTRA_DAYS} extra business days.`],
    ] as [string, string][],
    guidesH: 'Our buying guides', moreH: 'See also',
    more: [['Our workshop', '/notre-atelier'], ['Our work', '/realisations'], ['Delivery and lead times (FR)', '/livraison'], ['Request a quote', '/devis']] as [string, string][],
    service: 'Custom workwear printing', countries: ['France', 'Belgium'],
  },
};

const GUIDES_HERE = ['prix-vetement-personnalise-quantite', 'taille-vetement-equipe', 'dtf-ou-broderie', 'preparer-logo-impression', 'grammage-polo-travail', 'norme-en-iso-20471-haute-visibilite'];

export function workwearMeta(lang: Lang): Metadata {
  const t = T[lang];
  return { title: t.title, description: t.description, alternates: alternates(lang, WORKWEAR_PATH), openGraph: { title: t.title, description: t.description } };
}

export function WorkwearView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const loc = lang === 'en' ? 'en-GB' : 'fr-FR';
  const season = currentSeason(), until = orderBy(season);
  const target = season.deadline && new Date(new Date().getFullYear(), season.deadline[0] - 1, season.deadline[1]);
  const perks = t.perks.map((p, i): [string, string] => [['one', 'eye', 'tag', 'truck'][i], p.replace('{d}', fmtDay(deliveryDate(), lang))]);
  const guides = GUIDES_HERE.flatMap((s) => { const g = getGuide(s); return g ? [[g.title, `/guides/${g.slug}`] as [string, string]] : []; });
  const url = SITE_URL + href(lang, WORKWEAR_PATH);
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t.crumb]]} />
      <section className="wrap workwear">
        <span className="season-kicker"><I name="briefcase" size={16} /> {t.kicker}</span>
        <h1>{t.h1}</h1>
        <p className="lead">{t.lead}</p>
        <Perks items={perks} />
        {until && target && <p className="season-deadline"><I name="clock" size={16} /> {t.deadline.replace('{d}', until.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' })).replace('{t}', target.toLocaleDateString(loc, { day: 'numeric', month: 'long' }))}</p>}
        <div className="ctas"><Link className="btn cta" href={href(lang, '/assistant')}>{t.cta}</Link><Link className="btn line" href={href(lang, '/lien-equipe')}><I name="users" size={18} /> {t.cta2}</Link><Link className="btn line" href={href(lang, '/devis')}>{t.cta3}</Link></div>

        <h2 className="mt">{t.catsH}</h2>
        <p className="muted">{t.catsSub}</p>
        <div className="cats workwear-cats">
          {CATEGORIES.map((c0) => {
            const c = categoryL(lang, c0), list = productsIn(c.slug), first = list[0];
            if (!first) return null;
            return (
              <Link className="catcard" key={c.slug} href={href(lang, `/vetements/${c.slug}`)}>
                <Garment slug={first.slug} color={defaultColor(first)} />
                <strong>{c.name}</strong>
                <small>{tr(lang, '{n} modèles', { n: list.length })} · {tr(lang, 'dès')} <Price ht={Math.min(...list.map(fromPrice))} /></small>
              </Link>
            );
          })}
        </div>

        <h2 className="mt">{t.jobsH}</h2>
        <div className="advantages">{t.jobs.map(([ic, b, s, to]) => (
          <Link key={b} className="adv" href={href(lang, to)}><span className="adv-ic"><I name={ic} size={22} /></span><b>{b}</b><small>{s}</small></Link>
        ))}</div>

        <div className="seo1">
          <h2 className="mt">{t.priceH}</h2>
          <p>{t.price1}</p>
          <PriceExamples rows={rows(lang)} lang={lang} />
          <p className="muted small">{t.price2}</p>
          {lang === 'fr' && <LinkChips links={[['Prix d\'un vêtement personnalisé : ce qui le fait varier', '/guides/prix-vetement-personnalise-quantite']]} />}
        </div>

        <h2 className="mt">{t.stepsH}</h2>
        <ol className="steps-ic">{t.steps.map(([ic, b, s]) => <li key={b}><I name={ic} size={30} className="ico" /><b>{b}</b><small>{s}</small></li>)}</ol>
        <p className="mt8">{t.pay}</p>

        <h2 className="mt">{t.whyH}</h2>
        <div className="advantages">{t.why.map(([ic, b, s]) => <div key={b} className="adv"><span className="adv-ic"><I name={ic} size={22} /></span><b>{b}</b><small>{s}</small></div>)}</div>

        <div className="seo1">
          <h2 className="mt">{t.faqH}</h2>
          <Faq items={t.faq} />
          {lang === 'fr' && <LinkChips title={t.guidesH} links={guides} />}
          <LinkChips title={t.moreH} links={t.more.map(([l, to]): [string, string] => [l, href(lang, to)])} />
        </div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Service', name: t.h1, serviceType: t.service, description: t.lead, url, inLanguage: lang,
        provider: { '@type': 'LocalBusiness', name: 'alwaan', url: SITE_URL, address: { '@type': 'PostalAddress', streetAddress: '121 rue Léon Gambetta', postalCode: '59320', addressLocality: 'Haubourdin', addressCountry: 'FR' } },
        areaServed: t.countries.map((name) => ({ '@type': 'Country', name })),
        hasOfferCatalog: { '@type': 'OfferCatalog', name: t.catsH, itemListElement: CATEGORIES.map((c) => ({ '@type': 'OfferCatalog', name: categoryL(lang, c).name, url: SITE_URL + href(lang, `/vetements/${c.slug}`) })) },
      }} />
    </>
  );
}
