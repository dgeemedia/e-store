'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart, naira } from '@/lib/cart'
import { deliveryFee } from '@/lib/shipping'
export default function CartClient({ fees }: { fees: any }) {
  const { lines, setQty, subtotal, clear } = useCart()
  const [f, setF] = useState<any>({ delivery: 'delivery' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ status: string; ref: string } | null>(null)
  const [cp, setCp] = useState<any>(null), [code, setCode] = useState(''), [cErr, setCErr] = useState('')
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (q.get('paid')) { const st = q.get('status') || ''; setRes({ status: st, ref: q.get('tx_ref') || '' }); if (st === 'successful' || st === 'completed') clear() }
  }, [])
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const pickup = f.delivery === 'pickup'
  const kg = lines.reduce((s: number, l: any) => s + (l.kg || 0) * (l.mode === 'dozen' ? l.quantity * (l.pack || 12) : l.quantity), 0)
  const fee = pickup ? 0 : f.state ? deliveryFee({ deliveryFeeLagos: fees.lagos, deliveryFeeOther: fees.other, perKgLagos: fees.perKgLagos, perKgOther: fees.perKgOther, freeDeliveryAbove: fees.free }, f.state, false, subtotal, kg) : null
  const disc = Math.min(cp?.discount || 0, subtotal)
  const big = subtotal > fees.threshold
  async function applyCoupon() {
    setCErr(''); const r = await fetch('/api/coupon', { method: 'POST', body: JSON.stringify({ code, subtotal }) }), d = await r.json()
    if (r.ok) setCp(d); else { setCp(null); setCErr(d.error || 'Invalid code') }
  }
  async function pay() {
    const digits = (f.phone || '').replace(/\D/g, '')
    if (!f.name?.trim()) return setErr('Please enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email || '')) return setErr('Please enter a valid email address.')
    if (digits.length < 10) return setErr('Please enter a valid phone number.')
    if (!pickup && (!f.address?.trim() || !f.state?.trim())) return setErr('Please enter your delivery address and state.')
    setBusy(true); setErr('')
    const r = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ ...f, coupon: cp?.code, lines: lines.map((l: any) => ({ productId: l.productId, mode: l.mode, quantity: l.quantity, sel: l.sel })) }) })
    const d = await r.json().catch(() => ({}))
    if (d.link) location.href = d.link; else { setErr(d.error || 'Something went wrong. Please try again.'); setBusy(false) }
  }
  if (res) {
    const ok = res.status === 'successful' || res.status === 'completed'
    return (<div className="wrap" style={{ padding: '60px 20px', maxWidth: 560 }}>
      <h1>{ok ? 'Thank you! ' : res.status === 'cancelled' ? 'Payment cancelled' : 'We are confirming your payment'}</h1>
      <p>{ok ? "Your payment was received and we're confirming it now. A confirmation email is on its way." : res.status === 'cancelled' ? 'No money was taken. Your cart is saved.' : 'This can take a minute. Check your email, or track the order below.'}</p>
      {res.ref && <p>Your order reference: <b>{res.ref}</b><br /><small>Keep this to track your order with the phone number you used.</small></p>}
      <div className="row"><Link href="/track" className="btn">Track my order</Link><Link href="/" className="btn ghost">Keep shopping</Link></div>
    </div>)
  }
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 760 }}><h1>Your cart</h1>
    {!lines.length && <p>Your cart is empty. <Link href="/#shop"><u>Start shopping</u></Link></p>}
    {lines.map((l: any, i: number) => (<div className="line" key={i}>{l.image && <img src={l.image} alt="" />}
      <div className="g"><b>{l.name}</b>{l.sel && <small> · {Object.values(l.sel).join(" / ")}</small>}<br /><small>{l.mode === 'dozen' ? `Per ${l.packLabel || 'dozen'}` : 'Per unit'} · {naira(l.price)}</small></div>
      <input className="q" type="number" min={0} value={l.quantity} onChange={(e) => setQty(i, +e.target.value)} aria-label="Quantity" /><b>{naira(l.price * l.quantity)}</b></div>))}
    {!!lines.length && <>
      <div className="f"><input placeholder="Full name" autoComplete="name" onChange={set('name')} /><input placeholder="Email" type="email" autoComplete="email" onChange={set('email')} /><input placeholder="Phone number" type="tel" autoComplete="tel" onChange={set('phone')} />
        <select onChange={set('delivery')}><option value="delivery">Deliver to me</option><option value="pickup">I'll pick up</option></select>
        {!pickup && <><input placeholder="Delivery address" autoComplete="street-address" onChange={set('address')} /><input placeholder="State (e.g. Lagos)" onChange={set('state')} /></>}</div>
      <div className="row" style={{ marginTop: 0 }}><input placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 1 }} /><button className="btn ghost" onClick={applyCoupon}>Apply</button></div>{cErr && <p className="err">{cErr}</p>}
      <div className="sum"><div><span>Subtotal</span><b>{naira(subtotal)}</b></div>{disc > 0 && <div><span>Discount ({cp.code})</span><b>-{naira(disc)}</b></div>}
        <div><span>Delivery</span><b>{pickup ? 'Free (pickup)' : fee == null ? 'Enter your state' : naira(fee)}</b></div>
        <div className="tot"><span>Total</span><b>{fee == null ? naira(subtotal - disc) + ' + delivery' : naira(subtotal - disc + fee)}</b></div></div>
      {big ? <p className="err">This is a large order. Please <Link href="/quote"><u>request a bulk / truckload quote</u></Link> for the best price and truck delivery.</p>
        : <>{err && <p className="err">{err}</p>}<button className="btn green" style={{ width: '100%', padding: 16, fontSize: 17 }} disabled={busy} onClick={pay}>{busy ? 'Please wait…' : `Pay ${fee == null ? naira(subtotal - disc) : naira(subtotal - disc + fee)} securely`}</button>
          <p className="trust">Secure payment by Flutterwave (card, bank transfer, USSD). We never see your card details.</p></>}
    </>}
  </div>)
}
