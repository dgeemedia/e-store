import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { sendShippedEmail } from '@/lib/email'
import { notify } from '@/lib/notify'
/** Sanity webhook target: fires when you edit an order in Studio. Handles "shipped" emails and cancellations (restock + refund). */
export async function POST(req: Request) {
  if (!process.env.SANITY_WEBHOOK_SECRET || new URL(req.url).searchParams.get('secret') !== process.env.SANITY_WEBHOOK_SECRET) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { _id } = await req.json().catch(() => ({}))
  const o: any = _id && (await writeClient.getDocument(_id))
  if (!o || o._type !== 'order') return NextResponse.json({ ok: true })
  if (o.status === 'shipped' && !o.shippedEmailSent) { await writeClient.patch(o._id).set({ shippedEmailSent: true }).commit(); await sendShippedEmail(o) }
  if (o.status === 'cancelled' && o.transactionId && !o.restocked) {
    await writeClient.patch(o._id).set({ restocked: true }).commit() // flag first so retries never double-restock
    for (const i of o.items || []) { const p: any = await writeClient.getDocument(i.productId); if (p) { let pt = writeClient.patch(p._id).setIfMissing({ soldUnits: 0 }).inc({ soldUnits: -i.units }); if (p.stockUnits != null) pt = pt.set({ stockUnits: p.stockUnits + i.units }); await pt.commit() } }
    let note = 'Refund NOT sent: please refund in Flutterwave.'
    if (process.env.AUTO_REFUND === 'true' && !o.refunded) {
      const r = await fetch(`https://api.flutterwave.com/v3/transactions/${o.transactionId}/refund`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: o.total }) }).then((x) => x.json()).catch(() => null)
      if (r?.status === 'success') { note = 'Refund started automatically.'; await writeClient.patch(o._id).set({ refunded: true }).commit() }
    }
    await notify(`❌ Order ${o.reference} cancelled. Stock restored. ${note}`)
  }
  return NextResponse.json({ ok: true })
}
