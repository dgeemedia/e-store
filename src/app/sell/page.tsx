'use client'
import { useState } from 'react'
export default function Sell() {
  const [f, setF] = useState<any>({}), [st, setSt] = useState<'idle' | 'busy' | 'done'>('idle'), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function send() { setSt('busy'); setErr(''); const d = await (await fetch('/api/sell', { method: 'POST', body: JSON.stringify(f) })).json(); if (d.ok) setSt('done'); else { setErr(d.error || 'Failed'); setSt('idle') } }
  if (st === 'done') return <div className="wrap" style={{ padding: 60 }}><h1>Application received </h1><p>We'll call you to discuss listing your products.</p></div>
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 640 }}><h1 style={{ letterSpacing: '-.03em' }}>Sell on Elorge Store</h1>
    <p style={{ color: 'var(--mute)' }}>Manufacturers, farmers, importers, wholesalers, fashion brands and makers: if you sell it, list it here and reach buyers across Nigeria. Tell us what you sell and we'll set up your listing.</p>
    <div className="f"><input placeholder="Your name *" onChange={set('name')} /><input placeholder="Business name" onChange={set('business')} /><input placeholder="Phone / WhatsApp *" onChange={set('phone')} /><input placeholder="Email" onChange={set('email')} /><input placeholder="Location (town, state)" onChange={set('location')} />
      <input placeholder="What do you sell? e.g. solar lights, rice, ankara fabric, phones *" onChange={set('sells')} /><input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} /></div>
    {err && <p className="err">{err}</p>}<button className="btn green" disabled={st === 'busy'} onClick={send}>{st === 'busy' ? 'Sending…' : 'Apply to sell'}</button></div>)
}
