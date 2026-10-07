'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart, naira } from '@/lib/cart'
import { deliveryFee, partnerQuote } from '@/lib/shipping'
import { useLang } from '@/lib/i18n'
export default function CartClient({ fees }: { fees: any }) {
  const { lines, setQty, subtotal, clear } = useCart(), { t, tr, te, lang } = useLang()
  const [f, setF] = useState<any>({ delivery: 'delivery' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ status: string; ref: string } | null>(null)
  const [cp, setCp] = useState<any>(null), [code, setCode] = useState(''), [cErr, setCErr] = useState('')
  const [wa, setWa] = useState(false), [cur, setCur] = useState('NGN'), [country, setCountry] = useState('Nigeria'), [partnerId, setPartnerId] = useState(''), [saved, setSaved] = useState<any[]>([])
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (q.get('paid')) { const st = q.get('status') || ''; setRes({ status: st, ref: q.get('tx_ref') || '' }); if (st === 'successful' || st === 'completed') clear() }
  }, [])
  useEffect(() => { fetch('/api/account').then((r) => (r.ok ? r.json() : null)).then((a) => { if (!a) return; setSaved(a.addresses || []); const d = a.addresses?.[0]; setF((x: any) => ({ ...x, name: x.name || a.name, email: x.email || a.email, phone: x.phone || a.phone, address: x.address || d?.address, state: x.state || d?.state })) }).catch(() => {}) }, [])
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const pickup = f.delivery === 'pickup' && country === 'Nigeria'
  const kg = lines.reduce((s: number, l: any) => s + (l.kg || 0) * (l.mode === 'dozen' ? l.quantity * (l.pack || 12) : l.quantity), 0)
  const useLogi = !!fees.logisticsOn && (fees.partners || []).length > 0 && !pickup && country === 'Nigeria'
  const quotes: any[] = useLogi && f.state ? fees.partners.map((p: any) => ({ p, q: partnerQuote(p, f.state, kg, subtotal, f.area) })).filter((x: any) => !x.q.hidden) : []
  const pid = quotes.some((x) => x.p._id === partnerId && x.q.ok) ? partnerId : quotes.find((x) => x.q.ok)?.p._id || ''
  const chosen = quotes.find((x) => x.p._id === pid)
  const fee = pickup ? 0 : useLogi ? (chosen ? chosen.q.fee : null) : f.state ? deliveryFee({ deliveryFeeLagos: fees.lagos, deliveryFeeOther: fees.other, perKgLagos: fees.perKgLagos, perKgOther: fees.perKgOther, freeDeliveryAbove: fees.free, intlRates: fees.intlRates, features: { intlDelivery: fees.intlOn } }, f.state, false, subtotal, kg, country) : null
  const disc = Math.min(cp?.discount || 0, subtotal)
  const curObj = (fees.currencies || []).find((c: any) => c.code === cur)
  const big = subtotal > fees.threshold
  async function applyCoupon() {
    setCErr(''); const r = await fetch('/api/coupon', { method: 'POST', body: JSON.stringify({ code, subtotal }) }), d = await r.json()
    if (r.ok) setCp(d); else { setCp(null); setCErr(d.error ? te(d.error) : t('c.eCode')) }
  }
  async function pay() {
    const digits = (f.phone || '').replace(/\D/g, '')
    if (!f.name?.trim()) return setErr(t('c.eName'))
    if (!/^\S+@\S+\.\S+$/.test(f.email || '')) return setErr(t('c.eEmail'))
    if (digits.length < 10) return setErr(t('c.ePhone'))
    if (!pickup && (!f.address?.trim() || !f.state?.trim())) return setErr(t('c.eAddr'))
    if (useLogi && !chosen) return setErr(t('c.eOpt'))
    setBusy(true); setErr('')
    const r = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ ...f, lang, coupon: cp?.code, whatsapp: wa, currency: cur, country, partnerId: pid, lines: lines.map((l: any) => ({ productId: l.productId, mode: l.mode, quantity: l.quantity, sel: l.sel })) }) })
    const d = await r.json().catch(() => ({}))
    if (d.link) location.href = d.link; else { setErr(d.error ? te(d.error) : t('c.eGeneric')); setBusy(false) }
  }
  if (res) {
    const ok = res.status === 'successful' || res.status === 'completed'
    return (<div className="wrap" style={{ padding: '60px 20px', maxWidth: 560 }}>
      <h1>{ok ? t('c.thanks') : res.status === 'cancelled' ? t('c.cancelled') : t('c.confirming')}</h1>
      <p>{ok ? t('c.okMsg') : res.status === 'cancelled' ? t('c.cancelMsg') : t('c.waitMsg')}</p>
      {res.ref && <p>{t('c.ref')}: <b>{res.ref}</b><br /><small>{t('c.refNote')}</small></p>}
      <div className="row"><Link href="/track" className="btn">{t('c.trackBtn')}</Link><Link href="/" className="btn ghost">{t('c.keep')}</Link></div>
    </div>)
  }
  const amt = naira((fee == null ? subtotal - disc : subtotal - disc + fee))
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 760 }}><h1>{t('c.title')}</h1>
    {!lines.length && <p>{t('c.empty')} <Link href="/#shop"><u>{t('c.start')}</u></Link></p>}
    {lines.map((l: any, i: number) => (<div className="line" key={i}>{l.image && <img src={l.image} alt="" />}
      <div className="g"><b>{l.name}</b>{l.sel && <small> · {Object.values(l.sel).join(' / ')}</small>}<br /><small>{l.mode === 'dozen' ? t('c.perPack', { label: tr('pack.', l.packLabel || 'dozen') }) : t('c.perUnit')} · {naira(l.price)}</small></div>
      <input className="q" type="number" min={0} value={l.quantity} onChange={(e) => setQty(i, +e.target.value)} aria-label="Qty" /><b>{naira(l.price * l.quantity)}</b></div>))}
    {!!lines.length && <>
      <div className="f"><input placeholder={t('c.name')} autoComplete="name" value={f.name || ''} onChange={set('name')} /><input placeholder={t('c.email')} type="email" autoComplete="email" value={f.email || ''} onChange={set('email')} /><input placeholder={t('c.phone')} type="tel" autoComplete="tel" value={f.phone || ''} onChange={set('phone')} />
        <select onChange={set('delivery')}><option value="delivery">{t('c.deliver')}</option><option value="pickup">{t('c.pickup')}</option></select>
        {!pickup && <>{fees.intlOn ? <select value={country} onChange={(e) => setCountry(e.target.value)}><option>Nigeria</option>{(fees.intlRates || []).map((r: any) => <option key={r.country}>{r.country}</option>)}</select> : <small style={{ color: 'var(--mute)' }}>{t('c.outside')}</small>}{country !== 'Nigeria' && <small style={{ color: 'var(--mute)' }}>{t('c.duties')}</small>}{saved.length > 0 && <select onChange={(e) => { const a = saved[+e.target.value]; if (a) setF({ ...f, address: a.address, state: a.state }) }}><option value="">{t('c.saved')}</option>{saved.map((a: any, i: number) => <option key={i} value={i}>{a.label || a.address}</option>)}</select>}<input placeholder={t('c.addr')} autoComplete="street-address" value={f.address || ''} onChange={set('address')} /><input placeholder={t('c.state')} value={f.state || ''} onChange={set('state')} /><input placeholder={t('c.area')} value={f.area || ''} onChange={set('area')} />{!fees.logisticsOn && country === 'Nigeria' && <small style={{ color: 'var(--mute)' }}>{t('c.partnerSoon')}</small>}</>}
        {useLogi && f.state && <div className="f"><b>{t('c.chooseRecv')}</b>{quotes.map(({ p, q }: any) => (
          <label key={p._id} className={`dopt ${pid === p._id ? 'on' : ''} ${q.ok ? '' : 'off'}`}><input type="radio" name="dp" disabled={!q.ok} checked={pid === p._id} onChange={() => setPartnerId(p._id)} style={{ width: 'auto' }} />
            <span style={{ flex: 1 }}><b>{p.name}</b>{p.vehicle && <small> ({tr('veh.', p.vehicle)})</small>}{p.kind === 'own' && <span className="pill g" style={{ marginLeft: 6 }}>{t('c.own')}</span>}<br /><small>{q.ok ? [q.zone, q.eta || p.etaText].filter(Boolean).join(' · ') : te(q.reason)}</small></span><b>{q.ok ? (q.fee ? naira(q.fee) : t('c.free')) : ''}</b></label>))}
          {!quotes.some((x) => x.q.ok) && <span className="err">{t('c.noOpt')}</span>}</div>}</div>
      {(fees.currencies || []).length > 0 && <select value={cur} onChange={(e) => setCur(e.target.value)} style={{ marginBottom: 10 }}><option value="NGN">{t('c.payNaira')}</option>{fees.currencies.map((c: any) => <option key={c.code} value={c.code}>{t('c.payIn', { cur: c.code })}</option>)}</select>}
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 10px' }}><input type="checkbox" style={{ width: 'auto' }} checked={wa} onChange={(e) => setWa(e.target.checked)} /> {t('c.wa')}</label>
      <div className="row" style={{ marginTop: 0 }}><input placeholder={t('c.code')} value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 1 }} /><button className="btn ghost" onClick={applyCoupon}>{t('c.apply')}</button></div>{cErr && <p className="err">{cErr}</p>}
      <div className="sum"><div><span>{t('c.sub')}</span><b>{naira(subtotal)}</b></div>{disc > 0 && <div><span>{t('c.disc', { code: cp.code })}</span><b>-{naira(disc)}</b></div>}
        <div><span>{t('c.delivery')}</span><b>{pickup ? t('c.freePickup') : fee == null ? t('c.enterState') : naira(fee)}</b></div>
        <div className="tot"><span>{t('c.total')}</span><b>{fee == null ? `${naira(subtotal - disc)} ${t('c.plusDelivery')}` : naira(subtotal - disc + fee)}</b></div>{curObj && fee != null && <div><span>{t('c.charged')}</span><b>{curObj.code} {((subtotal - disc + fee) / curObj.rateNgn).toFixed(2)}</b></div>}</div>
      {big ? <p className="err">{t('c.big1')}<Link href="/quote"><u>{t('c.bigLink')}</u></Link>{t('c.big2')}</p>
        : <>{err && <p className="err">{err}</p>}<button className="btn green" style={{ width: '100%', padding: 16, fontSize: 17 }} disabled={busy} onClick={pay}>{busy ? t('c.wait') : t('c.pay', { amt })}</button>
          <p className="trust">{t('c.secure')}</p></>}
    </>}
  </div>)
}
