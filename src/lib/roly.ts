// Client de l'API Roly / Gorfactory (GOR_WSCLIENTS, manuel MAN-0000050 v4.16).
// Côté serveur uniquement. Identifiants dans Netlify : ROLY_USERNAME, ROLY_PASSWORD (accès extranet,
// API activée par le commercial). Jeton JWT valable 24 h, gardé en mémoire.
const BASE = process.env.ROLY_API_BASE || 'https://clientsws.gorfactory.es:2096';
let token: { value: string; expires: number } | null = null;

export const rolyEnabled = () => !!(process.env.ROLY_USERNAME && process.env.ROLY_PASSWORD);

async function login(): Promise<string> {
  if (token && token.expires > Date.now() + 10 * 60_000) return token.value;
  const user = process.env.ROLY_USERNAME!, pass = process.env.ROLY_PASSWORD!;
  // Documentation Swagger : /api/v1.1/login (JSON), /api/v1/login (formulaire) ; /api/v1.0/login gardé en dernier recours.
  const tries: [string, () => RequestInit][] = [
    ['/api/v1.1/login', () => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) })],
    ['/api/v1/login', () => { const f = new FormData(); f.append('username', user); f.append('password', pass); return { method: 'POST', body: f }; }],
    ['/api/v1.0/login', () => { const f = new FormData(); f.append('username', user); f.append('password', pass); return { method: 'POST', body: f }; }],
  ];
  let j: { token?: string } = {}, status = 0;
  for (const [path, init] of tries) {
    const r = await fetch(`${BASE}${path}`, { ...init(), cache: 'no-store' }).catch(() => null);
    status = r?.status || 0;
    j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.token) break;
  }
  if (!j.token) throw new Error(`Connexion Roly refusée (${status})`);
  token = { value: j.token!, expires: Date.now() + 23 * 3600_000 };
  return token.value;
}

async function call<T>(path: string, init: { method?: 'GET' | 'POST'; query?: Record<string, string>; form?: Record<string, string>; json?: unknown } = {}): Promise<T> {
  const url = new URL(BASE + path);
  Object.entries(init.query || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  let body: BodyInit | undefined; const headers: Record<string, string> = { Authorization: `Bearer ${await login()}` };
  if (init.form) { const f = new FormData(); Object.entries(init.form).forEach(([k, v]) => f.append(k, v)); body = f; }
  if (init.json) { body = JSON.stringify(init.json); headers['Content-Type'] = 'application/json'; }
  const r = await fetch(url, { method: init.method || 'GET', headers, body, cache: 'no-store' });
  if (r.status === 401) token = null;
  const text = await r.text();
  if (!r.ok) throw new Error(`Roly ${path} : ${r.status} ${text.slice(0, 200)}`);
  return JSON.parse(text) as T;
}

/** Une ligne du catalogue = une variante (modèle + taille + coloris). */
export type RolyItem = {
  itemcode: string; itemname: string; eancode?: string; modelcode: string; modelid: string; modelname: string;
  description?: string; composition?: string; observations?: string; moq?: number; stepqty?: number;
  familycode: string; family: string; gender?: string; sizecode: string; sizename: string; colorcode: string; colorname: string;
  productimage?: string; modelimage?: string; detailsimages?: string; viewsimages?: string; otherimages?: string;
  measures?: string; weight?: number; isnovelty?: boolean; categories?: string; colordata?: { hexcode?: string; comphexcode?: string; url?: string };
};
export type RolyPrice = { productcode?: string; model?: string; size?: string; color?: string; price_unit?: number; price_pack?: number; price_box?: number; price_unit_pvp?: number; currency?: string };
export type RolyStock = { sku: string; description?: string; onhand: number; incoming?: string; canteco?: number; state?: string };

/** L'API renvoie soit une liste, soit un objet qui contient la liste (ex. { item: [...] }). */
const list = <T>(v: unknown): T[] => (Array.isArray(v) ? v : v && typeof v === 'object' ? ((Object.values(v).find(Array.isArray) as T[]) || []) : []);
export const rolyVersion = () => call<{ version: string }>('/api/v1.1/version');
/** Catalogue filtré par modèles (identifiants numériques, ex. 6502). */
export const rolyCatalog = (models: string[], lang = 'fr-FR') =>
  call<unknown>('/api/v2.3/item/getcatalog', { query: { lang, brand: 'roly', modelList: models.join(';') } }).then((v) => list<RolyItem>(v));
/** Tarif client (prix d'achat) d'un modèle, ex. CA6502. */
export const rolyPrices = (model: string) =>
  call<unknown>('/api/v1.0/item/pricelist', { method: 'POST', form: { brand: 'roly', model, includeoutlet: '0' } }).then((v) => list<RolyPrice>(v));
/** Stock disponible (entrepôt 2010 = Murcie, par défaut). */
export const rolyStock = (whscode = '2010') =>
  call<unknown>('/api/v1.0/stock/getuserstock', { method: 'POST', form: { whscode, brand: 'roly' } }).then((v) => list<RolyStock>(v));
