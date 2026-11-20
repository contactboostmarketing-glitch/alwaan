import type { Metadata } from 'next';
import Link from 'next/link';
import { ClearCart } from './ClearCart';

export const metadata: Metadata = { title: 'Commande confirmée', robots: { index: false } };
export default function Thanks() {
  return (
    <section className="wrap empty">
      <ClearCart />
      <h1>Merci, votre commande est confirmée</h1>
      <p className="muted">Vous recevez un email de confirmation. Votre maquette validée part en production : vous recevrez le numéro de suivi dès l'expédition.</p>
      <Link className="btn line" href="/">Retour à l&apos;accueil</Link>
    </section>
  );
}
