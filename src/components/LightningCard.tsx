'use client'
import { useState } from 'react'
import { naira } from '@/lib/cart'
import Countdown from './Countdown'
export default function LightningCard({ deal }: { deal: any }) {
  const [claim, setClaim] = useState<any>(null), [f, setF] = useState<any>({ delivery: 'delivery' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [left, setLeft] = useState(deal.left)
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const post = (body: any) => fetch('/api/lightning', { method: 'POST', body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, d: await r.json().catch(() => ({})) }))
  async function grab() {
    setBusy(true); setErr('')
    const { ok, d } = await post({ action: 'claim', dealId: deal.id })
    if (ok) { setClaim(d); setLeft((l: number) => Math.max(0, l - 1)) } else { setErr(d.error || 'Sorry, someone was faster.'); if (/sold out|gone/i.test(d.error || '')) setLeft(0) }
    setBusy(false)
  }
  async function pay() {
    if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email || '') || (f.phone || '').replace(/\D/g, '').length < 10 || (f.delivery !== 'pickup' && (!f.address || !f.state))) return setErr('Please complete all the fields.')
    setBusy(true); setErr('')
    const { ok, d } = await post({ action: 'pay', claimId: claim.claimId, token: claim.token, ...f })
    if (ok && d.link) location.href = d.link; else { setErr(d.error || 'Could not start payment.'); setBusy(false) }
  }
  return (<section className="lightning">
    <img src={deal.product.img} alt={deal.product.name} />
    <div>
      <span className="tag" style={{ position: 'static' }}>LIGHTNING DEAL</span>
      <h2 style={{ margin: '8px 0 4px' }}>{deal.title}</h2><div>{deal.product.name}</div>
      <div className="price" style={{ fontSize: 30 }}>{naira(deal.price)}<span className="was">{naira(deal.product.was)}</span></div>
      <div style={{ margin: '6px 0' }}>Ends in <Countdown endsAt={deal.endsAt} /> · <b>{left} left</b></div>
      {!claim ? (<><button className="btn green" disabled={busy || left < 1} onClick={grab}>{left < 1 ? 'Sold out' : busy ? 'Grabbing…' : 'Grab it now'}</button>{err && <p className="err">{err}</p>}</>) : (<div>
        <p style={{ fontWeight: 800, color: 'var(--deep)' }}>It's yours! Pay in <Countdown endsAt={claim.expiresAt} /> or it goes to the next person.</p>
        <div className="f"><input placeholder="Full name" onChange={set('name')} /><input placeholder="Email" type="email" onChange={set('email')} /><input placeholder="Phone" type="tel" onChange={set('phone')} />
          <select onChange={set('delivery')}><option value="delivery">Deliver to me</option><option value="pickup">I'll pick up</option></select>
          {f.delivery !== 'pickup' && <><input placeholder="Delivery address" onChange={set('address')} /><input placeholder="State" onChange={set('state')} /></>}</div>
        {err && <p className="err">{err}</p>}<button className="btn green" disabled={busy} onClick={pay}>{busy ? 'Please wait…' : `Pay ${naira(deal.price)} now (+ delivery)`}</button>
        <p className="trust">Your promo code and item will be on your payment receipt and email.</p></div>)}
    </div></section>)
}
