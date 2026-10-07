'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useLang } from '@/lib/i18n'
export default function LoginForm({ google, facebook, phoneOn }: { google: boolean; facebook: boolean; phoneOn: boolean }) {
  const { t, te, lang } = useLang()
  const [mode, setMode] = useState<'email' | 'phone'>('email'), [id, setId] = useState(''), [code, setCode] = useState(''), [step, setStep] = useState<'id' | 'code'>('id'), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [soon, setSoon] = useState(false)
  const phone = mode === 'phone'
  async function send() {
    setBusy(true); setErr(''); const r = await fetch(phone ? '/api/phone-code' : '/api/login-code', { method: 'POST', body: JSON.stringify({ ...(phone ? { phone: id } : { email: id }), lang }) }), d = await r.json().catch(() => ({}))
    setBusy(false); if (r.ok) setStep('code'); else setErr(d.error ? te(d.error) : t('lo.sendFail'))
  }
  async function verify() {
    setBusy(true); setErr(''); const r: any = await signIn(phone ? 'phone' : 'code', { ...(phone ? { phone: id } : { email: id }), code, redirect: false })
    if (r?.error || !r?.ok) { setErr(t('lo.wrong')); setBusy(false) } else location.href = '/account'
  }
  function pick(m: 'email' | 'phone') { if (m === 'phone' && !phoneOn) { setSoon(true); return } setSoon(false); setMode(m); setStep('id'); setId(''); setCode(''); setErr('') }
  return (<div className="f" style={{ maxWidth: 380 }}>
    {google && <button className="btn ghost" onClick={() => signIn('google', { callbackUrl: '/account' })}>{t('lo.google')}</button>}
    {facebook && <button className="btn ghost" onClick={() => signIn('facebook', { callbackUrl: '/account' })}>{t('lo.facebook')}</button>}
    <div className="row" style={{ marginTop: 0 }}><button className={`btn ${!phone ? '' : 'ghost'}`} style={{ flex: 1 }} onClick={() => pick('email')}>{t('lo.email')}</button><button className={`btn ${phone ? '' : 'ghost'}`} style={{ flex: 1 }} onClick={() => pick('phone')}>{t('lo.phone')}</button></div>
    {soon && <small className="err">{t(google ? 'lo.phoneSoonG' : 'lo.phoneSoon')}</small>}
    {step === 'id' ? (<><input type={phone ? 'tel' : 'email'} placeholder={phone ? t('lo.yourPhone') : t('lo.yourEmail')} value={id} onChange={(e) => setId(e.target.value)} /><button className="btn" disabled={busy} onClick={send}>{busy ? t('sl.sending') : phone ? t('lo.sendSms') : t('lo.sendEmail')}</button></>)
      : (<><small>{t('lo.sentTo', { id })}</small><input inputMode="numeric" maxLength={6} placeholder={t('lo.code')} value={code} onChange={(e) => setCode(e.target.value)} /><button className="btn" disabled={busy} onClick={verify}>{busy ? t('lo.checking') : t('lo.signin')}</button><button className="btn ghost" onClick={() => setStep('id')}>{t('lo.back')}</button></>)}
    {err && <span className="err">{err}</span>}
    <small style={{ color: 'var(--mute)' }}>{t('lo.guest')}</small>
  </div>)
}
