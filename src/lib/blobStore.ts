// Petit stockage clé → JSON : Netlify Blobs en ligne, dossier .data en local.
import { promises as fs } from 'fs';
import path from 'path';

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.SITE_ID);

export async function putJSON(store: string, key: string, value: unknown) {
  if (onNetlify()) {
    const { getStore } = await import('@netlify/blobs');
    await getStore({ name: store, consistency: 'strong' }).setJSON(key, value);
    return;
  }
  const dir = path.join(process.cwd(), '.data', store);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${key}.json`), JSON.stringify(value));
}

export async function getJSON<T>(store: string, key: string): Promise<T | null> {
  if (onNetlify()) {
    const { getStore } = await import('@netlify/blobs');
    return (await getStore({ name: store, consistency: 'strong' }).get(key, { type: 'json' })) as T | null;
  }
  try { return JSON.parse(await fs.readFile(path.join(process.cwd(), '.data', store, `${key}.json`), 'utf8')); } catch { return null; }
}
