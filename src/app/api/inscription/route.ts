import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { RELANCE_RATE } from '@/lib/catalog';
import { getJSON, putJSON } from '@/lib/blobStore';
import { limited, tooMany } from '@/lib/rateLimit';
import { layout, mailEnabled, sendMail } from '@/lib/mail';
import type { RelanceCode } from '@/lib/relance';
import { adminEnabled, upsertProspect } from '@/lib/shopifyAdmin';
import { SITE_URL } from '@/lib/site';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
const DAY = 864e5;

/**
 * Inscription aux offres (consentement explicite) : -10 % sur la 1re commande avec un code BIENV-XXXXXX
 * personnel, à usage unique, valable 30 jours. Une seule fois par adresse email.
 * Si l'envoi d'emails est configuré, le code part uniquement par email (adresse réelle obligatoire).
 */
export async function POST(req: Request) {
  if (await limited(req, 'inscription', 5, 3600)) return tooMany();
  const b = await req.json().catch(() => null);
  const email = String(b?.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  const key = createHash('sha256').update(email).digest('hex').slice(0, 32);
  const prev = await getJSON<{ code: string }>('bienvenue', key);
  let code = prev?.code;
  if (!code) {
    code = `BIENV-${randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`;
    const c: RelanceCode = { code, rate: RELANCE_RATE, email, expiresAt: new Date(Date.now() + 30 * DAY).toISOString() };
    await putJSON('codes', code, c);
    await putJSON('bienvenue', key, { code, at: new Date().toISOString() });
    // Client marketing dans Shopify : les campagnes (Shopify Email) ne visent que les inscrits.
    if (adminEnabled()) await upsertProspect({ email, marketing: true, tags: ['inscrit-site', 'bienvenue-10'], note: `Inscrit aux offres depuis le site le ${new Date().toLocaleDateString('fr-FR')} (code ${code}).` }).catch((e) => console.error('[inscription]', e));
  }
  await sendMail({
    to: email, subject: `Votre code -10 % : ${code}`,
    html: layout({ title: 'Bienvenue chez alwaan', intro: `Voici votre code personnel <b>${code}</b> : -10 % sur votre première commande, à saisir dans le panier. Valable 30 jours, une seule fois. Votre logo, votre tenue en direct, dès 1 pièce.`, cta: ['Créer ma tenue en 1 minute', `${SITE_URL}/assistant`] }),
  }).catch(() => {});
  return NextResponse.json(mailEnabled() ? { ok: true, byEmail: true } : { ok: true, code });
}
