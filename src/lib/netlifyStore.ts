// Accès Netlify Blobs commun. Correctif : sur Netlify, la lecture d'une clé absente (réponse 404)
// restait bloquée en vidant le corps de la réponse ; on renvoie une réponse 404 vide à la place.
const safeFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(15_000) });
  if (res.status !== 404) return res;
  res.body?.cancel().catch(() => {}); // sans attendre
  return new Response(null, { status: 404, headers: res.headers });
};

export async function store(name: string) {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name, consistency: 'strong', fetch: safeFetch });
}
