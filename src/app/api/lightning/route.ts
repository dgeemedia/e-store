import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getSettings, writeClient } from '@/lib/sanity'
import { deliveryFee } from '@/lib/shipping'
const bad = (m: string, status = 400) => NextResponse.json({ error: m }, { status })
const rnd = (n: number) => randomBytes(n).toString('hex')
export async function POST(req: Request) {
  try {
    const b = await req.json()
    return b.action === 'claim' ? await claim(b) : b.action === 'pay' ? await pay(b) : bad('Unknown action')
  } catch (e: any) { return bad(e.message || 'Something went wrong') }
}
/** First click wins: each unit is a slot document with a fixed _id, and create() fails if the slot is taken, so two people can never get the same slot. */
async function claim(b: any) {
  const deal = await writeClient.fetch(`*[_type=="lightning" && _id==$id && active!=false && startsAt<=now() && endsAt>=now()][0]{_id,units,holdMinutes,"stock":product->stockUnits}`, { id: String(b.dealId) })
  if (!deal || deal.stock === 0) return bad('This deal has ended or is sold out.', 410)
  const existing: any[] = await writeClient.fetch(`*[_type=="claim" && deal==$id]{_id,_rev,status,expiresAt,slot}`, { id: deal._id })
  const now = Date.now(), live = new Set<number>(), old = new Map<number, any>()
  for (const c of existing) (c.status === 'paid' || (c.status === 'held' && new Date(c.expiresAt).getTime() > now) ? live : { add: (n: number) => old.set(n, c) } as any).add(c.slot)
  const hold = Math.min(Math.max(deal.holdMinutes || 5, 1), 15)
  const data = { deal: deal._id, token: rnd(16), status: 'held', expiresAt: new Date(now + hold * 6e4).toISOString(), claimedAt: new Date(now).toISOString() }
  for (let slot = 0; slot < Math.min(deal.units, 500); slot++) {
    if (live.has(slot)) continue
    const _id = `claim-${deal._id}-${slot}`
    try {
      if (old.has(slot)) await writeClient.patch(_id).ifRevisionId(old.get(slot)._rev).set({ ...data, orderId: '' }).commit()
      else await writeClient.create({ _id, _type: 'claim', slot, ...data })
      return NextResponse.json({ claimId: _id, token: data.token, expiresAt: data.expiresAt })
    } catch (e: any) { if (e?.statusCode === 409) continue; throw e }
  }
  return bad('Sold out! Someone was faster. Watch for the next deal.', 409)
}
async function pay(b: any) {
  const c: any = await writeClient.getDocument(String(b.claimId))
  if (!c || c._type !== 'claim' || c.token !== b.token || c.status !== 'held') return bad('This claim is no longer valid.', 410)
  if (new Date(c.expiresAt).getTime() < Date.now()) return bad('Your time ran out and the deal went on. Try the next one!', 410)
  const deal = await writeClient.fetch(`*[_type=="lightning" && _id==$id][0]{title,dealPrice,codePrefix,"p":product->{_id,name,stockUnits,weightKg}}`, { id: c.deal })
  if (!deal?.p || deal.p.stockUnits === 0) return bad('Deal not available.', 404)
  if (!b.name || !/^\S+@\S+\.\S+$/.test(b.email || '') || String(b.phone || '').replace(/\D/g, '').length < 10) return bad('Please enter your name, a valid email and phone.')
  const pickup = b.delivery === 'pickup'
  if (!pickup && (!b.address || !b.state)) return bad('Please enter your delivery address and state.')
  const s = (await getSettings()) || {}
  const fee = deliveryFee(s, b.state, pickup, deal.dealPrice, deal.p.weightKg || 0)
  const total = deal.dealPrice + fee
  const code = `${String(deal.codePrefix || 'LNG').toUpperCase().slice(0, 6)}-${rnd(3).toUpperCase()}`
  const ref = `elg_${Date.now()}_${rnd(2)}`
  await writeClient.createIfNotExists({ _id: `order-${ref}`, _type: 'order', reference: ref, viewKey: rnd(12), status: 'pending', name: b.name, email: b.email, phone: b.phone, address: pickup ? 'PICKUP' : b.address, state: b.state || '', delivery: pickup ? 'pickup' : 'delivery', deliveryFee: fee, total, promoCode: code, promoTitle: deal.title, claimId: c._id, createdAt: new Date().toISOString(),
    items: [{ _key: `${deal.p._id}-unit`, productId: deal.p._id, productName: deal.p.name, mode: 'unit', quantity: 1, price: deal.dealPrice, units: 1 }] })
  await writeClient.patch(c._id).set({ orderId: `order-${ref}`, expiresAt: new Date(Date.now() + 15 * 6e4).toISOString() }).commit() // extra time to finish paying
  const res = await fetch('https://api.flutterwave.com/v3/payments', { method: 'POST', headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tx_ref: ref, amount: total, currency: 'NGN', redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?paid=1`, meta: { promo_code: code }, customer: { email: b.email, name: b.name, phonenumber: b.phone },
      customizations: { title: 'Elorge Store', description: `Lightning deal ${code}: ${deal.p.name}` } }) }).then((r) => r.json())
  if (!res?.data?.link) return bad('Could not start payment. Please try again.')
  return NextResponse.json({ link: res.data.link })
}
