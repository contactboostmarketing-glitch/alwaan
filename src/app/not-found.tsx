import Link from 'next/link';
export default function NotFound() {
  return <section className="wrap empty"><h1>Page introuvable</h1><p className="muted">Cette page n&apos;existe pas ou a été déplacée.</p><Link className="btn cta" href="/">Voir les vêtements</Link></section>;
}
