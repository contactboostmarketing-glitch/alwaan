// Stockage des fichiers logo envoyés par les clients.
// En ligne : Netlify Blobs (inclus dans Netlify, rien à configurer).
// En local : dossier .data/logos (ignoré par git).
import { promises as fs } from 'fs';
import path from 'path';

export const MAX_LOGO_BYTES = 15 * 1024 * 1024;
export const LOGO_TYPES: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
  'image/heic': 'heic', 'image/heif': 'heif', 'application/pdf': 'pdf', 'application/postscript': 'eps',
  'application/illustrator': 'ai', 'application/vnd.adobe.illustrator': 'ai',
};
export const LOGO_ID = /^[a-f0-9]{32}\.[a-z]{2,5}$/;

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.SITE_ID);
const localDir = () => path.join(process.cwd(), '.data', 'logos');

async function netlifyStore() {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: 'logos', consistency: 'strong' });
}

export async function saveLogo(id: string, data: ArrayBuffer, meta: { type: string; name: string }) {
  if (onNetlify()) {
    const store = await netlifyStore();
    await store.set(id, data, { metadata: meta });
    return;
  }
  await fs.mkdir(localDir(), { recursive: true });
  await fs.writeFile(path.join(localDir(), id), Buffer.from(data));
  await fs.writeFile(path.join(localDir(), `${id}.json`), JSON.stringify(meta));
}

export async function readLogo(id: string): Promise<{ data: ArrayBuffer; type: string; name: string } | null> {
  if (onNetlify()) {
    const store = await netlifyStore();
    const r = await store.getWithMetadata(id, { type: 'arrayBuffer' });
    if (!r) return null;
    const m = r.metadata as { type?: string; name?: string };
    return { data: r.data as ArrayBuffer, type: m.type || 'application/octet-stream', name: m.name || id };
  }
  try {
    const buf = await fs.readFile(path.join(localDir(), id));
    const meta = JSON.parse(await fs.readFile(path.join(localDir(), `${id}.json`), 'utf8'));
    return { data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, ...meta };
  } catch { return null; }
}
