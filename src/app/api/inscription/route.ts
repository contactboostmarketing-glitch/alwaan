import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { RELANCE_RATE } from '@/lib/catalog';
import { getJSON, putJSON } from '@/lib/blobStore';
import { blocked, hit, tooMany } from '@/lib/rateLimit';
import { safeEqual } from '@/lib/secure';
import { atelierEmail, layout, mailEnabled, sendMail } from '@/lib/mail';
import type { RelanceCode } from '@/lib/relance';
import { adminEnabled, upsertProspect } from '@/lib/shopifyAdmin';
import { SITE_URL } from '@/lib/site';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
// Adresses jetables : refusées (le code -10 % ne doit pas s'obtenir à volonté).
const DISPOSABLE = /@(yopmail|mailinator|guerrillamail|10minutemail|tempmail|temp-mail|trashmail|jetable|getnada|maildrop|sharklasers|dispostable|throwawaymail|mailnesia|fakeinbox|moakt|emailondeck|mohmal|tempail|minuteinbox)\./i;

/** L'offre n'est proposée que si l'envoi d'emails est configuré (le code n'est jamais affiché à l'écran). */
export async function GET(req: Request) {
  // Diagnostic atelier (clé de synchro) : ?test envoie un email à l'atelier et renvoie la réponse exacte de Resend.
  const sync = process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY;
  if (new URL(req.url).searchParams.has('test') && sync && safeEqual(req.headers.get('x-sync-key'), sync)) {
    const to = new URL(req.url).searchParams.get('to') || atelierEmail();
    if (!EMAIL.test(to)) return NextResponse.json({ error: 'Adresse invalide' }, { status: 400 });
    const r = await sendMail({ to, subject: 'Test d\'envoi alwaan', html: layout({ title: 'Test d\'envoi', intro: 'Les emails du site fonctionnent.' }) }).catch((e) => String((e as Error).message));
    return NextResponse.json({ enabled: mailEnabled(), from: process.env.MAIL_FROM ? 'MAIL_FROM' : 'défaut (COMPANY_EMAIL)', result: r });
  }
  return NextResponse.json({ enabled: mailEnabled() });
}
const DAY = 864e5;

/**
 * Inscription aux offres (consentement explicite) : -10 % sur la 1re commande avec un code BIENV-XXXXXX
 * personnel, à usage unique, valable 30 jours. Une seule fois par adresse email.
 * Le code part uniquement par email (adresse réelle obligatoire), jamais affiché à l'écran ; adresses jetables refusées.
 */
export async function POST(req: Request) {
  // Anti-abus : 5 inscriptions réussies par jour et par connexion (les échecs ne comptent pas).
  if (await blocked(req, 'inscription-ok', 5, 86400)) return tooMany('Trop d\'inscriptions depuis cette connexion aujourd\'hui. Réessayez demain.');
  if (!mailEnabled()) return NextResponse.json({ error: 'Offre momentanément indisponible.' }, { status: 503 });
  const b = await req.json().catch(() => null);
  const email = String(b?.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  if (DISPOSABLE.test(email)) return NextResponse.json({ error: 'Utilisez une adresse email permanente.' }, { status: 400 });
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
  const sent = await sendMail({
    to: email, subject: `Votre code -10 % : ${code}`,
    html: layout({ title: 'Bienvenue chez alwaan', intro: `Voici votre code personnel <b>${code}</b> : -10 % sur votre première commande, à saisir dans le panier. Valable 30 jours, une seule fois. Votre logo, votre tenue en direct, dès 1 pièce.`, cta: ['Créer ma tenue en 1 minute', `${SITE_URL}/assistant`] }),
  }).catch((e) => { console.error('[inscription]', e); return 'erreur'; });
  if (sent !== 'envoyé') return NextResponse.json({ error: 'Envoi impossible. Vérifiez votre adresse email.' }, { status: 502 });
  await hit(req, 'inscription-ok', 5, 86400);
  // Le code n'est jamais renvoyé au navigateur : il faut une vraie boîte mail pour le recevoir.
  return NextResponse.json({ ok: true, byEmail: true });
}
