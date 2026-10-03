import { writeClient } from './sanity'
/** What each seller is owed on an order: their sales minus your commission. Tracked in Studio; you pay them out. */
export async function computePayouts(items: any[]) {
  const ps: any[] = await writeClient.fetch(`*[_type=="product" && _id in $ids]{_id,"b":brand->{_id,name,commissionPercent}}`, { ids: items.map((i) => i.productId) })
  const by = new Map<string, any>()
  for (const i of items) {
    const b = ps.find((p) => p._id === i.productId)?.b
    if (!b) continue
    const m = by.get(b._id) || { _key: b._id, seller: b.name, sales: 0, pct: b.commissionPercent || 0, paid: false }
    m.sales += i.price * i.quantity; by.set(b._id, m)
  }
  return [...by.values()].map(({ pct, ...m }) => { const sales = Math.round(m.sales), commission = Math.round((sales * pct) / 100); return { ...m, sales, commission, payable: sales - commission } })
}
