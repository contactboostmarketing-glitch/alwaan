import Link from 'next/link';
import { CATEGORIES, GENERAL_FAQ, PRODUCTS, SECTORS, defaultColor, fromPrice, productsIn } from '@/lib/catalog';
import { Garment } from '@/components/Garment';
import { Price } from '@/components/Price';
import { Checks, Faq, ProductCard } from '@/components/ui';

export default function Home() {
  const hero = ['polo-pegaso', 'tablier-benoit', 'casquette-mercury', 'gilet-hv-beta'];
  return (
    <>
      <section className="hero"><div className="wrap">
        <div>
          <span className="muted strong">Restaurants, hôtels, artisans, associations</span>
          <h1>Vos tenues à <span>votre logo</span>, livrées en 7 jours</h1>
          <p className="lead">Déposez votre logo, voyez tout de suite votre tenue, validez et c'est parti. Sans minimum de commande.</p>
          <div className="ctas"><Link className="btn cta" href="/assistant">Créer ma tenue en 1 minute</Link><Link className="btn line" href="/vetements/polos-personnalises">Voir les vêtements</Link></div>
          <Checks items={['Maquette en direct avec votre logo', 'Dès 1 pièce', 'Prix dégressifs jusqu\'à -38 %']} />
        </div>
        <div className="hero-vis">
          {hero.map((s) => { const p = PRODUCTS.find((x) => x.slug === s)!; return <div key={s}><Garment slug={s} color={defaultColor(p)} zones={[p.shape === 'cap' ? 'chest' : 'heart']} /></div>; })}
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
        <div className="sectors">{SECTORS.map((s) => <Link className="sector" key={s.slug} href={`/metiers/${s.slug}`}><strong>{s.name}</strong><small>{s.sub}</small></Link>)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>Comment ça marche</h2></div>
        <div className="steps4">
          <div><b>Vous choisissez</b><p>Le vêtement, la couleur et les emplacements du logo.</p></div>
          <div><b>Vous déposez votre logo</b><p>PNG, JPG ou SVG. Pas de logo ? Un simple texte suffit.</p></div>
          <div><b>Vous validez la maquette</b><p>Elle s'affiche en direct : ce que vous voyez est ce qui sera imprimé.</p></div>
          <div><b>On produit et on livre</b><p>Impression DTF haute définition, livraison en 7 jours ouvrés.</p></div>
        </div>
      </div></section>

      <section className="section"><div className="wrap page-narrow">
        <div className="sec-head"><h2>Questions fréquentes</h2></div>
        <Faq items={GENERAL_FAQ} />
      </div></section>
    </>
  );
}
