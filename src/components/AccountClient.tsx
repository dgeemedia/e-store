'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useCart } from '@/lib/cart'
export function SignOutButton() { return <button className="btn ghost" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button> }
export function ReorderButton({ reference }: { reference: string }) {
  const { add } = useCart(), router = useRouter(), [msg, setMsg] = useState('')
  return (<><button className="btn ghost" style={{ padding: '6px 14px' }} onClick={async () => {
    const r = await fetch(`/api/account/reorder?ref=${encodeURIComponent(reference)}`).then((x) => x.json()).catch(() => null)
    if (!r?.lines?.length) return setMsg('Those items are no longer available.')
    r.lines.forEach((l: any) => add(l)); router.push('/cart')
  }}>Reorder</button>{msg && <small className="err"> {msg}</small>}</>)
}
export function AddressBook({ initial, name, phone }: { initial: any[]; name: string; phone: string }) {
  const [list, setList] = useState<any[]>(initial), [n, setN] = useState(name), [p, setP] = useState(phone), [f, setF] = useState<any>({}), [msg, setMsg] = useState('')
  async function save(addresses: any[]) { const r = await fetch('/api/account', { method: 'POST', body: JSON.stringify({ name: n, phone: p, addresses }) }); if (r.ok) { setList(addresses); setMsg('Saved'); setF({}) } else setMsg('Could not save, try again.') }
  return (<div>
    <div className="f" style={{ maxWidth: 420 }}><input placeholder="Your name" value={n} onChange={(e) => setN(e.target.value)} /><input placeholder="Phone number" value={p} onChange={(e) => setP(e.target.value)} /></div>
    {list.map((a, i) => <div key={i} className="line"><div className="g"><b>{a.label || 'Address'}</b><br /><small>{a.address}, {a.state}</small></div><button className="btn ghost" style={{ padding: '6px 14px' }} onClick={() => save(list.filter((_, k) => k !== i))}>Remove</button></div>)}
    <div className="f" style={{ maxWidth: 420 }}><input placeholder="Label (Home, Shop...)" value={f.label || ''} onChange={(e) => setF({ ...f, label: e.target.value })} /><input placeholder="Street address" value={f.address || ''} onChange={(e) => setF({ ...f, address: e.target.value })} /><input placeholder="State" value={f.state || ''} onChange={(e) => setF({ ...f, state: e.target.value })} />
      <button className="btn" onClick={() => save(f.address ? [...list, f] : list)}>{f.address ? 'Add address and save' : 'Save details'}</button>{msg && <small>{msg}</small>}</div>
  </div>)
}
export function DeleteAccount() {
  const [busy, setBusy] = useState(false)
  return <button className="btn ghost" disabled={busy} onClick={async () => { if (!confirm('Delete your saved profile and addresses? Your past order records are kept for accounting.')) return; setBusy(true); await fetch('/api/account', { method: 'DELETE' }); signOut({ callbackUrl: '/' }) }}>Delete my account data</button>
}
