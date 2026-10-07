import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { writeClient } from '@/lib/sanity'
import { customerId, isPhoneEmail } from '@/lib/customer'
import { T } from '@/lib/i18n'
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
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><h1 style={{ margin: 0 }}><T k="a.title" /></h1><small style={{ color: 'var(--mute)' }}>{isPhoneEmail(email) ? '+' + email.split('@')[0] : email}</small></div><SignOutButton /></div>
    <h3 className="sec"><T k="a.orders" /></h3>
    {!orders.length && <p><T k="a.noOrders" /> <Link href="/#shop"><u><T k="a.start" /></u></Link></p>}
    {orders.map((o: any) => (<div key={o.reference} className="line" style={{ alignItems: 'flex-start' }}>
      <div className="g"><b>{o.reference}</b> · {new Date(o.createdAt).toLocaleDateString('en-NG')} · <b><T k={'st.' + o.status} /></b><br /><small>{(o.items || []).map((i: any) => `${i.productName} × ${i.quantity}`).join(', ')}</small></div>
      <div style={{ textAlign: 'right' }}><b>{n(o.total)}</b><br /><small><Link href={`/invoice/${o.viewKey}`}><u><T k="a.invoice" /></u></Link> · <Link href="/track"><u><T k="a.track" /></u></Link></small></div><ReorderButton reference={o.reference} /></div>))}
    <h3 className="sec"><T k="a.details" /></h3>
    <AddressBook initial={c?.addresses || []} name={c?.name || a?.user?.name || ''} phone={c?.phone || ''} />
    <h3 className="sec"><T k="a.soon" /></h3>
    <div className="aud">{[['a.loyalty', 'a.loyaltyD'], ['a.cards', 'a.cardsD']].map(([t, d]) => <div key={t} className="card in"><h3 style={{ margin: '0 0 6px' }}><T k={t} /></h3><small><T k={d} /></small><div style={{ marginTop: 10 }}><span className="pill"><T k="a.comingSoon" /></span></div></div>)}</div>
    <div style={{ marginTop: 30 }}><DeleteAccount /></div>
  </div>)
}
