import Link from 'next/link';
import { PRODUCTS, SHOP_COMMISSION, TIERS } from '@/lib/catalog';
import { fromPrice } from '@/lib/catalog';
import { Breadcrumbs, Faq, ProductCard } from '@/components/ui';
import { I } from '@/components/Icons';
import { href, type Lang } from '@/i18n';

const shopLink = (lang: Lang) => (lang === 'en' ? '/en/account/shop' : '/compte/boutique');
const pct = Math.round(SHOP_COMMISSION * 100), maxOff = Math.round(TIERS[TIERS.length - 1][1] * 100), maxQty = TIERS[TIERS.length - 1][0];
const T = {
  fr: {
    crumb: 'Clubs et associations', kicker: 'Foot, rugby, basket, hand, running, associations',
    h1: 'Les tenues de votre club, sans avancer d\'argent',
    lead: 'T-shirts, polos, casquettes et tabliers de buvette à vos couleurs. Ouvrez la boutique du club : chaque adhérent ou parent commande et paie sa tenue, et le club touche une commission.',
    ways: [
      ['bag', 'Boutique du club', `Une page à vos couleurs. Chacun commande et paie sa tenue. Le club reçoit ${pct} % des ventes en bons d'achat.`, 'Ouvrir la boutique du club', '/compte/boutique'],
      ['users', 'Lien d\'équipe', 'Le club paie, chaque joueur donne son nom, son prénom et sa taille. Zéro erreur de taille.', 'Créer un lien d\'équipe', '/lien-equipe'],
      ['trophy', 'Nom + numéro', 'Le look maillot sur un t-shirt technique ou coton : nom au dos, numéro, logo du club.', 'Créer le maillot', '/idees-cadeaux/creer/maillot'],
    ],
    usesH: 'Pour qui ?',
    uses: [['trophy', 'Clubs sportifs', 'Échauffement, déplacements, supporters, éducateurs'], ['users', 'Associations', 'Bénévoles, événements, festivals, collectes'], ['bell', 'Écoles et APE', 'Kermesse, sorties, fin d\'année, vente pour la coopérative'], ['party', 'Tournois et courses', 'T-shirts d\'organisation et de participants']],
    whyH: 'Pourquoi les clubs choisissent alwaan',
    why: [['one', 'Dès 1 pièce', 'Un nouvel adhérent en cours de saison ? Une seule pièce, même prix de marquage que votre série.'], ['tag', `-${maxOff} % dès ${maxQty} pièces`, 'Le marquage baisse automatiquement avec la quantité, toutes commandes au même logo confondues.'], ['eye', 'Maquette en direct', 'Le bureau valide le visuel avant l\'impression. Ce que vous voyez est ce que vous recevez.'], ['home', 'Imprimé dans le Nord', 'Atelier à Haubourdin, près de Lille : délais courts, équipe joignable.']],
    prodH: 'Les plus choisis par les clubs',
    faq: [
      ['Comment fonctionne la boutique du club ?', `Vous créez la page du club (logo, vêtements, couleurs) depuis votre espace client. Vous partagez le lien aux adhérents et aux parents : chacun commande et paie sa tenue, livrée chez lui. Le club reçoit ${pct} % du montant HT des ventes en bons d'achat, dès 20 € cumulés.`],
      ['Le club doit-il avancer de l\'argent ?', 'Non, avec la boutique : chacun paie sa commande. Avec le lien d\'équipe, le club paie la commande groupée, comme d\'habitude.'],
      ['Peut-on imprimer le nom et le numéro de chaque joueur ?', 'Oui : le design « Maillot nom + numéro » permet d\'imprimer le nom au dos et un numéro. Le prénom de chaque personne est aussi possible au-delà de 20 pièces avec le lien d\'équipe.'],
      ['Faites-vous des maillots de match techniques ?', 'Nous imprimons sur nos t-shirts, polos et casquettes (dont un t-shirt technique). Pour des maillots de match sublimés complets, écrivez-nous : nous vous dirons honnêtement si nous pouvons vous aider.'],
      ['Et pour une association sans logo ?', 'Pas de souci : écrivez simplement le nom de l\'association, il est imprimé proprement. Notre graphiste peut aussi retravailler un logo existant.'],
    ] as [string, string][],
    cta: 'Ouvrir la boutique du club', cta2: 'Créer la tenue en 1 minute',
  },
  en: {
    crumb: 'Clubs and associations', kicker: 'Football, rugby, basketball, running, associations',
    h1: 'Your club\'s outfits, with no upfront cost',
    lead: 'T-shirts, polos, caps and bar aprons in your colours. Open the club shop: each member or parent orders and pays for their outfit, and the club earns a commission.',
    ways: [
      ['bag', 'Club shop', `A page in your colours. Everyone orders and pays for their own outfit. The club earns ${pct}% of sales in vouchers.`, 'Open the club shop', '/compte/boutique'],
      ['users', 'Team link', 'The club pays, each player gives their name and size. Zero size mistakes.', 'Create a team link', '/lien-equipe'],
      ['trophy', 'Name + number', 'The jersey look on a technical or cotton t-shirt: name on the back, number, club logo.', 'Create the jersey', '/idees-cadeaux/creer/maillot'],
    ],
    usesH: 'Who is it for?',
    uses: [['trophy', 'Sports clubs', 'Warm-up, away games, supporters, coaches'], ['users', 'Associations', 'Volunteers, events, festivals, fundraising'], ['bell', 'Schools and PTAs', 'Fairs, trips, end of year, fundraising'], ['party', 'Tournaments and races', 'Staff and participant t-shirts']],
    whyH: 'Why clubs choose alwaan',
    why: [['one', 'From 1 piece', 'A new member mid-season? One piece, same printing price as your batch.'], ['tag', `-${maxOff}% from ${maxQty} pieces`, 'Printing gets cheaper automatically with quantity, across all orders with the same logo.'], ['eye', 'Live mock-up', 'The committee approves the design before printing.'], ['home', 'Printed in northern France', 'Workshop near Lille: short lead times, a team you can reach.']],
    prodH: 'Clubs\' favourites',
    faq: [
      ['How does the club shop work?', `Create the club page (logo, garments, colours) from your account. Share the link with members and parents: everyone orders and pays, delivered to their home. The club earns ${pct}% of net sales in vouchers, from €20 accumulated.`],
      ['Does the club pay upfront?', 'Not with the shop: everyone pays for their own order. With the team link, the club pays for the group order as usual.'],
      ['Can you print each player\'s name and number?', 'Yes: the "Name + number jersey" design prints a name on the back and a number. First names are also possible above 20 pieces with the team link.'],
      ['Do you make technical match jerseys?', 'We print on our t-shirts, polos and caps (including a technical t-shirt). For fully sublimated match kits, contact us and we\'ll tell you honestly if we can help.'],
      ['What about an association without a logo?', 'No problem: just type the association\'s name and it is printed cleanly. Our designer can also rework an existing logo.'],
    ] as [string, string][],
    cta: 'Open the club shop', cta2: 'Create the outfit in 1 minute',
  },
};

export function ClubsView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const picks = ['t-shirt-atomic-150', 't-shirt-dogo', 'polo-pegaso', 'casquette-mercury'].flatMap((s) => PRODUCTS.filter((p) => p.slug === s));
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t.crumb]]} />
      <section className="wrap clubs">
        <span className="season-kicker"><I name="trophy" size={16} /> {t.kicker}</span>
        <h1>{t.h1}</h1>
        <p className="lead">{t.lead}</p>
        <div className="ctas"><Link className="btn cta" href={shopLink(lang)}>{t.cta}</Link><Link className="btn line" href={href(lang, '/assistant')}>{t.cta2}</Link></div>
        <div className="club-ways">{t.ways.map(([ic, b, s, c, to]) => (
          <article key={b} className="club-way"><span className="cat-cta-ic"><I name={ic} size={26} /></span><b>{b}</b><p className="muted small">{s}</p><Link className="link" href={to === '/compte/boutique' ? shopLink(lang) : href(lang, to)}>{c} <I name="arrow" size={14} /></Link></article>
        ))}</div>
        <h2 className="mt">{t.usesH}</h2>
        <div className="advantages">{t.uses.map(([ic, b, s]) => <div key={b} className="adv"><span className="adv-ic"><I name={ic} size={22} /></span><b>{b}</b><small>{s}</small></div>)}</div>
        <h2 className="mt">{t.prodH}</h2>
        <div className="grid g4">{picks.map((p) => <ProductCard key={p.slug} p={p} lang={lang} />)}</div>
        <p className="muted small">{lang === 'en' ? 'From' : 'Dès'} {fromPrice(picks[0]).toFixed(2).replace('.', lang === 'en' ? '.' : ',')} € HT {lang === 'en' ? 'per printed t-shirt, from 30 pieces' : 'le t-shirt imprimé, dès 30 pièces'}.</p>
        <h2 className="mt">{t.whyH}</h2>
        <div className="advantages">{t.why.map(([ic, b, s]) => <div key={b} className="adv"><span className="adv-ic"><I name={ic} size={22} /></span><b>{b}</b><small>{s}</small></div>)}</div>
        <h2 className="mt">FAQ</h2>
        <Faq items={t.faq} />
      </section>
    </>
  );
}
