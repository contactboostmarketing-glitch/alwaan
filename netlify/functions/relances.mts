// Fonction planifiée Netlify : toutes les heures, envoie l'offre -10 % aux paniers abandonnés depuis 24 h.
export default async () => {
  const base = process.env.URL || 'https://alwaan.fr';
  const r = await fetch(`${base}/api/relance/tick`, { method: 'POST', headers: { 'x-sync-key': process.env.SYNC_KEY || process.env.ROLY_SYNC_KEY || '' } });
  console.log('[relances]', r.status, (await r.text()).slice(0, 500));
};
export const config = { schedule: '@hourly' };
