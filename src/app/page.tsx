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
export default async function Home() {
  const [products, promo, brands, s, deal] = await Promise.all([getProducts(), getActivePromo(), getBrands(), getSettings(), getLightning()])
  const list = withPromo(products, promo)
  const server = !!s?.features?.serverSearch
  const facets = server ? await client.fetch(`{"cats": array::unique(*[_type=="product" && active!=false && defined(category)].category), "brands": array::unique(*[_type=="product" && active!=false && defined(brand)].brand->name)}`) : undefined
  const onSale = list.filter((p: any) => p.promoUnitPrice || p.promoDozenPrice)
  const welcome = list.slice(0, 24).map((p: any) => ({ slug: p.slug, name: p.name, nameZh: p.nameZh, nameFr: p.nameFr, price: p.promoUnitPrice ?? p.unitPrice, sale: !!p.promoUnitPrice, img: urlFor(p.images[0]).width(420).height(420).url() }))
  const dealProp = deal && { id: deal._id, title: deal.title, price: deal.dealPrice, endsAt: deal.endsAt, left: deal.left, hold: deal.holdMinutes || 5, product: { name: deal.product.name, slug: deal.product.slug, was: deal.product.unitPrice, img: urlFor(deal.product.images[0]).width(600).height(600).url() } }
  return (<>
    <Welcome items={welcome} />
    <Ticker items={s?.tickerItems} />
    <div className="wrap">
      <div className="actionbar"><Link href="/quote"><T k="h.bulk" /> →</Link><Link href="/sell"><T k="h.sell" /> →</Link></div>
      {dealProp && <LightningCard deal={dealProp} />}
      {promo && (<section className="flash"><div><h2>{promo.title}</h2><div><T k="h.endsIn" /></div></div><Countdown endsAt={promo.endsAt} /></section>)}
      {!!onSale.length && <><h3 className="sec" id="sale" style={{ marginTop: 8 }}>{promo?.title || <T k="h.deals" />}</h3><div className="strip">{onSale.map((p: any) => <div key={p._id} style={{ flex: '0 0 190px' }}><ProductCard p={p} /></div>)}</div></>}
      <div id="shop" style={{ marginTop: 18 }}><Shop products={list} server={server} facets={facets} /></div>
      {!list.length && <p>Add your first product in <a href="/studio"><u>/studio</u></a>.</p>}
      <h3 className="sec"><T k="h.serve" /></h3>
      <section className="aud">
        {[[s?.wholesalerImage, 'h.whole', 'h.wholeD', '/quote', 'h.quoteCta'], [s?.retailerImage, 'h.retail', 'h.retailD', '#shop', 'h.packCta'], [s?.consumerImage, 'h.every', 'h.everyD', '#shop', 'h.shopNow']].map(([img, tk, dk, href, ck]: any) => (
          <a key={tk} href={href} className="card aud-card">
            <div className="aud-img" style={img ? undefined : { background: 'linear-gradient(135deg,var(--blue),var(--green))' }}>{img && <img src={urlFor(img).width(700).height(460).url()} alt="" loading="lazy" />}</div>
            <div className="in"><h3 style={{ margin: '0 0 6px' }}><T k={tk} /></h3><small><T k={dk} /></small><div style={{ marginTop: 10, color: 'var(--blue)', fontWeight: 700 }}><T k={ck} /> →</div></div>
          </a>))}
      </section>
      {!!brands.length && <><h3 className="sec"><T k="h.sellers" /></h3><div className="strip">{brands.map((b: any) => (
        <Link href={`/brand/${b.slug}`} className="chip" key={b.slug}>{b.logo && <img src={urlFor(b.logo).height(60).url()} height={30} alt="" />}<b>{b.name}{b.sponsored && <span className="pill" style={{ marginLeft: 6 }}><T k="h.partner" /></span>}</b><small>{b.tagline}</small></Link>))}</div></>}
    </div></>)
}
