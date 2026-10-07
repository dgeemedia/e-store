'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useCart } from '@/lib/cart'
import { useLang } from '@/lib/i18n'
export function SignOutButton() { const { t } = useLang(); return <button className="btn ghost" onClick={() => signOut({ callbackUrl: '/' })}>{t('a.signout')}</button> }
export function ReorderButton({ reference }: { reference: string }) {
  const { add } = useCart(), router = useRouter(), { t } = useLang(), [msg, setMsg] = useState('')
  return (<><button className="btn ghost" style={{ padding: '6px 14px' }} onClick={async () => {
    const r = await fetch(`/api/account/reorder?ref=${encodeURIComponent(reference)}`).then((x) => x.json()).catch(() => null)
    if (!r?.lines?.length) return setMsg(t('a.reorderNone'))
    r.lines.forEach((l: any) => add(l)); router.push('/cart')
  }}>{t('a.reorder')}</button>{msg && <small className="err"> {msg}</small>}</>)
}
export function AddressBook({ initial, name, phone }: { initial: any[]; name: string; phone: string }) {
  const { t } = useLang()
  const [list, setList] = useState<any[]>(initial), [n, setN] = useState(name), [p, setP] = useState(phone), [f, setF] = useState<any>({}), [msg, setMsg] = useState('')
  async function save(addresses: any[]) { const r = await fetch('/api/account', { method: 'POST', body: JSON.stringify({ name: n, phone: p, addresses }) }); if (r.ok) { setList(addresses); setMsg(t('a.saved')); setF({}) } else setMsg(t('a.saveFail')) }
  return (<div>
    <div className="f" style={{ maxWidth: 420 }}><input placeholder={t('a.yourName')} value={n} onChange={(e) => setN(e.target.value)} /><input placeholder={t('a.phone')} value={p} onChange={(e) => setP(e.target.value)} /></div>
    {list.map((a, i) => <div key={i} className="line"><div className="g"><b>{a.label || t('a.address')}</b><br /><small>{a.address}, {a.state}</small></div><button className="btn ghost" style={{ padding: '6px 14px' }} onClick={() => save(list.filter((_, k) => k !== i))}>{t('a.remove')}</button></div>)}
    <div className="f" style={{ maxWidth: 420 }}><input placeholder={t('a.label')} value={f.label || ''} onChange={(e) => setF({ ...f, label: e.target.value })} /><input placeholder={t('a.street')} value={f.address || ''} onChange={(e) => setF({ ...f, address: e.target.value })} /><input placeholder={t('a.state')} value={f.state || ''} onChange={(e) => setF({ ...f, state: e.target.value })} />
      <button className="btn" onClick={() => save(f.address ? [...list, f] : list)}>{f.address ? t('a.add') : t('a.save')}</button>{msg && <small>{msg}</small>}</div>
  </div>)
}
export function DeleteAccount() {
  const { t } = useLang(), [busy, setBusy] = useState(false)
  return <button className="btn ghost" disabled={busy} onClick={async () => { if (!confirm(t('a.deleteConfirm'))) return; setBusy(true); await fetch('/api/account', { method: 'DELETE' }); signOut({ callbackUrl: '/' }) }}>{t('a.delete')}</button>
}
