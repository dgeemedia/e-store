'use client'
import { useState } from 'react'
import { VEHICLES, SERVICES } from '../../sanity/vehicles'
import { useLang } from '@/lib/i18n'
export default function LogisticsForm() {
  const { t, tr, te } = useLang()
  const [f, setF] = useState<any>({ vehicles: [], services: [] }), [st, setSt] = useState<'idle' | 'busy' | 'done'>('idle'), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const toggle = (k: string, v: string) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x: string) => x !== v) : [...f[k], v] })
  async function send() {
    setSt('busy'); setErr(''); const d = await (await fetch('/api/logistics', { method: 'POST', body: JSON.stringify(f) })).json().catch(() => ({}))
    if (d.ok) setSt('done'); else { setErr(d.error ? te(d.error) : t('sl.fail')); setSt('idle') }
  }
  if (st === 'done') return <div><h2>{t('sl.done')}</h2><p>{t('lg.doneMsg')}</p></div>
  const Chips = ({ k, list, prefix }: { k: string; list: string[]; prefix: string }) => <div className="row" style={{ marginTop: 6 }}>{list.map((v) => <button key={v} type="button" className={`btn ${f[k].includes(v) ? '' : 'ghost'}`} style={{ padding: '8px 14px' }} onClick={() => toggle(k, v)}>{tr(prefix, v)}</button>)}</div>
  return (<div className="f" style={{ maxWidth: 640 }}>
    <input placeholder={t('lg.company')} onChange={set('company')} /><input placeholder={t('lg.rc')} onChange={set('rcNumber')} />
    <input placeholder={t('lg.contact')} onChange={set('name')} /><input placeholder={t('sl.phone')} type="tel" onChange={set('phone')} /><input placeholder={t('sl.email')} type="email" onChange={set('email')} />
    <input placeholder={t('lg.base')} onChange={set('baseCity')} /><input placeholder={t('lg.states')} onChange={set('states')} />
    <div><b>{t('lg.vehicles')}</b><Chips k="vehicles" list={VEHICLES} prefix="veh." /></div>
    <div><b>{t('lg.services')}</b><Chips k="services" list={SERVICES} prefix="svc." /></div>
    <input placeholder={t('lg.fleet')} onChange={set('fleetSize')} />
    <select onChange={set('insurance')}><option value="">{t('lg.ins')}</option><option value="Yes">{t('lg.yes')}</option><option value="No">{t('lg.no')}</option><option value="Not sure">{t('lg.unsure')}</option></select>
    <select onChange={set('tracking')}><option value="">{t('lg.track')}</option><option value="Yes, a tracking link">{t('lg.trackLink')}</option><option value="Yes, an API">{t('lg.trackApi')}</option><option value="Phone updates only">{t('lg.trackPhone')}</option><option value="No">{t('lg.no')}</option></select>
    <input placeholder={t('lg.web')} onChange={set('websiteUrl')} />
    <textarea placeholder={t('lg.rates')} rows={3} onChange={set('rates')} style={{ font: 'inherit', padding: 12, borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }} />
    <input placeholder={t('q.else')} onChange={set('notes')} />
    <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} />
    {err && <span className="err">{err}</span>}<button className="btn green" disabled={st === 'busy'} onClick={send}>{st === 'busy' ? t('sl.sending') : t('lg.btn')}</button>
  </div>)
}
