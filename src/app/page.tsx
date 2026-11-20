import Link from 'next/link';
import { CATEGORIES, GENERAL_FAQ, PRODUCTS, SECTORS, defaultColor, fromPrice, productsIn } from '@/lib/catalog';
import { Garment } from '@/components/Garment';
import { Price } from '@/components/Price';
import { Faq, Icon, MoreInfo, Perks, ProductCard } from '@/components/ui';

export default function Home() {
  const hero = ['polo-pegaso', 'tablier-benoit', 'casquette-mercury', 'gilet-hv-beta'];
  return (
    <>
      <section className="hero"><div className="wrap">
        <div>
          <span className="muted strong">Restaurants, hôtels, artisans, associations</span>
          <h1>Vos tenues à <span>votre logo</span>, livrées en 7 jours</h1>
          <p className="lead">Votre logo, votre tenue en direct. Dès 1 pièce.</p>
          <div className="ctas"><Link className="btn cta" href="/assistant">Créer ma tenue en 1 minute</Link><Link className="btn line" href="/vetements/polos-personnalises">Voir les vêtements</Link></div>
          <Perks items={[['eye', 'Maquette en direct'], ['one', 'Dès 1 pièce'], ['tag', '-40 % dès 30 pièces']]} />
        </div>
        <div className="hero-vis">
          {hero.map((s) => { const p = PRODUCTS.find((x) => x.slug === s)!; return <div key={s}><Garment slug={s} color={defaultColor(p)} zones={['heart']} /></div>; })}
        </div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>Nos vêtements personnalisables</h2></div>
        <div className="cats">
          {CATEGORIES.map((c) => {
            const list = productsIn(c.slug), first = list[0];
            return (
              <Link className="catcard" key={c.slug} href={`/vetements/${c.slug}`}>
                <Garment slug={first.slug} color={defaultColor(first)} />
                <strong>{c.name}</strong>
                <small>{list.length} modèles · dès <Price ht={Math.min(...list.map(fromPrice))} /></small>
              </Link>
            );
          })}
        </div>
      </div></section>

      <section className="section soft"><div className="wrap">
        <div className="sec-head"><h2>Les plus commandés</h2></div>
        <div className="grid">{PRODUCTS.filter((p) => p.bestseller).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>Votre métier</h2></div>
        <div className="sectors">{SECTORS.map((s) => (
          <Link className="sector" key={s.slug} href={`/metiers/${s.slug}`}>
            <span className="sector-vis" aria-hidden="true">{s.categories.map((ck) => { const p = productsIn(ck).find((x) => x.bestseller) ?? productsIn(ck)[0]; return <Garment key={ck} slug={p.slug} color={defaultColor(p)} />; })}</span>
            <strong>{s.name}</strong><small>{s.sub}</small>
          </Link>
        ))}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>Comment ça marche</h2></div>
        <ol className="steps-ic">
          <li><Icon name="shirt" size={30} /><b>Vous choisissez</b><small>Vêtement, couleur, emplacement</small></li>
          <li><Icon name="upload" size={30} /><b>Votre logo</b><small>PNG, JPG, SVG ou texte</small></li>
          <li><Icon name="eye" size={30} /><b>Vous validez</b><small>Ce que vous voyez est imprimé</small></li>
          <li><Icon name="truck" size={30} /><b>Livré en 7 jours</b><small>Impression DTF haute définition</small></li>
        </ol>
      </div></section>

      <section className="section"><div className="wrap page-narrow">
        <div className="sec-head"><h2>Questions fréquentes</h2></div>
        <Faq items={GENERAL_FAQ} />
        <MoreInfo title="alwaan en bref">
          <p>alwaan imprime vos vêtements de travail et vos textiles promotionnels à votre logo : polos, t-shirts, chemises, tabliers, casquettes et vêtements haute visibilité EN ISO 20471. Nous équipons les restaurants, hôtels, commerces, artisans, entreprises du BTP et de la logistique, clubs et associations en France et en Belgique.</p>
          <p>Le marquage est réalisé en impression DTF haute définition : couleurs vives, dégradés et petits détails, sur textile clair ou foncé. Vous commandez dès 1 pièce, sans frais de préparation. Le prix du marquage baisse automatiquement de 15 % dès 5 pièces, 20 % dès 10 et 40 % dès 30, en cumulant les pièces qui portent le même logo.</p>
          <p>La maquette s&apos;affiche en direct avec votre logo, détouré automatiquement si besoin. La maquette validée sert de bon à tirer : l&apos;impression la reproduit fidèlement. Production en 7 jours ouvrés, livraison offerte dès 150 € HT.</p>
        </MoreInfo>
      </div></section>
    </>
  );
}
