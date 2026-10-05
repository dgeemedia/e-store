import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { sendOrderEmail } from '@/lib/email'
import { notify } from '@/lib/notify'
import { computePayouts } from '@/lib/payouts'
import { sendWhatsApp } from '@/lib/whatsapp'
const ok = () => NextResponse.json({ ok: true })
export async function POST(req: NextRequest) {
  if (req.headers.get('verif-hash') !== process.env.FLUTTERWAVE_SECRET_HASH) return NextResponse.json({ error: 'bad signature' }, { status: 401 })
  const e = await req.json(), d = e?.data
  if (e?.event !== 'charge.completed' || d?.status !== 'successful' || !String(d?.tx_ref).startsWith('elg_')) return ok()
  const order: any = await writeClient.getDocument(`order-${d.tx_ref}`)
  if (!order || order.status !== 'pending') return ok() // retry-safe
  // Re-verify with Flutterwave; never trust the payload alone
  const v = (await fetch(`https://api.flutterwave.com/v3/transactions/${d.id}/verify`, { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }).then((r) => r.json()))?.data
  const cur = order.payCurrency || 'NGN', expected = order.payAmount ?? order.total
  if (v?.status !== 'successful' || v?.tx_ref !== d.tx_ref || v?.currency !== cur) return NextResponse.json({ error: 'verify failed' }, { status: 400 })
  if (Number(v.amount) + 0.01 < expected) { await writeClient.patch(order._id).set({ notes: `UNDERPAID: got ${cur} ${v.amount}, expected ${expected}` }).commit(); return ok() }
  try { await writeClient.patch(order._id).ifRevisionId(order._rev).set({ status: 'paid', transactionId: String(d.id) }).commit() }
  catch (err: any) { if (err?.statusCode === 409) return ok(); throw err }
  for (const i of order.items || []) { // decrement tracked stock and count units sold, once
    const p: any = await writeClient.getDocument(i.productId)
    if (p) { let pt = writeClient.patch(p._id).setIfMissing({ soldUnits: 0 }).inc({ soldUnits: i.units }); if (p.stockUnits != null) pt = pt.set({ stockUnits: Math.max(0, p.stockUnits - i.units) }); await pt.commit() }
  }
  if (order.claimId) await writeClient.patch(order.claimId).set({ status: 'paid' }).commit().catch(() => {})
  const payouts = await computePayouts(order.items || []).catch(() => [])
  if (payouts.length) await writeClient.patch(order._id).set({ payouts }).commit().catch(() => {})
  const payLines = (payouts as any[]).filter((p) => p.payable > 0).map((p) => `${p.seller}: ₦${Math.round(p.payable).toLocaleString('en-NG')}`).join('; ')
  const totalText = `₦${Math.round(order.total).toLocaleString('en-NG')}`
  await notify(`New paid order ${order.reference}${order.promoCode ? ' · ' + order.promoCode : ''}\n${order.name} · ${order.phone}\nTotal ${totalText}${cur !== 'NGN' ? ` (paid ${cur} ${order.payAmount})` : ''}\nDelivery: ${order.logisticsPartner || (order.delivery === 'pickup' ? 'Pickup' : 'Standard')}${order.logisticsZone ? ' / ' + order.logisticsZone : ''}${order.deliveryArea ? ' (' + order.deliveryArea + ')' : ''}\nPay sellers BEFORE collecting goods: ${payLines || 'none'}\nWaybill: ${process.env.NEXT_PUBLIC_SITE_URL}/invoice/${order.viewKey}?waybill=1`)
  await sendOrderEmail(order)
  if (order.whatsappOptIn) await sendWhatsApp(order.phone, process.env.WA_TEMPLATE_PAID || 'order_confirmed', [order.name || 'there', order.reference, totalText])
  return ok()
}
