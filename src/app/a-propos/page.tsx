import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui';

export const metadata: Metadata = { title: 'À propos d\'alwaan', description: 'alwaan imprime vos vêtements professionnels personnalisés en DTF, dès 1 pièce, avec maquette en direct. Livraison en France et en Belgique.', alternates: { canonical: '/a-propos' } };
export default function About() {
  return (
    <>
      <Breadcrumbs items={[['À propos']]} />
      <section className="wrap guide">
        <h1>À propos d&apos;alwaan</h1>
        <p className="lead-txt">alwaan personnalise des vêtements professionnels à votre logo : polos, t-shirts, sweats, tabliers, casquettes et vêtements haute visibilité, pour les entreprises, artisans, commerçants, associations et particuliers.</p>
        <h2>Ce qui nous distingue</h2>
        <p><b>Maquette en direct.</b> Vous déposez votre logo et voyez immédiatement votre tenue. La maquette que vous validez est imprimée à l&apos;identique.</p>
        <p><b>Impression DTF dès 1 pièce.</b> Toutes les couleurs, sans frais de préparation, avec un prix qui baisse automatiquement avec la quantité.</p>
        <p><b>Livraison rapide.</b> Production et livraison en 7 jours ouvrés, 4 jours en express, en France et en Belgique.</p>
        <h2>Nos vêtements</h2>
        <p>Nous travaillons avec Roly, fabricant européen de textile professionnel et promotionnel, pour des vêtements résistants et une large gamme de coloris.</p>
        <h2>Nous contacter</h2>
        <p>Pour une grande quantité ou une demande particulière, <Link href="/devis">demandez un devis</Link>.</p>
        <p className="draft">À compléter : raison sociale, adresse, SIRET et coordonnées (aussi utiles pour Google et les moteurs IA).</p>
      </section>
    </>
  );
}
