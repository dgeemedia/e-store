'use client'
import { useState } from 'react'
export default function Quote() {
  const [f, setF] = useState<any>({}), [state, setState] = useState<'idle' | 'busy' | 'done'>('idle'), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function send() {
    setState('busy'); setErr('')
    const r = await fetch('/api/quote', { method: 'POST', body: JSON.stringify(f) }), d = await r.json()
    if (d.ok) setState('done'); else { setErr(d.error || 'Failed, try again'); setState('idle') }
  }
  if (state === 'done') return <div className="wrap" style={{ padding: 60 }}><h1>Request received </h1><p>We'll reply with your best factory price and delivery plan shortly.</p></div>
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 640 }}>
    <h1 style={{ letterSpacing: '-.03em' }}>Bulk &amp; truckload orders</h1>
    <p style={{ color: 'var(--mute)' }}>Wholesalers, retailers, projects and institutions: tell us what you need and get our best factory price. Large orders come with a factory invoice, full delivery documents and truck delivery.</p>
    <div className="f"><input placeholder="Your name *" onChange={set('name')} /><input placeholder="Company / shop" onChange={set('company')} /><input placeholder="Phone / WhatsApp *" onChange={set('phone')} /><input placeholder="Email" onChange={set('email')} /><input placeholder="Delivery location (city, state)" onChange={set('location')} />
      <input placeholder="What do you need? e.g. Solar street lights, 200 units *" onChange={set('items')} /><input placeholder="Vehicle needed, if you know (van, bus, truck, trailer)" onChange={set('vehicle')} /><input placeholder="Quantity / budget" onChange={set('quantity')} /><input placeholder="Anything else?" onChange={set('notes')} />
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} /></div>
    {err && <p className="err">{err}</p>}<button className="btn green" disabled={state === 'busy'} onClick={send}>{state === 'busy' ? 'Sending…' : 'Request my quote'}</button>
  </div>)
}
