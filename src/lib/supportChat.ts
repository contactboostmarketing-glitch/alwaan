// Conseiller IA du site : répond aux questions des clients à partir des informations réelles d'alwaan
// (catalogue, prix, délais, conditions). S'il ne peut pas résoudre, il passe la main à l'équipe sur WhatsApp.
import Anthropic from '@anthropic-ai/sdk';
import { EXPRESS_FEES, FREE_SHIPPING_HT, RELAY_HT, PREMIUM_MARK, PREMIUM_PRICE, PRODUCTS, RESELLER_RATE, REWORK_FEE, SAMPLE_MIN, SHIPPING_HT, TIERS, ZONES, NAME_FEE, NAMES_MIN } from './catalog';
import { COMPANY } from './site';
import { ON_ORDER_DAYS } from './stockTypes';
import { BLANK_DAYS, EXPRESS_DAYS, PRODUCTION_DAYS } from './delivery';
import { REFERRAL_MIN, REFERRAL_REWARD } from './vouchers';

export const HANDOFF = '[HUMAIN]';
let client: Anthropic | null = null;

const facts = () => [
  `Entreprise : alwaan (${COMPANY.name}), atelier à Haubourdin (Nord). Impression DTF uniquement (pas de broderie). Clients : professionnels et particuliers, livraison France et Belgique.`,
  `Catalogue (prix du vêtement seul, HT) : ${PRODUCTS.map((p) => `${p.name} (${p.type}, tailles ${p.sizes}) ${p.price.toFixed(2)} €`).join(' ; ')}.`,
  `Marquage par pièce (HT) : ${ZONES.filter((z) => z.id !== 'pocket').map((z) => `${z.name} ${z.size} ${z.price} €`).join(', ')} ; poche (tabliers uniquement) 4 €. Cœur et dos à ${PREMIUM_MARK} € si le vêtement coûte plus de ${PREMIUM_PRICE} € HT. Le grand devant est à prix fixe, sans remise. Les tabliers : poche ou grand devant seulement. Chemises : pas de grand devant.`,
  `Remises sur le marquage selon le nombre de pièces au même logo : ${TIERS.filter(([, d]) => d).map(([m, d]) => `-${d * 100} % dès ${m}`).join(', ')}. Dès 1 pièce.`,
  `Livraison ${SHIPPING_HT} € HT à domicile ou ${RELAY_HT} € HT en point relais Mondial Relay (point choisi après le paiement), offerte dès ${FREE_SHIPPING_HT} € HT. Délai indicatif : production ${PRODUCTION_DAYS} jours ouvrés après validation de la maquette, plus 1 à 3 jours de transport. Express ${EXPRESS_DAYS} jours ouvrés : ${EXPRESS_FEES.map(([n, f]) => (Number.isFinite(n) ? `${f} € jusqu'à ${n} pièces` : `${f} € au-delà`)).join(', ')}. Couleurs ou tailles « sur commande » : +${ON_ORDER_DAYS} jours ouvrés (affiché sur la fiche produit). Textile vierge (sans marquage) : expédié sous ${BLANK_DAYS} jours ouvrés s'il est en stock.`,
  `Maquette (BAT) : le client voit son logo sur le vêtement en direct et la valide avant de payer ; l'impression est identique. Fond du logo retiré automatiquement si le client le souhaite. Logo pas net : notre graphiste le retravaille pour ${REWORK_FEE} € HT et renvoie la maquette.`,
  `Lien d'équipe : le client partage un lien, chaque personne donne son nom, prénom et taille, le panier se remplit seul. Prénom imprimé possible au-delà de ${NAMES_MIN} pièces (+${NAME_FEE} € HT par pièce).`,
  `Échantillon offert avant la série dès ${SAMPLE_MIN} pièces. Revendeurs et agences : -${RESELLER_RATE * 100} % sur tout après vérification du Kbis (espace client). Parrainage : le filleul a ${REFERRAL_REWARD} € dès ${REFERRAL_MIN} € HT de commande, le parrain reçoit un bon de ${REFERRAL_REWARD} € après la 1re commande du filleul. Boutique club ou entreprise disponible.`,
  `Paiement : CB, Apple Pay, Google Pay ; virement pour les pros connectés à leur compte. Devis PDF téléchargeable depuis le panier.`,
  `Retours : articles personnalisés, pas de droit de rétractation ; défaut d'impression ou erreur de notre part : pièce refaite, à signaler sous 7 jours avec photo. Textile vierge : rétractation 14 jours pour les particuliers.`,
  `Fichiers logo acceptés : PNG, JPG, SVG, PDF, AI, EPS ; le plus grand possible.`,
].join('\n');

const SYSTEM = () => `Tu es le conseiller du site alwaan.fr (vêtements de travail et textiles personnalisés). Tu parles au client directement, dans sa langue (français par défaut).
Réponds court : 1 à 4 phrases, simples, sans jargon, sans mise en forme markdown (pas de titres, pas de listes à puces, pas de gras). Donne des chiffres concrets quand c'est utile (prix HT, délais).
Utilise uniquement les informations ci-dessous. Si tu ne sais pas, dis-le et propose l'équipe. N'invente jamais un prix, un délai, une disponibilité ou un état de commande.
Oriente vers l'action : « Créer ma tenue en 1 minute » (alwaan.fr/assistant), la fiche produit, le lien d'équipe, le devis PDF du panier.
Passe la main à l'équipe humaine quand : le client le demande, la question porte sur une commande précise (suivi, retard, problème, réclamation, facture), une demande sur mesure hors catalogue, un très gros volume à négocier, ou si tu n'as pas pu résoudre après deux échanges. Dans ce cas, termine ta réponse par une phrase qui l'invite à écrire à l'équipe sur WhatsApp, puis ajoute exactement ${HANDOFF} à la toute fin.

Informations alwaan :
${facts()}`;

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function answer(turns: ChatTurn[]): Promise<{ text: string; handoff: boolean }> {
  if (!process.env.ANTHROPIC_API_KEY) return { text: 'Notre conseiller en ligne n\'est pas disponible pour le moment. Écrivez à l\'équipe sur WhatsApp, on vous répond vite.', handoff: true };
  client ??= new Anthropic();
  const r = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 1500,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: [{ type: 'text', text: SYSTEM(), cache_control: { type: 'ephemeral' } }],
    messages: turns,
  });
  if (r.stop_reason === 'refusal') return { text: 'Je préfère laisser l\'équipe vous répondre sur ce point.', handoff: true };
  const text = r.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('').trim();
  const handoff = text.includes(HANDOFF);
  return { text: text.replace(HANDOFF, '').trim() || 'Pouvez-vous reformuler votre question ?', handoff };
}
