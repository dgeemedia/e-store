'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { naira } from '@/lib/cart'
const SLOGANS = ['FACTORY-DIRECT, OPOR!', 'SHIKINI MONEY. BUY MORE, PAY LESS.', 'EVERY PRODUCT. EVERY SELLER.', 'BULK ORDERS WELCOME']
/** First-visit screen: a random mix of products + the slogan. Different every visit. */
export default function Welcome({ items }: { items: any[] }) {
  const [list, setList] = useState<any[] | null>(null)
  useEffect(() => {
    if (!items.length || sessionStorage.getItem('elorge-welcome')) return
    const a: any[] = [...items].sort(() => Math.random() - 0.5).slice(0, 6)
    a.splice(1 + Math.floor(Math.random() * Math.min(5, a.length)), 0, { slogan: SLOGANS[Math.floor(Math.random() * SLOGANS.length)] })
    setList(a)
  }, [])
  if (!list) return null
  const done = () => sessionStorage.setItem('elorge-welcome', '1')
  const close = (go?: boolean) => { done(); setList(null); if (go) setTimeout(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }), 50) }
  return (<div className="welcome" role="dialog" aria-label="Featured products">
    <button className="wx" onClick={() => close()} aria-label="Close">×</button>
    <div className="wgrid">{list.map((p, i) => p.slogan ? <div key={i} className="wslogan">{p.slogan}</div> : (
      <Link key={i} href={`/product/${p.slug}`} className="wcard" onClick={done}>
        {p.sale && <span className="tag">SALE</span>}<img src={p.img} alt={p.name} /><b>{p.name}</b><span>{naira(p.price)}</span>
      </Link>))}</div>
    <button className="btn green wshop" onClick={() => close(true)}>Shop now</button>
  </div>)
}
