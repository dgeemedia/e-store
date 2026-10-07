'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
const steps = ['pending', 'paid', 'shipped', 'delivered']
export default function Track() {
  const { t, te } = useLang()
  const [ref, setRef] = useState(''), [phone, setPhone] = useState(''), [r, setR] = useState<any>(null)
  async function go() { setR(await (await fetch(`/api/track?ref=${encodeURIComponent(ref)}&phone=${encodeURIComponent(phone)}`)).json()) }
  const at = r?.status ? steps.indexOf(r.status) : -1
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 560 }}><h1>{t('tk.title')}</h1>
    <div className="f"><input placeholder={t('tk.ref')} value={ref} onChange={(e) => setRef(e.target.value)} /><input placeholder={t('tk.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} /><button className="btn" onClick={go}>{t('tk.btn')}</button></div>
    {r?.error && <p className="err">{te(r.error)}</p>}
    {r?.status && <div><div className="strip">{steps.map((s, i) => <div key={s} className="chip" style={{ minWidth: 0, opacity: i <= at ? 1 : .35, borderColor: i <= at ? 'var(--green)' : undefined }}><b>{t('st.' + s)}</b></div>)}</div>
      {r.carrier && <p>{t('tk.carrier')}: <b>{r.carrier}</b>{r.trackingNumber && <> · {t('tk.number')} <b>{r.trackingNumber}</b></>}</p>}
      {r.trackUrl && <p><a className="btn" href={r.trackUrl} target="_blank" rel="noopener noreferrer">{t('tk.with', { carrier: r.carrier })}</a></p>}
      {r.note && <p>{r.note}</p>}
      {!r.courierLinks && <small style={{ color: 'var(--mute)' }}>{t('tk.soon')}</small>}
    </div>}
  </div>)
}
