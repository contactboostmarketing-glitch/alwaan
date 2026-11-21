// Envoi des ventes aux régies côté serveur (fiable même sans cookie, bloqueur de pub ou Safari).
//   GA4 Measurement Protocol : GA4_ID (G-…) + GA4_API_SECRET → importer l'événement purchase dans Google Ads.
//   Meta Conversions API      : META_PIXEL_ID + META_CAPI_TOKEN.
import { createHash, randomInt } from 'crypto';

const sha = (s: string) => createHash('sha256').update(s.trim().toLowerCase()).digest('hex');

export type Sale = {
  orderId: string; name: string; value: number; currency: string; createdAt: string;
  email?: string; phone?: string; ip?: string; ua?: string;
  attr: Record<string, string>; items: { id: string; name: string; quantity: number; price: number }[];
};

export async function sendGA4(s: Sale): Promise<string> {
  const id = process.env.GA4_ID, secret = process.env.GA4_API_SECRET;
  if (!id || !secret) return 'GA4 non configuré';
  const client_id = s.attr.ga_cid || `${randomInt(1e9)}.${Math.floor(Date.now() / 1000)}`;
  const r = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${id}&api_secret=${secret}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id,
      events: [{ name: 'purchase', params: {
        transaction_id: s.name, value: s.value, currency: s.currency,
        items: s.items.map((i) => ({ item_id: i.id, item_name: i.name, quantity: i.quantity, price: i.price })),
        ...(s.attr.gclid ? { gclid: s.attr.gclid } : {}),
        ...(s.attr.utm_source ? { campaign_source: s.attr.utm_source, campaign_medium: s.attr.utm_medium, campaign_name: s.attr.utm_campaign } : {}),
      } }],
    }),
  });
  return r.ok ? 'GA4 ok' : `GA4 ${r.status}`;
}

export async function sendMeta(s: Sale, siteUrl: string): Promise<string> {
  const pixel = process.env.META_PIXEL_ID, token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return 'Meta non configuré';
  const user_data: Record<string, unknown> = {};
  if (s.email) user_data.em = [sha(s.email)];
  if (s.phone) user_data.ph = [sha(s.phone.replace(/\D/g, ''))];
  if (s.attr.fbp) user_data.fbp = s.attr.fbp;
  if (s.attr.fbc) user_data.fbc = s.attr.fbc;
  if (s.ip) user_data.client_ip_address = s.ip;
  if (s.ua) user_data.client_user_agent = s.ua;
  const r = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [{
      event_name: 'Purchase', event_time: Math.floor(Date.parse(s.createdAt) / 1000), event_id: `order-${s.orderId}`,
      action_source: 'website', event_source_url: siteUrl, user_data,
      custom_data: { currency: s.currency, value: s.value, content_type: 'product', content_ids: s.items.map((i) => i.id), order_id: s.name },
    }] }),
  });
  return r.ok ? 'Meta ok' : `Meta ${r.status}`;
}
