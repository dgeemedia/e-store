'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
export default function LoginForm({ google, facebook, phoneOn }: { google: boolean; facebook: boolean; phoneOn: boolean }) {
  const [mode, setMode] = useState<'email' | 'phone'>('email'), [id, setId] = useState(''), [code, setCode] = useState(''), [step, setStep] = useState<'id' | 'code'>('id'), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [soon, setSoon] = useState(false)
  const phone = mode === 'phone'
  async function send() {
    setBusy(true); setErr(''); const r = await fetch(phone ? '/api/phone-code' : '/api/login-code', { method: 'POST', body: JSON.stringify(phone ? { phone: id } : { email: id }) }), d = await r.json().catch(() => ({}))
    setBusy(false); if (r.ok) setStep('code'); else setErr(d.error || 'Could not send the code.')
  }
  async function verify() {
    setBusy(true); setErr(''); const r: any = await signIn(phone ? 'phone' : 'code', { ...(phone ? { phone: id } : { email: id }), code, redirect: false })
    if (r?.error || !r?.ok) { setErr('That code is wrong or expired.'); setBusy(false) } else location.href = '/account'
  }
  function pick(m: 'email' | 'phone') { if (m === 'phone' && !phoneOn) { setSoon(true); return } setSoon(false); setMode(m); setStep('id'); setId(''); setCode(''); setErr('') }
  return (<div className="f" style={{ maxWidth: 380 }}>
    {google && <button className="btn ghost" onClick={() => signIn('google', { callbackUrl: '/account' })}>Continue with Google</button>}
    {facebook && <button className="btn ghost" onClick={() => signIn('facebook', { callbackUrl: '/account' })}>Continue with Facebook</button>}
    <div className="row" style={{ marginTop: 0 }}><button className={`btn ${!phone ? '' : 'ghost'}`} style={{ flex: 1 }} onClick={() => pick('email')}>Email</button><button className={`btn ${phone ? '' : 'ghost'}`} style={{ flex: 1 }} onClick={() => pick('phone')}>Phone number</button></div>
    {soon && <small className="err">Phone login is coming soon. Please use email{google ? ' or Google' : ''} for now.</small>}
    {step === 'id' ? (<><input type={phone ? 'tel' : 'email'} placeholder={phone ? 'Your phone number' : 'Your email'} value={id} onChange={(e) => setId(e.target.value)} /><button className="btn" disabled={busy} onClick={send}>{busy ? 'Sending…' : phone ? 'Text me a login code' : 'Email me a login code'}</button></>)
      : (<><small>We sent a 6-digit code to <b>{id}</b>. It expires in 10 minutes.</small><input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} /><button className="btn" disabled={busy} onClick={verify}>{busy ? 'Checking…' : 'Sign in'}</button><button className="btn ghost" onClick={() => setStep('id')}>Go back</button></>)}
    {err && <span className="err">{err}</span>}
    <small style={{ color: 'var(--mute)' }}>You can also check out as a guest, no account needed.</small>
  </div>)
}
