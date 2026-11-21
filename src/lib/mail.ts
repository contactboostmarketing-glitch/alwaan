// Envoi d'emails transactionnels (relances panier, alertes atelier) via Resend.
// Configuration Netlify : RESEND_API_KEY, MAIL_FROM (ex. « alwaan <contact@alwaan.fr> »), ATELIER_EMAIL.
// Sans clé : rien n'est envoyé, l'appel renvoie « non configuré » (le site continue de fonctionner).
import { COMPANY } from './site';

export const mailEnabled = () => !!process.env.RESEND_API_KEY;
export const atelierEmail = () => process.env.ATELIER_EMAIL || COMPANY.email;
const from = () => process.env.MAIL_FROM || `alwaan <${COMPANY.email}>`;

export async function sendMail(m: { to: string; subject: string; html: string; text?: string; replyTo?: string }): Promise<string> {
  if (!mailEnabled()) return 'non configuré';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: from(), to: [m.to], subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo || COMPANY.email }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status} ${(await r.text()).slice(0, 200)}`);
  return 'envoyé';
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
/** Gabarit simple et sobre, lisible sur mobile. */
export function layout(o: { title: string; intro: string; cta?: [string, string]; rows?: string[]; foot?: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#14213f">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<p style="font-size:22px;font-weight:700;margin:0 0 18px">alwaan</p>
<div style="background:#fff;border-radius:16px;padding:24px">
<h1 style="font-size:20px;margin:0 0 12px">${esc(o.title)}</h1>
<p style="font-size:15px;line-height:1.5;margin:0 0 16px">${o.intro}</p>
${o.rows?.length ? `<ul style="padding-left:18px;font-size:14px;line-height:1.6;margin:0 0 16px">${o.rows.map((r) => `<li>${r}</li>`).join('')}</ul>` : ''}
${o.cta ? `<a href="${esc(o.cta[1])}" style="display:inline-block;background:#d12f7c;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">${esc(o.cta[0])}</a>` : ''}
</div>
<p style="font-size:12px;color:#5b6478;line-height:1.5;margin:16px 4px">${o.foot || `${COMPANY.name} · ${COMPANY.address}`}</p>
</div></body></html>`;
}
export { esc };
