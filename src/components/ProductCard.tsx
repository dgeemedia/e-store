import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { naira } from '@/lib/cart'
import QuickAdd from './QuickAdd'
export default function ProductCard({ p }: { p: any }) {
  const sale = p.promoUnitPrice, price = sale ?? p.unitPrice, out = p.stockUnits === 0
  const off = sale ? Math.round((1 - sale / p.unitPrice) * 100) : 0
  const pack = p.promoDozenPrice ?? p.dozenPrice
  const sold = p.soldUnits > 0 ? `${p.soldUnits.toLocaleString('en-NG')} sold` : ''
  return (
    <div className="card pc">
      <Link href={`/product/${p.slug}`} className="pc-link">
        {sale && <span className="tag">{p.promoBadge || 'FLASH SALE'}</span>}
        <img src={urlFor(p.images[0]).width(420).height(420).url()} alt={p.name} loading="lazy" style={out ? { opacity: 0.5 } : {}} />
        <div className="in">
          <div className="pc-name">{p.name}</div>
          <div className="price">{naira(price)}{sale && <span className="was">{naira(p.unitPrice)}</span>}{off > 0 && <span className="off">-{off}%</span>}</div>
          {(p.rating || sold) && <div className="pc-meta">{p.rating ? <><span style={{ color: '#e6a100' }}>★</span> {p.rating.toFixed(1)} ({p.reviewCount})</> : null}{p.rating && sold ? ' · ' : ''}{sold}</div>}
          {pack && <div className="pc-meta">{(p.packLabel || 'Dozen').replace(/^./, (c: string) => c.toUpperCase())}: {naira(pack)}</div>}
          {!!p.tiers?.length && <div className="pill">Buy more, from {naira(Math.min(...p.tiers.map((t: any) => t.unitPrice)))} each</div>}
          {p.warrantyMonths && <div className="pill g">{p.warrantyMonths}-mo warranty</div>}
          {out && <div className="err">Sold out</div>}
        </div>
      </Link>
      {!out && <QuickAdd image={urlFor(p.images[0]).width(120).height(120).url()} i={{ _id: p._id, name: p.name, slug: p.slug, hasOptions: !!p.options?.length, unit: price, dozen: pack, tiers: p.tiers, pack: p.packSize || 12, packLabel: p.packLabel || 'dozen', kg: p.weightKg }} />}
    </div>
  )
}
