'use client'
import { useEffect, useMemo, useState } from 'react'
import ProductCard from './ProductCard'
const price = (p: any) => p.promoUnitPrice ?? p.unitPrice
export default function Shop({ products }: { products: any[] }) {
  const [q, setQ] = useState(''), [cat, setCat] = useState('All'), [brand, setBrand] = useState('All'), [sort, setSort] = useState('featured'), [shown, setShown] = useState(24)
  useEffect(() => { const q = new URLSearchParams(location.search).get('q'); if (q) setQ(q) }, [])
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[]
  const brands = [...new Set(products.map((p) => p.brand?.name).filter(Boolean))] as string[]
  const list = useMemo(() => {
    const t = q.toLowerCase()
    const r = products.filter((p) => (cat === 'All' || p.category === cat) && (brand === 'All' || p.brand?.name === brand) && `${p.name} ${p.brand?.name} ${p.category}`.toLowerCase().includes(t))
    return sort === 'low' ? [...r].sort((a, b) => price(a) - price(b)) : sort === 'high' ? [...r].sort((a, b) => price(b) - price(a)) : r
  }, [products, q, cat, brand, sort])
  const Item = ({ label, on, n, set }: any) => <li><button className={on ? 'on' : ''} onClick={set}>{label} <small>({n})</small></button></li>
  return (<div className="mkt">
    <aside className="side">
      <input placeholder="Search products or sellers…" value={q} onChange={(e) => setQ(e.target.value)} />
      <h4>Categories</h4><ul><Item label="All" n={products.length} on={cat === 'All'} set={() => setCat('All')} />
        {cats.map((c) => <Item key={c} label={c} n={products.filter((p) => p.category === c).length} on={cat === c} set={() => setCat(c)} />)}</ul>
      <h4>Sellers</h4><ul><Item label="All" n={products.length} on={brand === 'All'} set={() => setBrand('All')} />
        {brands.map((b) => <Item key={b} label={b} n={products.filter((p) => p.brand?.name === b).length} on={brand === b} set={() => setBrand(b)} />)}</ul>
      <h4>Sort by</h4><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
    </aside>
    <div><small style={{ color: 'var(--mute)' }}>{list.length} product{list.length === 1 ? '' : 's'}</small>
      <div className="grid" style={{ marginTop: 10 }}>{list.slice(0, shown).map((p) => <ProductCard key={p._id} p={p} />)}</div>
      {list.length > shown && <div style={{ textAlign: 'center', margin: 20 }}><button className="btn ghost" onClick={() => setShown(shown + 24)}>Load more ({list.length - shown} left)</button></div>}
      {!list.length && <p>Nothing matched. Try another category or word.</p>}</div>
  </div>)
}
