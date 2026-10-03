import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { naira } from '@/lib/cart'
/** Products glide across the hero; pauses and pops on hover/touch. */
export default function HeroRail({ products }: { products: any[] }) {
  let items = products.slice(0, 12)
  if (!items.length) return null
  while (items.length < 8) items = [...items, ...items]
  return (<div className="rail"><div className="rail-track">
    {[0, 1].map((k) => <div key={k} className="rail-row" aria-hidden={k === 1}>{items.map((p, i) => (
      <Link key={i} href={`/product/${p.slug}`} className="rail-card" tabIndex={k ? -1 : 0}>
        {p.promoUnitPrice && <span className="tag">SALE</span>}
        <img src={urlFor(p.images[0]).width(380).height(380).url()} alt={p.name} loading="lazy" />
        <b>{p.name}</b><span>{naira(p.promoUnitPrice ?? p.unitPrice)}</span>
      </Link>))}</div>)}
  </div></div>)
}
