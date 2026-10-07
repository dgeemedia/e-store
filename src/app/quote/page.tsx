'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
export default function Quote() {
  const { t, te } = useLang()
  const [f, setF] = useState<any>({}), [state, setState] = useState<'idle' | 'busy' | 'done'>('idle'), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function send() {
    setState('busy'); setErr('')
    const r = await fetch('/api/quote', { method: 'POST', body: JSON.stringify(f) }), d = await r.json()
    if (d.ok) setState('done'); else { setErr(d.error ? te(d.error) : t('sl.fail')); setState('idle') }
  }
  if (state === 'done') return <div className="wrap" style={{ padding: 60 }}><h1>{t('q.done')}</h1><p>{t('q.doneMsg')}</p></div>
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 640 }}>
    <h1 style={{ letterSpacing: '-.03em' }}>{t('q.title')}</h1>
    <p style={{ color: 'var(--mute)' }}>{t('q.intro')}</p>
    <div className="f"><input placeholder={t('sl.name')} onChange={set('name')} /><input placeholder={t('q.company')} onChange={set('company')} /><input placeholder={t('sl.phone')} onChange={set('phone')} /><input placeholder={t('sl.email')} onChange={set('email')} /><input placeholder={t('q.loc')} onChange={set('location')} />
      <input placeholder={t('q.need')} onChange={set('items')} /><input placeholder={t('q.vehicle')} onChange={set('vehicle')} /><input placeholder={t('q.qty')} onChange={set('quantity')} /><input placeholder={t('q.else')} onChange={set('notes')} />
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} /></div>
    {err && <p className="err">{err}</p>}<button className="btn green" disabled={state === 'busy'} onClick={send}>{state === 'busy' ? t('sl.sending') : t('q.btn')}</button>
  </div>)
}
