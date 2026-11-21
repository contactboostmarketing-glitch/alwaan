import { NextResponse } from 'next/server';
import { limited, tooMany } from '@/lib/rateLimit';
import { layout, sendMail } from '@/lib/mail';
import { adminEnabled, upsertProspect } from '@/lib/shopifyAdmin';
import { SITE_URL } from '@/lib/site';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

/** Inscription aux offres (consentement explicite) : -10 % sur la 1re commande avec le code BIENVENUE. */
export async function POST(req: Request) {
  if (await limited(req, 'inscription', 5, 3600)) return tooMany();
  const b = await req.json().catch(() => null);
  const email = String(b?.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  // Client marketing dans Shopify : les campagnes (Shopify Email) ne visent que les inscrits.
  if (adminEnabled()) await upsertProspect({ email, marketing: true, tags: ['inscrit-site', 'bienvenue-10'], note: `Inscrit aux offres depuis le site le ${new Date().toLocaleDateString('fr-FR')}.` }).catch((e) => console.error('[inscription]', e));
  await sendMail({
    to: email, subject: 'Votre code -10 % : BIENVENUE',
    html: layout({ title: 'Bienvenue chez alwaan', intro: 'Voici votre code <b>BIENVENUE</b> : -10 % sur votre première commande, à saisir dans le panier. Votre logo, votre tenue en direct, dès 1 pièce.', cta: ['Créer ma tenue en 1 minute', `${SITE_URL}/assistant`] }),
  }).catch(() => {});
  return NextResponse.json({ ok: true, code: 'BIENVENUE' });
}
