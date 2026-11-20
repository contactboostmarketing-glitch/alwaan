import Link from 'next/link';
import { Breadcrumbs, Faq, JsonLd } from '@/components/ui';
import { href, type Lang } from '@/i18n';

const T = {
  fr: {
    crumb: 'Lien d\'équipe', h1: 'Fini les tableaux de tailles : chacun donne la sienne',
    lead: 'Vous partagez un lien. Chaque personne entre son nom, son prénom et sa taille. Votre panier se remplit tout seul.',
    steps: [['🎨', 'Vous créez la tenue', 'Logo, vêtements, couleur : la maquette est validée.'], ['🔗', 'Vous partagez le lien', 'Par WhatsApp, email ou affichage en salle de pause.'], ['👕', 'Chacun donne sa taille', '30 secondes par personne, sans compte.'], ['🛒', 'Vous commandez', 'Les quantités par taille sont calculées pour vous.']],
    perks: ['Zéro erreur de taille', 'Prénom imprimé possible au-delà de 20 pièces', 'Liste nominative pour la remise des tenues', 'Plusieurs vêtements dans la même liste'],
    cta: 'Créer ma tenue et mon lien', faq: [['Les personnes doivent-elles créer un compte ?', 'Non. Elles ouvrent le lien, entrent leur nom, leur prénom et leur taille, c\'est tout.'], ['Puis-je voir qui a répondu ?', 'Oui : votre page de suivi liste chaque personne et compte les tailles en direct.'], ['Peut-on imprimer le prénom de chacun ?', 'Oui, au-delà de 20 pièces : le prénom de chaque personne est imprimé sous le logo.']] as [string, string][],
  },
  en: {
    crumb: 'Team link', h1: 'No more size spreadsheets: everyone gives their own',
    lead: 'Share one link. Each person enters their name and size. Your cart fills itself.',
    steps: [['🎨', 'Create the outfit', 'Logo, garments, colour: the mock-up is approved.'], ['🔗', 'Share the link', 'By WhatsApp, email or on the staff-room board.'], ['👕', 'Everyone gives their size', '30 seconds per person, no account.'], ['🛒', 'You order', 'Quantities per size are worked out for you.']],
    perks: ['Zero size mistakes', 'First names printed above 20 pieces', 'Named list to hand out the outfits', 'Several garments in one list'],
    cta: 'Create my outfit and link', faq: [['Do people need an account?', 'No. They open the link, enter their name and size, that\'s it.'], ['Can I see who has answered?', 'Yes: your tracking page lists each person and counts sizes live.'], ['Can each person\'s name be printed?', 'Yes, above 20 pieces: each person\'s first name is printed under the logo.']] as [string, string][],
  },
};

export function TeamLinkView({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <Breadcrumbs lang={lang} items={[[t.crumb]]} />
      <section className="wrap page-narrow teamlp">
        <span className="season-kicker">👥 {t.crumb}</span>
        <h1>{t.h1}</h1>
        <p className="lead">{t.lead}</p>
        <ol className="steps-ic">{t.steps.map(([e, b, s]) => <li key={b}><span className="big-emoji">{e}</span><b>{b}</b><small>{s}</small></li>)}</ol>
        <ul className="perks acct-perks">{t.perks.map((p) => <li key={p}>✓ {p}</li>)}</ul>
        <Link className="btn cta block" href={href(lang, '/assistant')}>{t.cta}</Link>
        <h2 className="mt">FAQ</h2>
        <Faq items={t.faq} />
      </section>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'HowTo', name: t.h1, step: t.steps.map(([, b, s], i) => ({ '@type': 'HowToStep', position: i + 1, name: b, text: s })) }} />
    </>
  );
}
