// Emails après achat (envoyés par le passage horaire) :
//  - bienvenue, ~1 h après le paiement : ce qui se passe maintenant, remise des tenues, parrainage ;
//  - renouvellement, 9 mois après : tenues usées, nouveaux arrivants → « Recommander » en 1 clic.
//    Pas envoyé si le client a recommandé depuis. Lien de désinscription dans l'email.
import { getJSON, listKeys, putJSON } from './blobStore';
import { layout, sendMail } from './mail';
import type { Order } from './reviews';
import { sign } from './secure';
import { SITE_URL } from './site';
import { REFERRAL_MIN, REFERRAL_REWARD, ensureReferralCode } from './vouchers';

const DAY = 864e5, RENEW_DAYS = 270;
export const stopLink = (key: string) => `${SITE_URL}/api/relance?stopc=${key}&sig=${sign('cmd', key)}`;

export async function runPostPurchase(): Promise<string[]> {
  const out: string[] = [];
  const orders: Order[] = [];
  for (const k of await listKeys('commandes')) { const o = await getJSON<Order>('commandes', k); if (o?.email) orders.push(o); }
  const latest = new Map<string, number>();
  for (const o of orders) latest.set(o.email!, Math.max(latest.get(o.email!) || 0, Date.parse(o.createdAt)));
  for (const o of orders) {
    const age = Date.now() - Date.parse(o.createdAt);
    let changed = false;
    if (!o.bienvenue && age > 3600e3 && age < 3 * DAY) {
      const code = await ensureReferralCode(o.email!).catch(() => '');
      const r = await sendMail({
        to: o.email!, subject: `Commande ${o.name} : ce qui se passe maintenant`,
        html: layout({
          title: 'Merci, votre commande est lancée', intro: 'Voici les prochaines étapes. Vous n\'avez rien à faire de plus.',
          rows: [
            'Votre maquette validée part en production à l\'atelier (Haubourdin, Nord).',
            'Avant l\'envoi, nous prenons une photo de contrôle : vous la retrouvez dans votre espace client.',
            'Vous recevez le lien de suivi dès l\'expédition.',
            'Lien d\'équipe utilisé ? La liste nominative (nom, prénom, taille) vous aide à distribuer les tenues.',
            code ? `Parrainez un confrère : avec le code <b>${code}</b>, il a ${REFERRAL_REWARD} € dès ${REFERRAL_MIN} € HT, et vous recevez ${REFERRAL_REWARD} € après sa commande.` : '',
          ].filter(Boolean),
          cta: ['Mon espace client', `${SITE_URL}/compte`],
        }),
      }).catch((e) => `erreur ${(e as Error).message}`);
      o.bienvenue = new Date().toISOString(); changed = true; out.push(`bienvenue ${o.name} ${r}`);
    }
    if (!o.renouvellement && !o.desinscrit && age > RENEW_DAYS * DAY && age < (RENEW_DAYS + 30) * DAY && (latest.get(o.email!) || 0) <= Date.parse(o.createdAt)) {
      const r = await sendMail({
        to: o.email!, subject: 'Vos tenues ont 9 mois : on les renouvelle ?',
        html: layout({
          title: 'Le moment de renouveler vos tenues ?', intro: `Vos tenues de la commande ${o.name} ont 9 mois. Pièces usées, nouveaux arrivants, nouvelle saison : retrouvez la même commande, même logo et même maquette, et ajustez juste les quantités.`,
          cta: ['Recommander en 1 clic', o.recommander || `${SITE_URL}/compte?s=commandes`],
          foot: `Vous recevez cet email car vous avez commandé chez alwaan. <a href="${stopLink(o.id)}" style="color:#5b6478">Ne plus recevoir ces rappels</a>.`,
        }),
      }).catch((e) => `erreur ${(e as Error).message}`);
      o.renouvellement = new Date().toISOString(); changed = true; out.push(`renouvellement ${o.name} ${r}`);
    }
    if (changed) await putJSON('commandes', o.id, o);
  }
  return out;
}

/** Désinscription des rappels (toutes les commandes de ce client). */
export async function unsubscribeOrders(key: string) {
  const o = await getJSON<Order>('commandes', key);
  if (!o?.email) return;
  for (const k of await listKeys('commandes')) {
    const x = await getJSON<Order>('commandes', k);
    if (x && x.email === o.email && !x.desinscrit) { x.desinscrit = true; await putJSON('commandes', k, x); }
  }
}
