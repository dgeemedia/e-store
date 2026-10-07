'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard'
import { useLang } from '@/lib/i18n'
const price = (p: any) => p.promoUnitPrice ?? p.unitPrice
/** Local mode filters the products already loaded. Server mode (switch in Studio) searches and pages through the API, so it scales past 300 products. */
export default function Shop({ products, server, facets }: { products: any[]; server?: boolean; facets?: { cats: string[]; brands: string[] } }) {
  const [q, setQ] = useState(''), [cat, setCat] = useState('All'), [brand, setBrand] = useState('All'), [sort, setSort] = useState('featured'), [shown, setShown] = useState(24)
  const [rows, setRows] = useState<any[]>(products), [total, setTotal] = useState(products.length), [page, setPage] = useState(0), [busy, setBusy] = useState(false)
  const first = useRef(true), { t, tr } = useLang()
  useEffect(() => { const q0 = new URLSearchParams(location.search).get('q'); if (q0) setQ(q0) }, [])
  const cats = server ? facets?.cats || [] : ([...new Set(products.map((p) => p.category).filter(Boolean))] as string[])
  const brands = server ? facets?.brands || [] : ([...new Set(products.map((p) => p.brand?.name).filter(Boolean))] as string[])
  async function load(p: number) {
    setBusy(true)
    const qs = new URLSearchParams({ q, cat: cat === 'All' ? '' : cat, brand: brand === 'All' ? '' : brand, sort, page: String(p) })
    const r = await fetch(`/api/products?${qs}`).then((x) => x.json()).catch(() => null)
    setBusy(false); if (!r?.items) return
    setRows((cur) => (p === 0 ? r.items : [...cur, ...r.items])); setTotal(r.total); setPage(p)
  }
  useEffect(() => { if (!server) return; if (first.current) { first.current = false; return } const t = setTimeout(() => load(0), 300); return () => clearTimeout(t) }, [q, cat, brand, sort, server])
  const local = useMemo(() => {
    const t = q.toLowerCase()
    const r = products.filter((p) => (cat === 'All' || p.category === cat) && (brand === 'All' || p.brand?.name === brand) && `${p.name} ${p.nameZh || ''} ${p.nameFr || ''} ${p.brand?.name} ${p.category}`.toLowerCase().includes(t))
    return sort === 'low' ? [...r].sort((a, b) => price(a) - price(b)) : sort === 'high' ? [...r].sort((a, b) => price(b) - price(a)) : r
  }, [products, q, cat, brand, sort])
  const list = server ? rows : local, count = server ? total : local.length
  const Item = ({ label, on, n, set }: any) => <li><button className={on ? 'on' : ''} onClick={set}>{label} {n != null && <small>({n})</small>}</button></li>
  return (<div className="mkt">
    <aside className="side">
      <input placeholder={t('nav.searchPh')} value={q} onChange={(e) => setQ(e.target.value)} />
      <h4>{t('s.cats')}</h4><ul><Item label={t('s.all')} n={server ? null : products.length} on={cat === 'All'} set={() => setCat('All')} />
        {cats.map((c) => <Item key={c} label={tr('cat.', c)} n={server ? null : products.filter((p) => p.category === c).length} on={cat === c} set={() => setCat(c)} />)}</ul>
      <h4>{t('s.sellers')}</h4><ul><Item label={t('s.all')} n={server ? null : products.length} on={brand === 'All'} set={() => setBrand('All')} />
        {brands.map((b) => <Item key={b} label={b} n={server ? null : products.filter((p) => p.brand?.name === b).length} on={brand === b} set={() => setBrand(b)} />)}</ul>
      <h4>{t('s.sort')}</h4><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">{t('s.featured')}</option><option value="low">{t('s.low')}</option><option value="high">{t('s.high')}</option></select>
    </aside>
    <div><small style={{ color: 'var(--mute)' }}>{t(count === 1 ? 's.product1' : 's.products', { n: count })}{busy && ` · ${t('s.loading')}`}</small>
      <div className="grid" style={{ marginTop: 10 }}>{(server ? list : list.slice(0, shown)).map((p) => <ProductCard key={p._id} p={p} />)}</div>
      {server ? (rows.length < total && <div style={{ textAlign: 'center', margin: 20 }}><button className="btn ghost" disabled={busy} onClick={() => load(page + 1)}>{t('s.more', { n: total - rows.length })}</button></div>)
        : (list.length > shown && <div style={{ textAlign: 'center', margin: 20 }}><button className="btn ghost" onClick={() => setShown(shown + 24)}>{t('s.more', { n: list.length - shown })}</button></div>)}
      {!list.length && !busy && <p>{t('s.none')}</p>}</div>
  </div>)
}
