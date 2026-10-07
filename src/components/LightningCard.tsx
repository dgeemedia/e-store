'use client'
import { useState } from 'react'
import { naira } from '@/lib/cart'
import { useLang } from '@/lib/i18n'
import Countdown from './Countdown'
export default function LightningCard({ deal }: { deal: any }) {
  const { t, te, lang } = useLang()
  const [claim, setClaim] = useState<any>(null), [f, setF] = useState<any>({ delivery: 'delivery' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [left, setLeft] = useState(deal.left)
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const post = (body: any) => fetch('/api/lightning', { method: 'POST', body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, d: await r.json().catch(() => ({})) }))
  async function grab() {
    setBusy(true); setErr('')
    const { ok, d } = await post({ action: 'claim', dealId: deal.id })
    if (ok) { setClaim(d); setLeft((l: number) => Math.max(0, l - 1)) } else { setErr(d.error ? te(d.error) : t('lt.sorry')); if (/sold out|gone/i.test(d.error || '')) setLeft(0) }
    setBusy(false)
  }
  async function pay() {
    if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email || '') || (f.phone || '').replace(/\D/g, '').length < 10 || (f.delivery !== 'pickup' && (!f.address || !f.state))) return setErr(t('lt.complete'))
    setBusy(true); setErr('')
    const { ok, d } = await post({ action: 'pay', claimId: claim.claimId, token: claim.token, lang, ...f })
    if (ok && d.link) location.href = d.link; else { setErr(d.error ? te(d.error) : t('e.payFail')); setBusy(false) }
  }
  return (<section className="lightning">
    <img src={deal.product.img} alt={deal.product.name} />
    <div>
      <span className="tag" style={{ position: 'static' }}>{t('lt.tag')}</span>
      <h2 style={{ margin: '8px 0 4px' }}>{deal.title}</h2><div>{deal.product.name}</div>
      <div className="price" style={{ fontSize: 30 }}>{naira(deal.price)}<span className="was">{naira(deal.product.was)}</span></div>
      <div style={{ margin: '6px 0' }}>{t('h.endsIn')} <Countdown endsAt={deal.endsAt} /> · <b>{t('lt.left', { n: left })}</b></div>
      {!claim ? (<><button className="btn green" disabled={busy || left < 1} onClick={grab}>{left < 1 ? t('p.soldOut') : busy ? t('lt.grabbing') : t('lt.grab')}</button>{err && <p className="err">{err}</p>}</>) : (<div>
        <p style={{ fontWeight: 800, color: 'var(--deep)' }}>{t('lt.won1')}<Countdown endsAt={claim.expiresAt} />{t('lt.won2')}</p>
        <div className="f"><input placeholder={t('c.name')} onChange={set('name')} /><input placeholder={t('c.email')} type="email" onChange={set('email')} /><input placeholder={t('c.phone')} type="tel" onChange={set('phone')} />
          <select onChange={set('delivery')}><option value="delivery">{t('c.deliver')}</option><option value="pickup">{t('c.pickup')}</option></select>
          {f.delivery !== 'pickup' && <><input placeholder={t('c.addr')} onChange={set('address')} /><input placeholder={t('a.state')} onChange={set('state')} /></>}</div>
        {err && <p className="err">{err}</p>}<button className="btn green" disabled={busy} onClick={pay}>{busy ? t('c.wait') : t('lt.pay', { amt: naira(deal.price) })}</button>
        <p className="trust">{t('lt.receipt')}</p></div>)}
    </div></section>)
}
