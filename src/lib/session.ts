// Cookies chiffrés (AES-256-GCM) : session client et état de connexion. Clé dérivée de SESSION_SECRET
// (ou, à défaut, du secret de l'application Shopify). Rien de lisible côté navigateur.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const key = () => createHash('sha256').update(`alwaan-session:${process.env.SESSION_SECRET || process.env.SHOPIFY_CLIENT_SECRET || 'dev-only'}`).digest();

export function seal(data: unknown): string {
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(data), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}
export function unseal<T>(token?: string | null): T | null {
  if (!token) return null;
  try {
    const b = Buffer.from(token, 'base64url'), d = createDecipheriv('aes-256-gcm', key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8')) as T;
  } catch { return null; }
}
export const cookieOf = (req: Request, name: string) =>
  req.headers.get('cookie')?.split(/;\s*/).find((c) => c.startsWith(name + '='))?.slice(name.length + 1);
export const setCookie = (name: string, value: string, maxAge: number) =>
  `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
