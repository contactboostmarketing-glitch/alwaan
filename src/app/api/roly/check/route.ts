import { NextResponse } from 'next/server';
import { rolyCatalog, rolyEnabled, rolyPrices, rolyStock, rolyVersion } from '@/lib/roly';

/**
 * Diagnostic de la connexion à l'API Roly depuis le serveur du site (Netlify).
 * Protégé par la clé ROLY_SYNC_KEY. Ne renvoie que des comptes et des exemples, jamais les identifiants.
 */
export async function GET(req: Request) {
  if (!process.env.ROLY_SYNC_KEY || req.headers.get('x-sync-key') !== process.env.ROLY_SYNC_KEY) return new Response('Non autorisé', { status: 401 });
  if (!rolyEnabled()) return NextResponse.json({ ok: false, step: 'config', error: 'ROLY_USERNAME / ROLY_PASSWORD manquants' });
  const out: Record<string, unknown> = {};
  try { out.version = await rolyVersion(); } catch (e) { return NextResponse.json({ ok: false, step: 'connexion', error: String((e as Error).message).slice(0, 300) }); }
  try {
    const cat = await rolyCatalog(['6502']);
    out.catalogue = { variantes: cat.length, exemple: cat[0] && Object.fromEntries(Object.entries(cat[0]).filter(([k]) => ['itemcode', 'modelname', 'sizename', 'colorname', 'composition', 'weight', 'productimage', 'colordata', 'moq', 'stepqty'].includes(k))) };
  } catch (e) { out.catalogue = { erreur: String((e as Error).message).slice(0, 300) }; }
  try { const p = await rolyPrices('CA6502'); out.tarifs = { lignes: p.length, exemple: p[0] }; } catch (e) { out.tarifs = { erreur: String((e as Error).message).slice(0, 300) }; }
  try { const s = await rolyStock(); out.stock = { lignes: s.length, exemple: s[0] }; } catch (e) { out.stock = { erreur: String((e as Error).message).slice(0, 300) }; }
  return NextResponse.json({ ok: true, ...out });
}
