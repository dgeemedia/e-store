import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { writeClient } from '@/lib/sanity'
import { customerId, isPhoneEmail } from '@/lib/customer'
import { SignOutButton, ReorderButton, AddressBook, DeleteAccount } from '@/components/AccountClient'
export const metadata = { title: 'My account', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
const n = (x: number) => '₦' + Math.round(x || 0).toLocaleString('en-NG')
export default async function Account() {
  const a = await auth(), email = a?.user?.email?.toLowerCase()
  if (!email) redirect('/account/login')
  const [orders, c]: any[] = await Promise.all([
    writeClient.fetch(`*[_type=="order" && (lower(email)==$e || phoneNorm==$p) && status!="pending"] | order(createdAt desc)[0...50]{reference,viewKey,status,total,createdAt,items[]{productName,quantity}}`, { e: email, p: isPhoneEmail(email) ? email.split('@')[0] : '-' }),
    writeClient.getDocument(customerId(email)),
  ])
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 820 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><h1 style={{ margin: 0 }}>My account</h1><small style={{ color: 'var(--mute)' }}>{isPhoneEmail(email) ? '+' + email.split('@')[0] : email}</small></div><SignOutButton /></div>
    <h3 className="sec">My orders</h3>
    {!orders.length && <p>No orders yet. <Link href="/#shop"><u>Start shopping</u></Link></p>}
    {orders.map((o: any) => (<div key={o.reference} className="line" style={{ alignItems: 'flex-start' }}>
      <div className="g"><b>{o.reference}</b> · {new Date(o.createdAt).toLocaleDateString('en-NG')} · <b>{o.status}</b><br /><small>{(o.items || []).map((i: any) => `${i.productName} × ${i.quantity}`).join(', ')}</small></div>
      <div style={{ textAlign: 'right' }}><b>{n(o.total)}</b><br /><small><Link href={`/invoice/${o.viewKey}`}><u>Invoice</u></Link> · <Link href="/track"><u>Track</u></Link></small></div><ReorderButton reference={o.reference} /></div>))}
    <h3 className="sec">Details and saved addresses</h3>
    <AddressBook initial={c?.addresses || []} name={c?.name || a?.user?.name || ''} phone={c?.phone || ''} />
    <h3 className="sec">More coming soon</h3>
    <div className="aud">{[['Loyalty points', 'Earn points on every order and spend them on future purchases.'], ['Saved cards', 'Pay faster by saving a card securely for next time.']].map(([t, d]) => <div key={t} className="card in"><h3 style={{ margin: '0 0 6px' }}>{t}</h3><small>{d}</small><div style={{ marginTop: 10 }}><span className="pill">Coming soon</span></div></div>)}</div>
    <div style={{ marginTop: 30 }}><DeleteAccount /></div>
  </div>)
}
