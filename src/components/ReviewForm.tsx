'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
export default function ReviewForm({ productId }: { productId: string }) {
  const { t, te } = useLang()
  const [f, setF] = useState<any>({ rating: 5 }), [st, setSt] = useState(''), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function send() { setErr(''); const d = await (await fetch('/api/review', { method: 'POST', body: JSON.stringify({ ...f, productId }) })).json(); if (d.ok) setSt('done'); else setErr(d.error ? te(d.error) : t('c.eGeneric')) }
  if (st) return <p>{t('rv.thanks')}</p>
  return (<div className="f" style={{ maxWidth: 480 }}><b>{t('rv.write')}</b>
    <select value={f.rating} onChange={set('rating')}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</select>
    <input placeholder={t('rv.name')} onChange={set('name')} /><input placeholder={t('rv.exp')} onChange={set('comment')} />
    <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} />
    {err && <span className="err">{err}</span>}<button className="btn" onClick={send}>{t('rv.submit')}</button></div>)
}
