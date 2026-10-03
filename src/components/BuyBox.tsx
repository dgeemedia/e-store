'use client'
import { useState } from 'react'
import { useCart, naira } from '@/lib/cart'
import { linePrice, tierUnit } from '@/lib/tiers'
export default function BuyBox({ p, image }: { p: any; image: string }) {
  const { add } = useCart()
  const pack = p.packSize || 12, label = p.packLabel || 'dozen'
  const unit = p.promoUnitPrice ?? p.unitPrice, dozen = p.promoDozenPrice ?? p.dozenPrice
  const [mode, setMode] = useState<'unit' | 'dozen'>('unit'), [qty, setQty] = useState(1), [done, setDone] = useState(false)
  const units = mode === 'dozen' ? qty * pack : qty
  const lp = (m: 'unit' | 'dozen') => linePrice(m, unit, dozen, p.tiers, units, pack) ?? (m === 'dozen' ? dozen : unit)
  const price = lp(mode)
  const tiers = [...(p.tiers || [])].sort((a: any, b: any) => a.minUnits - b.minUnits)
  const next = tiers.find((t: any) => t.minUnits > units && t.unitPrice < (mode === 'dozen' ? price / pack : price))
  const out = p.stockUnits === 0
  const [sel, setSel] = useState<Record<string, string>>({})
  const missing = (p.options || []).find((g: any) => !sel[g.name])
  return (<div>
    <div className="opt">
      <label className={mode === 'unit' ? 'on' : ''} onClick={() => setMode('unit')}><b>Per unit</b><br />{naira(lp('unit'))}</label>
      {dozen && <label className={mode === 'dozen' ? 'on' : ''} onClick={() => setMode('dozen')}><b>Per {label} ({pack})</b><br />{naira(lp('dozen'))}<br /><small>{naira(lp('dozen') / pack)} each</small></label>}
    </div>
    {!!tiers.length && <div className="ladder"><b>The more you buy, the cheaper you pay</b>{tiers.map((t: any) => (
      <div key={t.minUnits} className={tierUnit(p.tiers, units) === t.unitPrice ? 'hit' : ''}><span>{t.minUnits}+ units</span><b>{naira(t.unitPrice)} each</b></div>))}</div>}
    {(p.options || []).map((g: any) => (<div key={g.name} style={{ margin: '12px 0' }}><b>{g.name}</b><div className="row" style={{ marginTop: 6 }}>{g.values.map((v: string) => <button key={v} type="button" className={`btn ${sel[g.name] === v ? '' : 'ghost'}`} style={{ padding: '8px 16px' }} onClick={() => setSel({ ...sel, [g.name]: v })}>{v}</button>)}</div></div>))}
    <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} style={{ width: 100 }} />
    <p className="price">Total: {naira(price * qty)}</p>
    {next && <p style={{ color: 'var(--deep)', fontWeight: 700 }}>Add {next.minUnits - units} more unit{next.minUnits - units > 1 ? 's' : ''} and pay {naira(next.unitPrice)} each </p>}
    <button className="btn" disabled={out || !!missing} onClick={() => { add({ productId: p._id, name: p.name, mode, quantity: qty, image, unit, dozen, tiers: p.tiers, pack, packLabel: label, sel, kg: p.weightKg }); setDone(true) }}>{out ? 'Sold out' : missing ? `Choose ${missing.name}` : 'Add to cart'}</button>
    {done && <p><a href="/cart"><u>Added — view cart →</u></a></p>}
    <p className="trust">{p.dispatchTime || 'Ships in 2-3 days'}{p.warrantyMonths ? ` · ${p.warrantyMonths}-month warranty` : ''} · Factory-direct{p.brand?.sponsored ? ' · Partner' : ''}</p>
  </div>)
}
