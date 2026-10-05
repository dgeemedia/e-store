'use client'
import { useState } from 'react'
import { VEHICLES, SERVICES } from '../../sanity/vehicles'
export default function LogisticsForm() {
  const [f, setF] = useState<any>({ vehicles: [], services: [] }), [st, setSt] = useState<'idle' | 'busy' | 'done'>('idle'), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const toggle = (k: string, v: string) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x: string) => x !== v) : [...f[k], v] })
  async function send() {
    setSt('busy'); setErr(''); const d = await (await fetch('/api/logistics', { method: 'POST', body: JSON.stringify(f) })).json().catch(() => ({}))
    if (d.ok) setSt('done'); else { setErr(d.error || 'Something went wrong. Try again.'); setSt('idle') }
  }
  if (st === 'done') return <div><h2>Application received</h2><p>Thank you. We'll call you to discuss rates and next steps. Keep your CAC certificate, insurance papers and vehicle documents ready: we will ask for them before approving you.</p></div>
  const Chips = ({ k, list }: { k: string; list: string[] }) => <div className="row" style={{ marginTop: 6 }}>{list.map((v) => <button key={v} type="button" className={`btn ${f[k].includes(v) ? '' : 'ghost'}`} style={{ padding: '8px 14px' }} onClick={() => toggle(k, v)}>{v}</button>)}</div>
  return (<div className="f" style={{ maxWidth: 640 }}>
    <input placeholder="Company name *" onChange={set('company')} /><input placeholder="CAC / RC number" onChange={set('rcNumber')} />
    <input placeholder="Contact person *" onChange={set('name')} /><input placeholder="Phone / WhatsApp *" type="tel" onChange={set('phone')} /><input placeholder="Email" type="email" onChange={set('email')} />
    <input placeholder="Base city and address" onChange={set('baseCity')} /><input placeholder="States / areas you deliver to * (e.g. Lagos, Ogun, Abuja)" onChange={set('states')} />
    <div><b>Vehicles you operate *</b><Chips k="vehicles" list={VEHICLES} /></div>
    <div><b>Services</b><Chips k="services" list={SERVICES} /></div>
    <input placeholder="Fleet size (e.g. 12 bikes, 3 vans, 2 trucks)" onChange={set('fleetSize')} />
    <select onChange={set('insurance')}><option value="">Goods-in-transit insurance?</option><option>Yes</option><option>No</option><option>Not sure</option></select>
    <select onChange={set('tracking')}><option value="">Do you offer parcel tracking?</option><option>Yes, a tracking link</option><option>Yes, an API</option><option>Phone updates only</option><option>No</option></select>
    <input placeholder="Website or Instagram (optional)" onChange={set('websiteUrl')} />
    <textarea placeholder="Your rates in short (e.g. Lagos Island N3,000 up to 5 kg; bus N25,000 Lagos to Ibadan). We can discuss this on a call." rows={3} onChange={set('rates')} style={{ font: 'inherit', padding: 12, borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }} />
    <input placeholder="Anything else?" onChange={set('notes')} />
    <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} />
    {err && <span className="err">{err}</span>}<button className="btn green" disabled={st === 'busy'} onClick={send}>{st === 'busy' ? 'Sending…' : 'Apply as a logistics partner'}</button>
  </div>)
}
