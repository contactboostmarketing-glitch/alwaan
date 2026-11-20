'use client';
// Contact humain en un tap : WhatsApp (NEXT_PUBLIC_WHATSAPP, ex. 33612345678) et téléphone (NEXT_PUBLIC_PHONE).
import { usePathname } from 'next/navigation';

const WA = process.env.NEXT_PUBLIC_WHATSAPP;
export const PHONE = process.env.NEXT_PUBLIC_PHONE;

export function ContactFloat() {
  const path = usePathname();
  if (!WA || path.startsWith('/atelier')) return null;
  const msg = encodeURIComponent(`Bonjour, j'ai une question sur ${path === '/' ? 'vos vêtements personnalisés' : `cette page : https://alwaan.fr${path}`}`);
  return (
    <a className="wa-float" href={`https://wa.me/${WA}?text=${msg}`} target="_blank" rel="noopener" aria-label="Nous écrire sur WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3Z"/></svg>
    </a>
  );
}
