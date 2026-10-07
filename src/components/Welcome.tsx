'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { naira } from '@/lib/cart'
import { useLang, loc } from '@/lib/i18n'
const SLOGANS = ['s.1', 's.2', 's.3', 's.4']
/** First-visit screen: a random mix of products + the slogan. Different every visit. */
export default function Welcome({ items }: { items: any[] }) {
  const { t, lang } = useLang()
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
  return (<div className="welcome" role="dialog">
    <button className="wx" onClick={() => close()} aria-label={t('w.close')}>×</button>
    <div className="wgrid">{list.map((p, i) => p.slogan ? <div key={i} className="wslogan">{t(p.slogan)}</div> : (
      <Link key={i} href={`/product/${p.slug}`} className="wcard" onClick={done}>
        {p.sale && <span className="tag">{t('w.sale')}</span>}<img src={p.img} alt={loc(p, 'name', lang)} /><b>{loc(p, 'name', lang)}</b><span>{naira(p.price)}</span>
      </Link>))}</div>
    <button className="btn green wshop" onClick={() => close(true)}>{t('w.shop')}</button>
  </div>)
}
