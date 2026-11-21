// Photos de contrôle avant expédition, par numéro de commande (preuve de conformité, visibles par le client).
import { getJSON, putJSON } from './blobStore';

const key = (orderName: string) => orderName.replace(/\D/g, '');
export const getPhotos = async (orderName: string) => (await getJSON<string[]>('controle', key(orderName))) || [];
export async function addPhoto(orderName: string, id: string) {
  const list = await getPhotos(orderName);
  if (!list.includes(id)) await putJSON('controle', key(orderName), [...list, id].slice(-6));
}
