'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
export default function Sell() {
  const { t, te } = useLang()
  const [f, setF] = useState<any>({}), [st, setSt] = useState<'idle' | 'busy' | 'done'>('idle'), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function send() { setSt('busy'); setErr(''); const d = await (await fetch('/api/sell', { method: 'POST', body: JSON.stringify(f) })).json(); if (d.ok) setSt('done'); else { setErr(d.error ? te(d.error) : t('sl.fail')); setSt('idle') } }
  if (st === 'done') return <div className="wrap" style={{ padding: 60 }}><h1>{t('sl.done')}</h1><p>{t('sl.doneMsg')}</p></div>
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 640 }}><h1 style={{ letterSpacing: '-.03em' }}>{t('sl.title')}</h1>
    <p style={{ color: 'var(--mute)' }}>{t('sl.intro')}</p>
    <div className="f"><input placeholder={t('sl.name')} onChange={set('name')} /><input placeholder={t('sl.biz')} onChange={set('business')} /><input placeholder={t('sl.phone')} onChange={set('phone')} /><input placeholder={t('sl.email')} onChange={set('email')} /><input placeholder={t('sl.loc')} onChange={set('location')} />
      <input placeholder={t('sl.sells')} onChange={set('sells')} /><input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} /></div>
    {err && <p className="err">{err}</p>}<button className="btn green" disabled={st === 'busy'} onClick={send}>{st === 'busy' ? t('sl.sending') : t('sl.apply')}</button></div>)
}
