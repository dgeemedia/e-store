'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard'
const price = (p: any) => p.promoUnitPrice ?? p.unitPrice
/** Local mode filters the products already loaded. Server mode (switch in Studio) searches and pages through the API, so it scales past 300 products. */
export default function Shop({ products, server, facets }: { products: any[]; server?: boolean; facets?: { cats: string[]; brands: string[] } }) {
  const [q, setQ] = useState(''), [cat, setCat] = useState('All'), [brand, setBrand] = useState('All'), [sort, setSort] = useState('featured'), [shown, setShown] = useState(24)
  const [rows, setRows] = useState<any[]>(products), [total, setTotal] = useState(products.length), [page, setPage] = useState(0), [busy, setBusy] = useState(false)
  const first = useRef(true)
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
    const r = products.filter((p) => (cat === 'All' || p.category === cat) && (brand === 'All' || p.brand?.name === brand) && `${p.name} ${p.brand?.name} ${p.category}`.toLowerCase().includes(t))
    return sort === 'low' ? [...r].sort((a, b) => price(a) - price(b)) : sort === 'high' ? [...r].sort((a, b) => price(b) - price(a)) : r
  }, [products, q, cat, brand, sort])
  const list = server ? rows : local, count = server ? total : local.length
  const Item = ({ label, on, n, set }: any) => <li><button className={on ? 'on' : ''} onClick={set}>{label} {n != null && <small>({n})</small>}</button></li>
  return (<div className="mkt">
    <aside className="side">
      <input placeholder="Search products or sellers…" value={q} onChange={(e) => setQ(e.target.value)} />
      <h4>Categories</h4><ul><Item label="All" n={server ? null : products.length} on={cat === 'All'} set={() => setCat('All')} />
        {cats.map((c) => <Item key={c} label={c} n={server ? null : products.filter((p) => p.category === c).length} on={cat === c} set={() => setCat(c)} />)}</ul>
      <h4>Sellers</h4><ul><Item label="All" n={server ? null : products.length} on={brand === 'All'} set={() => setBrand('All')} />
        {brands.map((b) => <Item key={b} label={b} n={server ? null : products.filter((p) => p.brand?.name === b).length} on={brand === b} set={() => setBrand(b)} />)}</ul>
      <h4>Sort by</h4><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
    </aside>
    <div><small style={{ color: 'var(--mute)' }}>{count} product{count === 1 ? '' : 's'}{busy && ' · loading…'}</small>
      <div className="grid" style={{ marginTop: 10 }}>{(server ? list : list.slice(0, shown)).map((p) => <ProductCard key={p._id} p={p} />)}</div>
      {server ? (rows.length < total && <div style={{ textAlign: 'center', margin: 20 }}><button className="btn ghost" disabled={busy} onClick={() => load(page + 1)}>Load more ({total - rows.length} left)</button></div>)
        : (list.length > shown && <div style={{ textAlign: 'center', margin: 20 }}><button className="btn ghost" onClick={() => setShown(shown + 24)}>Load more ({list.length - shown} left)</button></div>)}
      {!list.length && !busy && <p>Nothing matched. Try another category or word.</p>}</div>
  </div>)
}
