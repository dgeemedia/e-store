import AudArt from '@/components/AudArt'
import Link from 'next/link'
import { client, getProducts, getActivePromo, getBrands, getSettings, getLightning, withPromo, urlFor } from '@/lib/sanity'
import ProductCard from '@/components/ProductCard'
import Shop from '@/components/Shop'
import Countdown from '@/components/Countdown'
import { T } from '@/lib/i18n'
import Ticker from '@/components/Ticker'
import Welcome from '@/components/Welcome'
import LightningCard from '@/components/LightningCard'
export const revalidate = 30
/** Text between asterisks is set in the italic accent colour. Older saved titles without asterisks get "Opor!" (or the last word) accented automatically. */
const accent = (text: string) => text.includes('*') ? text : /Opor!/.test(text) ? text.replace('Opor!', '*Opor!*') : text.replace(/(\S+)$/, '*$1*')
const Headline = ({ text }: { text: string }) => <>{accent(text).split('*').map((x, i) => (i % 2 ? <em key={i}>{x}</em> : x))}</>
export default async function Home() {
  const [products, promo, brands, s, deal] = await Promise.all([getProducts(), getActivePromo(), getBrands(), getSettings(), getLightning()])
  const list = withPromo(products, promo)
  const server = !!s?.features?.serverSearch
  const facets = server ? await client.fetch(`{"cats": array::unique(*[_type=="product" && active!=false && defined(category)].category), "brands": array::unique(*[_type=="product" && active!=false && defined(brand)].brand->name)}`) : undefined
  const onSale = list.filter((p: any) => p.promoUnitPrice || p.promoDozenPrice)
  const welcome = list.slice(0, 24).map((p: any) => ({ slug: p.slug, name: p.name, nameZh: p.nameZh, nameFr: p.nameFr, price: p.promoUnitPrice ?? p.unitPrice, sale: !!p.promoUnitPrice, img: urlFor(p.images[0]).width(420).height(420).url() }))
  const dealProp = deal && { id: deal._id, title: deal.title, price: deal.dealPrice, endsAt: deal.endsAt, left: deal.left, hold: deal.holdMinutes || 5, product: { name: deal.product.name, slug: deal.product.slug, was: deal.product.unitPrice, img: urlFor(deal.product.images[0]).width(600).height(600).url() } }
  const catMap = new Map<string, any>()
  list.forEach((p: any) => { if (p.category && !catMap.has(p.category)) catMap.set(p.category, p) })
  const cats = [...catMap.entries()].slice(0, 6)
  const heroPhoto = s?.heroImage ? urlFor(s.heroImage).width(760).height(1060).url() : null
  const heroImgs = (heroPhoto ? [heroPhoto] : []).concat(list.slice(0, heroPhoto ? 1 : 2).map((p: any) => urlFor(p.images[0]).width(640).height(840).url()))
  return (<>
    <Welcome items={welcome} />
    <Ticker items={s?.tickerItems} />
    <div className="wrap">
      <section className="hero">
        <div>
          <span className="kicker"><T k="h.heroKicker" /></span>
          <h1><Headline text={s?.heroTitle || 'Factory-direct, Opor! Shikini money.'} /></h1>
          <p>{s?.heroSubtitle || <T k="h.heroSub" />}</p>
          <div className="row"><a href="#shop" className="btn"><T k="h.heroCta" /></a><Link href="/quote" className="btn ghost"><T k="h.heroCta2" /></Link></div>
          <div className="trustrow"><span><b>✓</b> <T k="h.tr1" /></span><span><b>✓</b> <T k="h.tr2" /></span><span><b>✓</b> <T k="h.tr3" /></span></div>
        </div>
        {!!heroImgs.length && <div className="hero-art">
          {heroImgs.map((src, i) => <Link key={i} href="/#shop" className={`arch${heroPhoto && i === 0 ? ' cover' : ''}`}><img src={src} alt="" /></Link>)}
          <div className="stamp"><span><T k="h.st1" /></span><b><T k="h.st2" /></b></div>
        </div>}
      </section>
      <div className="actionbar"><Link href="/quote"><T k="h.bulk" /> →</Link><Link href="/sell"><T k="h.sell" /> →</Link></div>
      {dealProp && <LightningCard deal={dealProp} />}
      {promo && (<section className="flash"><div><h2>{promo.title}</h2><div><T k="h.endsIn" /></div></div><Countdown endsAt={promo.endsAt} /></section>)}
      {!!onSale.length && <><h3 className="sec" id="sale" style={{ marginTop: 8 }}>{promo?.title || <T k="h.deals" />}</h3><div className="strip">{onSale.map((p: any) => <div key={p._id} style={{ flex: '0 0 190px' }}><ProductCard p={p} /></div>)}</div></>}
      {cats.length > 1 && <><h3 className="sec catsec"><T k="h.shopBy" /></h3><div className="cats">{cats.map(([c, p]) => (
        <Link key={c} href={`/?cat=${encodeURIComponent(c)}#shop`} className="cat"><div className="arch"><img src={urlFor(p.images[0]).width(420).height(560).url()} alt={c} loading="lazy" /></div><b>{c}</b><small><T k="h.view" /> →</small></Link>))}</div></>}
      <h3 className="sec" id="shopTop"><T k="h.allProducts" /></h3>
      <div id="shop"><Shop products={list} server={server} facets={facets} /></div>
      {!list.length && <p>Add your first product in <a href="/studio"><u>/studio</u></a>.</p>}
      <h3 className="sec"><T k="h.serve" /></h3>
      <section className="aud">
        {[[s?.wholesalerImage, 'h.whole', 'h.wholeD', '/quote', 'h.quoteCta', 'wholesale'], [s?.retailerImage, 'h.retail', 'h.retailD', '#shop', 'h.packCta', 'retail'], [s?.consumerImage, 'h.every', 'h.everyD', '#shop', 'h.shopNow', 'buyer']].map(([img, tk, dk, href, ck, kind]: any) => (
          <a key={tk} href={href} className="card aud-card">
            <div className="aud-img">{img ? <img src={urlFor(img).width(700).height(460).url()} alt="" loading="lazy" /> : <AudArt kind={kind} />}</div>
            <div className="in"><h3 style={{ margin: '0 0 6px' }}><T k={tk} /></h3><small><T k={dk} /></small><div style={{ marginTop: 10, color: 'var(--blue)', fontWeight: 700 }}><T k={ck} /> →</div></div>
          </a>))}
      </section>
      <h3 className="sec"><T k="h.howT" /></h3>
      <div className="how">{[1, 2, 3].map((n) => <div key={n}><span className="n">0{n}</span><b><T k={`h.how${n}t`} /></b><span><T k={`h.how${n}d`} /></span></div>)}</div>
      {!!brands.length && <><h3 className="sec"><T k="h.sellers" /></h3><div className="strip">{brands.map((b: any) => (
        <Link href={`/brand/${b.slug}`} className="chip" key={b.slug}>{b.logo && <img src={urlFor(b.logo).height(60).url()} height={30} alt="" />}<b>{b.name}{b.sponsored && <span className="pill" style={{ marginLeft: 6 }}><T k="h.partner" /></span>}</b><small>{b.tagline}</small></Link>))}</div></>}
    </div></>)
}
