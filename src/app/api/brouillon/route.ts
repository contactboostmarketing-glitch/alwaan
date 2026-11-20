import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { putJSON } from '@/lib/blobStore';
import { LOGO_ID } from '@/lib/logoStore';
import { adminEnabled, upsertProspect } from '@/lib/shopifyAdmin';
import { publicOrigin } from '@/lib/site';

export type Draft = {
  email: string; marketing: boolean; createdAt: string;
  place: string | null; color: string | null; people: number | null;
  products: string[]; qty: Record<string, Record<string, number>>; packs: string[];
  logoId?: string; logoName?: string; logoStatus: 'uploaded' | 'text'; text?: string;
};

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

/** Sauvegarde la demande de l'assistant avec l'email du client (reprise + relances). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = String(b?.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  const products = (Array.isArray(b?.products) ? b.products : []).filter((s: string) => getProduct(s)).slice(0, 8);
  const draft: Draft = {
    email, marketing: b?.marketing === true, createdAt: new Date().toISOString(),
    place: ['heart', 'chest', 'back', 'heart-back'].includes(b?.place) ? b.place : null,
    color: /^#[0-9a-f]{6}$/i.test(b?.color || '') ? b.color : null,
    people: Number.isInteger(b?.people) && b.people > 0 && b.people <= 5000 ? b.people : null,
    products,
    qty: Object.fromEntries(products.map((s: string) => [s, Object.fromEntries(Object.entries(b?.qty?.[s] || {}).map(([k, v]) => [String(k).slice(0, 20), Math.max(0, Math.min(5000, Math.floor(Number(v)) || 0))]))])),
    packs: (Array.isArray(b?.packs) ? b.packs : []).filter((s: string) => products.includes(s)),
    logoId: LOGO_ID.test(b?.logoId || '') ? b.logoId : undefined,
    logoName: typeof b?.logoName === 'string' ? b.logoName.slice(0, 120) : undefined,
    logoStatus: b?.logoStatus === 'text' ? 'text' : 'uploaded',
    text: typeof b?.text === 'string' ? b.text.slice(0, 24) : undefined,
  };
  const id = randomBytes(12).toString('hex');
  await putJSON('brouillons', id, draft);

  const origin = publicOrigin(req);
  const resume = `${origin}/assistant?reprise=${id}`;
  let crm = 'non-configure';
  let crmDetail: string | undefined;
  if (adminEnabled()) {
    try {
      await upsertProspect({
        email, marketing: draft.marketing,
        tags: ['assistant-brouillon', ...products.map((s: string) => `interet-${getProduct(s)!.category}`)],
        note: `Demande assistant ${new Date().toLocaleDateString('fr-FR')} : ${products.map((s: string) => getProduct(s)!.name).join(', ')}${draft.people ? `, ${draft.people} personnes` : ''}.\nReprendre : ${resume}${draft.logoId ? `\nLogo : ${origin}/api/logo/${draft.logoId}` : ''}`,
      });
      crm = 'ok';
    } catch (e) {
      console.error('[brouillon shopify]', e);
      const m = String((e as Error)?.message);
      crm = /access|scope|denied|autoris/i.test(m) ? 'droits-manquants' : 'erreur';
      crmDetail = m.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '…').slice(0, 200);
    }
  }
  return NextResponse.json({ id, resume, crm, ...(crmDetail ? { crmDetail } : {}) });
}
