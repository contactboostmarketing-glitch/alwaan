// Informations de société du client (raison sociale, SIRET, TVA), saisies dans « Mon profil ».
// Stockées par email (haché) : reprises sur les devis et les factures.
import { createHash } from 'crypto';
import { getJSON, putJSON } from './blobStore';

export type CompanyInfo = { company?: string; siret?: string; vat?: string };
const key = (email: string) => createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32);
export const getCompanyInfo = async (email?: string | null): Promise<CompanyInfo> => (email && (await getJSON<CompanyInfo>('profils', key(email)).catch(() => null))) || {};
export const setCompanyInfo = (email: string, c: CompanyInfo) => putJSON('profils', key(email), c);
/** Lignes « SIRET … · TVA … » à imprimer sous le nom du client. */
export const companyLines = (c: CompanyInfo) => [c.siret && `SIRET ${c.siret}`, c.vat && `TVA ${c.vat}`].filter(Boolean).join(' · ');
