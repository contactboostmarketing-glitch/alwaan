import Link from 'next/link';
import { CATEGORIES, GENERAL_FAQ, PRODUCTS, SECTORS, defaultColor, fromPrice, productsIn, defaultZone } from '@/lib/catalog';
import { Garment } from '@/components/Garment';
import { Price } from '@/components/Price';
import { Faq, Icon, MoreInfo, Perks, ProductCard } from '@/components/ui';
import { categoryL, generalFaq, href, sectorL, tr, type Lang } from '@/i18n';
import { HOME_EN_ABOUT } from '@/i18n/catalog-en';
import { currentSeason, orderBy } from '@/lib/seasons';
import { PACKS } from '@/lib/packs';
import { GiftsBand } from '@/components/GiftsBand';
import { I } from '@/components/Icons';

const ABOUT_FR = [
  'alwaan imprime vos vêtements de travail et vos textiles promotionnels à votre logo : polos, t-shirts, chemises, tabliers, casquettes et vêtements haute visibilité EN ISO 20471. Nous équipons les restaurants, hôtels, commerces, artisans, entreprises du BTP et de la logistique, clubs et associations en France et en Belgique.',
  'Le marquage est réalisé en impression DTF haute définition : couleurs vives, dégradés et petits détails, sur textile clair ou foncé. Vous commandez dès 1 pièce, sans frais de préparation. Le prix du marquage baisse automatiquement de 15 % dès 5 pièces, 20 % dès 10 et 40 % dès 30, en cumulant les pièces qui portent le même logo.',
  'La maquette s\'affiche en direct avec votre logo, détouré automatiquement si besoin. La maquette validée sert de bon à tirer : l\'impression la reproduit fidèlement. Production en 7 jours ouvrés, livraison offerte dès 150 € HT.',
];

export function HomeView({ lang }: { lang: Lang }) {
  const t = (s: string) => tr(lang, s);
  const season = currentSeason(), sc = season[lang], until = orderBy(season);
  const hero = season.featured;
  const seasonVars = { '--season': season.accent, '--season-soft': season.soft } as React.CSSProperties;
  return (
    <>
      <section className="hero" data-season={season.id} style={seasonVars}><span className="season-deco" aria-hidden="true"><I name={season.icon} size={150} strokeWidth={1} /></span><div className="wrap">
        <div>
          <span className="season-kicker"><I name={season.icon} size={16} /> {sc.kicker}</span>
          <h1>{lang === 'en' ? <>Your workwear with <span>your logo</span>, delivered in 7 days</> : <>Vos tenues à <span>votre logo</span>, livrées en 7 jours</>}</h1>
          <p className="lead">{t('Votre logo, votre tenue en direct. Dès 1 pièce.')}</p>
          <div className="ctas"><Link className="btn cta" href={href(lang, '/assistant')}>{t('Créer ma tenue en 1 minute')}</Link><Link className="btn line" href={href(lang, '/lien-equipe')}><I name="users" size={18} /> {t('Lien d\'équipe')}</Link></div>
          <Perks items={[['eye', t('Maquette en direct')], ['one', t('Dès 1 pièce')], ['tag', t('-40 % dès 30 pièces')]]} />
        </div>
        <div className="hero-vis">
          {hero.map((s) => { const p = PRODUCTS.find((x) => x.slug === s)!; return <div key={s}><Garment slug={s} color={defaultColor(p)} zones={[defaultZone(p)]} /></div>; })}
        </div>
      </div></section>

      <section className="section gifts-sec"><div className="wrap"><GiftsBand /></div></section>

      <section className="section"><div className="wrap">
        <Link className="team-feature" href={href(lang, '/lien-equipe')}>
          <div className="tf-phone" aria-hidden="true">
            <div className="tf-row"><b>Julie M.</b><span>M</span></div><div className="tf-row"><b>Karim B.</b><span>L</span></div><div className="tf-row"><b>Sophie D.</b><span>S</span></div><div className="tf-row new"><b>Marco R.</b><span>XL</span></div>
          </div>
          <div>
            <span className="season-kicker"><I name="users" size={16} /> {t('Exclusif alwaan')}</span>
            <h2>{t('Un lien, et chacun donne sa taille')}</h2>
            <p className="muted">{t('Plus de tableau de tailles : partagez un lien, votre panier se remplit tout seul.')}</p>
            <span className="btn cta">{t('Découvrir le lien d\'équipe')}</span>
          </div>
        </Link>
        <div className="advantages">
          {([['image', 'Maquette en direct', 'Votre logo sur le vêtement, en vrai'], ['scissors', 'Fond retiré tout seul', 'Votre logo prêt à imprimer'], ['shield', 'Maquette = bon à tirer', 'Imprimé exactement comme validé'], ['one', 'Dès 1 pièce', 'Et -40 % sur le marquage dès 30'], ['tag', 'Prénom imprimé', 'Au nom de chacun, dès 21 pièces'], ['zap', 'Express 4 jours', 'Pour les urgences'], ['bag', 'Boutique club', 'Vos membres commandent seuls'], ['camera', 'Photo avant envoi', 'Contrôle de chaque commande']] as const).map(([e, b, s2]) => (
            <div key={b} className="adv"><span className="adv-ic"><I name={e} size={22} /></span><b>{t(b)}</b><small>{t(s2)}</small></div>
          ))}
        </div>
      </div></section>

      <section className="section season" style={seasonVars}><div className="wrap">
        <div className="season-card">
          <div>
            <h2>{sc.title}</h2>
            <p className="muted">{sc.text}</p>
            {until && <p className="season-deadline"><I name="clock" size={16} /> {lang === 'en' ? `Order by ${until.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} to receive it before Christmas` : `Commandez avant le ${until.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} pour être livré avant Noël`}</p>}
            <Link className="btn cta" href={href(lang, '/assistant')}>{sc.cta}</Link>
          </div>
        </div>
        <div className="grid mt">{season.featured.map((slug) => PRODUCTS.find((x) => x.slug === slug)).filter(Boolean).map((p) => <ProductCard key={p!.slug} p={p!} lang={lang} />)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>{t('Nos vêtements personnalisables')}</h2></div>
        <div className="cats">
          {CATEGORIES.map((c0) => {
            const c = categoryL(lang, c0), list = productsIn(c.slug), first = list[0];
            return (
              <Link className="catcard" key={c.slug} href={href(lang, `/vetements/${c.slug}`)}>
                <Garment slug={first.slug} color={defaultColor(first)} />
                <strong>{c.name}</strong>
                <small>{tr(lang, '{n} modèles', { n: list.length })} · {t('dès')} <Price ht={Math.min(...list.map(fromPrice))} /></small>
              </Link>
            );
          })}
        </div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>{t('Packs prêts à commander')}</h2></div>
        <div className="packs">{PACKS.map((pk) => (
          <Link key={pk.id} className="pack" href={`${href(lang, '/assistant')}?pack=${pk.id}`}>
            <span className="pack-vis" aria-hidden="true">{pk.products.map((s) => { const p = PRODUCTS.find((x) => x.slug === s)!; return <Garment key={s} slug={s} color={defaultColor(p)} zones={[defaultZone(p)]} />; })}</span>
            <strong className="with-ic"><I name={pk.icon} size={18} /> {pk[lang].name}</strong><small>{pk[lang].sub}</small>
            <span className="price">{t('dès')} <Price ht={pk.products.reduce((a, s) => a + fromPrice(PRODUCTS.find((x) => x.slug === s)!), 0)} /> <small>{t('par personne')}</small></span>
          </Link>
        ))}</div>
      </div></section>

      <section className="section soft"><div className="wrap">
        <div className="sec-head"><h2>{t('Les plus commandés')}</h2></div>
        <div className="grid">{PRODUCTS.filter((p) => p.bestseller).map((p) => <ProductCard key={p.slug} p={p} lang={lang} />)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>{t('Votre métier')}</h2></div>
        <div className="sectors">{SECTORS.map((s0) => { const s = sectorL(lang, s0); return (
          <Link className="sector" key={s.slug} href={href(lang, `/metiers/${s.slug}`)}>
            <span className="sector-vis" aria-hidden="true">{s.categories.map((ck) => { const p = productsIn(ck).find((x) => x.bestseller) ?? productsIn(ck)[0]; return <Garment key={ck} slug={p.slug} color={defaultColor(p)} />; })}</span>
            <strong>{s.name}</strong><small>{s.sub}</small>
          </Link>
        ); })}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><h2>{t('Comment ça marche')}</h2></div>
        <ol className="steps-ic">
          <li><Icon name="shirt" size={30} /><b>{t('Vous choisissez')}</b><small>{t('Vêtement, couleur, emplacement')}</small></li>
          <li><Icon name="upload" size={30} /><b>{t('Votre logo')}</b><small>{t('PNG, JPG, SVG ou texte')}</small></li>
          <li><Icon name="eye" size={30} /><b>{t('Vous validez')}</b><small>{t('Ce que vous voyez est imprimé')}</small></li>
          <li><Icon name="truck" size={30} /><b>{t('Livré en 7 jours')}</b><small>{t('Impression DTF haute définition')}</small></li>
        </ol>
      </div></section>

      <section className="section"><div className="wrap page-narrow">
        <div className="sec-head"><h2>{t('Questions fréquentes')}</h2></div>
        <Faq items={generalFaq(lang, GENERAL_FAQ)} />
        <MoreInfo title={t('alwaan en bref')}>{(lang === 'en' ? HOME_EN_ABOUT : ABOUT_FR).map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</MoreInfo>
      </div></section>
    </>
  );
}
