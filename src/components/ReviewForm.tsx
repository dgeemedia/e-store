'use client'
import { useState } from 'react'
export default function ReviewForm({ productId }: { productId: string }) {
  const [f, setF] = useState<any>({ rating: 5 }), [st, setSt] = useState(''), [err, setErr] = useState('')
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function send() { setErr(''); const d = await (await fetch('/api/review', { method: 'POST', body: JSON.stringify({ ...f, productId }) })).json(); if (d.ok) setSt('done'); else setErr(d.error || 'Failed') }
  if (st) return <p>Thank you! Your review will appear once approved.</p>
  return (<div className="f" style={{ maxWidth: 480 }}><b>Write a review</b>
    <select value={f.rating} onChange={set('rating')}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</select>
    <input placeholder="Your name" onChange={set('name')} /><input placeholder="Your experience" onChange={set('comment')} />
    <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} onChange={set('website')} />
    {err && <span className="err">{err}</span>}<button className="btn" onClick={send}>Submit review</button></div>)
}
