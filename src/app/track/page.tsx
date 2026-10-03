'use client'
import { useState } from 'react'
const steps = ['pending', 'paid', 'shipped', 'delivered']
export default function Track() {
  const [ref, setRef] = useState(''), [phone, setPhone] = useState(''), [r, setR] = useState<any>(null)
  async function go() { setR(await (await fetch(`/api/track?ref=${encodeURIComponent(ref)}&phone=${encodeURIComponent(phone)}`)).json()) }
  const at = r?.status ? steps.indexOf(r.status) : -1
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 560 }}><h1>Track your order</h1>
    <div className="f"><input placeholder="Order reference (elg_…)" value={ref} onChange={(e) => setRef(e.target.value)} /><input placeholder="Phone used at checkout" value={phone} onChange={(e) => setPhone(e.target.value)} /><button className="btn" onClick={go}>Track</button></div>
    {r?.error && <p className="err">{r.error}</p>}
    {r?.status && <div><div className="strip">{steps.map((s, i) => <div key={s} className="chip" style={{ minWidth: 0, opacity: i <= at ? 1 : .35, borderColor: i <= at ? 'var(--green)' : undefined }}><b style={{ textTransform: 'capitalize' }}>{s}</b></div>)}</div>
      {r.carrier && <p>Carrier: <b>{r.carrier}</b></p>}{r.note && <p>{r.note}</p>}</div>}
  </div>)
}
