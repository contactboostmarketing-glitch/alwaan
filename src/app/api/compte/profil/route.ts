import { limited, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import { customerQuery, discovery, getSession } from '@/lib/customer';
import { getCompanyInfo, setCompanyInfo } from '@/lib/profile';
import { publicOrigin } from '@/lib/site';

/**
 * Profil du client connecté : nom et prénom (Shopify), adresses de livraison (Shopify),
 * informations de société pour les devis et factures (site : raison sociale, SIRET, TVA).
 * Pas de mot de passe : la connexion se fait par code email. L'email se change sur la page de compte Shopify.
 */
type Addr = { id?: string; firstName?: string; lastName?: string; company?: string; address1?: string; address2?: string; zip?: string; city?: string; territoryCode?: string; phoneNumber?: string };
const ADDR = 'id firstName lastName company address1 address2 zip city territoryCode phoneNumber';

async function load(s: Parameters<typeof customerQuery>[0]) {
  const d = await customerQuery<{ customer: { firstName?: string; lastName?: string; emailAddress?: { emailAddress: string }; defaultAddress?: { id: string } | null; addresses: { nodes: Addr[] } } }>(s,
    `{ customer { firstName lastName emailAddress { emailAddress } defaultAddress { id } addresses(first: 10) { nodes { ${ADDR} } } } }`);
  const c = d.customer, email = c.emailAddress?.emailAddress || '';
  const extras = await getCompanyInfo(email);
  const account = (await discovery()).graphql_api.replace(/\/customer\/api\/.*$/, '');
  return { firstName: c.firstName || '', lastName: c.lastName || '', email, defaultAddressId: c.defaultAddress?.id, addresses: c.addresses.nodes, ...extras, accountUrl: account };
}

export async function GET(req: Request) {
  const { s } = await getSession(req, publicOrigin(req));
  if (!s) return NextResponse.json({ error: 'Connectez-vous d\'abord.' }, { status: 401 });
  try { return NextResponse.json(await load(s)); } catch (e) { return NextResponse.json({ error: (e as Error).message.slice(0, 200) }, { status: 502 }); }
}

const clean = (v: unknown, n = 80) => (typeof v === 'string' ? v.trim().slice(0, n) : undefined);
type UE = { userErrors: { message: string }[] };

export async function POST(req: Request) {
  if (await limited(req, 'profil', 30, 600)) return tooMany();
  const { s } = await getSession(req, publicOrigin(req));
  if (!s) return NextResponse.json({ error: 'Connectez-vous d\'abord.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const errs: string[] = [];
  const run = async (q: string, v: Record<string, unknown>, field: string) => {
    const d = await customerQuery<Record<string, UE>>(s, q, v);
    errs.push(...(d[field]?.userErrors || []).map((e) => e.message));
  };
  try {
    if (b?.action === 'identite') {
      await run(`mutation($i: CustomerUpdateInput!) { customerUpdate(input: $i) { userErrors { message } } }`, { i: { firstName: clean(b.firstName, 60), lastName: clean(b.lastName, 60) } }, 'customerUpdate');
    } else if (b?.action === 'societe') {
      const me = await load(s);
      const siret = clean(b.siret, 20)?.replace(/\s/g, ''), vat = clean(b.vat, 20)?.replace(/\s/g, '').toUpperCase();
      if (siret && !/^\d{9}(\d{5})?$/.test(siret)) errs.push('SIRET : 9 ou 14 chiffres.');
      if (vat && !/^[A-Z]{2}[A-Z0-9]{2,13}$/.test(vat)) errs.push('Numéro de TVA invalide (ex. FR12345678901).');
      if (!errs.length) await setCompanyInfo(me.email, { company: clean(b.company, 120), siret, vat });
    } else if (b?.action === 'adresse') {
      const a = b.address || {};
      const address = { firstName: clean(a.firstName, 60), lastName: clean(a.lastName, 60), company: clean(a.company, 120), address1: clean(a.address1, 120), address2: clean(a.address2, 120), zip: clean(a.zip, 12), city: clean(a.city, 80), territoryCode: a.territoryCode === 'BE' ? 'BE' : 'FR', phoneNumber: clean(a.phoneNumber, 20) || undefined };
      if (!address.address1 || !address.zip || !address.city) errs.push('Adresse, code postal et ville obligatoires.');
      else if (a.id) await run(`mutation($id: ID!, $a: CustomerAddressInput!, $d: Boolean) { customerAddressUpdate(addressId: $id, address: $a, defaultAddress: $d) { userErrors { message } } }`, { id: a.id, a: address, d: !!b.makeDefault }, 'customerAddressUpdate');
      else await run(`mutation($a: CustomerAddressInput!, $d: Boolean) { customerAddressCreate(address: $a, defaultAddress: $d) { userErrors { message } } }`, { a: address, d: !!b.makeDefault }, 'customerAddressCreate');
    } else if (b?.action === 'supprimer-adresse' && typeof b.id === 'string') {
      await run(`mutation($id: ID!) { customerAddressDelete(addressId: $id) { userErrors { message } } }`, { id: b.id }, 'customerAddressDelete');
    } else return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
  } catch (e) { errs.push((e as Error).message.slice(0, 200)); }
  if (errs.length) return NextResponse.json({ error: errs.join(' ') }, { status: 400 });
  return NextResponse.json(await load(s));
}
