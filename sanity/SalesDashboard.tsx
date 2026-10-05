import { useEffect, useState } from 'react'
import { useClient } from 'sanity'
const n = (x: number) => '₦' + Math.round(x || 0).toLocaleString('en-NG')
export function SalesDashboard() {
  const client = useClient({ apiVersion: '2024-10-01' })
  const [d, setD] = useState<any>(null)
  useEffect(() => {
    const since = new Date(Date.now() - 30 * 864e5).toISOString()
    Promise.all([
      client.fetch(`*[_type=="order" && status in ["paid","shipped","delivered"] && createdAt>=$s]{total,createdAt,items}`, { s: since }),
      client.fetch(`*[_type=="product" && defined(stockUnits) && stockUnits<=10]{name,stockUnits} | order(stockUnits asc)`),
      client.fetch(`*[_type=="order" && status in ["paid","shipped","delivered"]].payouts[paid!=true]`),
    ]).then(([orders, low, owed]: any[]) => {
      const day: Record<string, number> = {}, top: Record<string, number> = {}, own: Record<string, number> = {}
      orders.forEach((o: any) => { const k = (o.createdAt || '').slice(0, 10); day[k] = (day[k] || 0) + o.total; (o.items || []).forEach((i: any) => (top[i.productName] = (top[i.productName] || 0) + i.units)) })
      ;(owed || []).forEach((p: any) => (own[p.seller] = (own[p.seller] || 0) + p.payable))
      setD({ revenue: orders.reduce((s: number, o: any) => s + o.total, 0), count: orders.length, day: Object.entries(day).sort().reverse().slice(0, 14), top: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 8), low, own: Object.entries(own) })
    })
  }, [])
  const box = { background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: 16, margin: '0 0 16px', color: '#111' } as const
  if (!d) return <div style={{ padding: 24 }}>Loading sales…</div>
  return (<div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'sans-serif' }}>
    <h1>Sales (last 30 days)</h1>
    <div style={box}><b style={{ fontSize: 28 }}>{n(d.revenue)}</b> from {d.count} paid orders</div>
    <div style={box}><h3>Daily sales (latest 14 days)</h3>{d.day.map(([k, v]: any) => <div key={k}>{k}: <b>{n(v)}</b></div>)}</div>
    <div style={box}><h3>Best sellers (units)</h3>{d.top.map(([k, v]: any) => <div key={k}>{k}: <b>{v}</b></div>)}</div>
    <div style={box}><h3>⚠️ Low stock</h3>{d.low.length ? d.low.map((p: any) => <div key={p.name}>{p.name}: <b>{p.stockUnits}</b> left</div>) : 'All good.'}</div>
    <div style={box}><h3>💸 Owed to sellers (pay BEFORE collecting goods)</h3>{d.own.length ? d.own.map(([k, v]: any) => <div key={k}>{k}: <b>{n(v)}</b></div>) : 'Nothing owed.'}<br /><small>Pay each seller, then open the order and tick "Paid to seller?". Collect goods only after the seller confirms payment.</small></div>
  </div>)
}
