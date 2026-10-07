'use client'
import { useState } from 'react'
import { useCart, naira } from '@/lib/cart'
import { linePrice, tierUnit } from '@/lib/tiers'
import { useLang } from '@/lib/i18n'
export default function BuyBox({ p, image }: { p: any; image: string }) {
  const { add } = useCart(), { t, tr } = useLang()
  const pack = p.packSize || 12, label = p.packLabel || 'dozen', labelT = tr('pack.', label)
  const unit = p.promoUnitPrice ?? p.unitPrice, dozen = p.promoDozenPrice ?? p.dozenPrice
  const [mode, setMode] = useState<'unit' | 'dozen'>('unit'), [qty, setQty] = useState(1), [done, setDone] = useState(false)
  const units = mode === 'dozen' ? qty * pack : qty
  const lp = (m: 'unit' | 'dozen') => linePrice(m, unit, dozen, p.tiers, units, pack) ?? (m === 'dozen' ? dozen : unit)
  const price = lp(mode)
  const tiers = [...(p.tiers || [])].sort((a: any, b: any) => a.minUnits - b.minUnits)
  const next = tiers.find((x: any) => x.minUnits > units && x.unitPrice < (mode === 'dozen' ? price / pack : price))
  const out = p.stockUnits === 0
  const [sel, setSel] = useState<Record<string, string>>({})
  const missing = (p.options || []).find((g: any) => !sel[g.name])
  return (<div>
    <div className="opt">
      <label className={mode === 'unit' ? 'on' : ''} onClick={() => setMode('unit')}><b>{t('b.unit')}</b><br />{naira(lp('unit'))}</label>
      {dozen && <label className={mode === 'dozen' ? 'on' : ''} onClick={() => setMode('dozen')}><b>{t('b.per', { label: labelT, n: pack })}</b><br />{naira(lp('dozen'))}<br /><small>{naira(lp('dozen') / pack)} {t('b.each')}</small></label>}
    </div>
    {!!tiers.length && <div className="ladder"><b>{t('b.ladder')}</b>{tiers.map((x: any) => (
      <div key={x.minUnits} className={tierUnit(p.tiers, units) === x.unitPrice ? 'hit' : ''}><span>{t('b.units', { n: x.minUnits })}</span><b>{t('b.eachPrice', { price: naira(x.unitPrice) })}</b></div>))}</div>}
    {(p.options || []).map((g: any) => (<div key={g.name} style={{ margin: '12px 0' }}><b>{g.name}</b><div className="row" style={{ marginTop: 6 }}>{g.values.map((v: string) => <button key={v} type="button" className={`btn ${sel[g.name] === v ? '' : 'ghost'}`} style={{ padding: '8px 16px' }} onClick={() => setSel({ ...sel, [g.name]: v })}>{v}</button>)}</div></div>))}
    <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} style={{ width: 100 }} />
    <p className="price">{t('b.total')}: {naira(price * qty)}</p>
    {next && <p style={{ color: 'var(--deep)', fontWeight: 700 }}>{t('b.next', { n: next.minUnits - units, price: naira(next.unitPrice) })}</p>}
    <button className="btn" disabled={out || !!missing} onClick={() => { add({ productId: p._id, name: p.name, mode, quantity: qty, image, unit, dozen, tiers: p.tiers, pack, packLabel: label, sel, kg: p.weightKg }); setDone(true) }}>{out ? t('p.soldOut') : missing ? t('b.choose', { name: missing.name }) : t('b.add')}</button>
    {done && <p><a href="/cart"><u>{t('b.added')}</u></a></p>}
    <p className="trust">{tr('ship.', p.dispatchTime || 'Ships in 2-3 days')}{p.warrantyMonths ? ` · ${t('b.mo', { n: p.warrantyMonths })}` : ''} · {t('b.factory')}{p.brand?.sponsored ? ` · ${t('h.partner')}` : ''}</p>
  </div>)
}
