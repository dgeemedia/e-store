import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { priceCart } from '@/lib/pricing'
import { couponDiscount } from '@/lib/coupon'
import { deliveryFee } from '@/lib/shipping'
import { getSettings, writeClient } from '@/lib/sanity'
export async function POST(req: Request) {
  try {
    const b = await req.json()
    const { items, subtotal, kg } = await priceCart(b.lines, { email: b.email, phone: b.phone })
    const s = (await getSettings()) || {}
    if (subtotal > (s.truckloadThreshold ?? 2e6)) return NextResponse.json({ error: 'Large orders are quoted for truck delivery. Please use the Bulk / truckload quote page.' }, { status: 400 })
    if (!b.name || !b.email || !b.phone) return NextResponse.json({ error: 'Name, email and phone are required.' }, { status: 400 })
    const pickup = b.delivery === 'pickup'
    const cp = b.coupon ? await couponDiscount(b.coupon, subtotal) : null
    const discount = cp?.discount || 0
    const fee = deliveryFee(s, b.state, pickup, subtotal, kg)
    const total = Math.max(1, subtotal - discount + fee)
    const ref = `elg_${Date.now()}_${randomBytes(3).toString('hex')}`
    await writeClient.createIfNotExists({
      _id: `order-${ref}`, _type: 'order', reference: ref, viewKey: randomBytes(12).toString('hex'), status: 'pending', name: b.name, email: b.email, phone: b.phone,
      address: pickup ? 'PICKUP' : b.address || '', state: b.state || '', delivery: pickup ? 'pickup' : 'delivery',
      deliveryFee: fee, discount, couponCode: cp?.code || '', total, items, createdAt: new Date().toISOString(),
    })
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tx_ref: ref, amount: total, currency: 'NGN', redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?paid=1`,
        customer: { email: b.email, name: b.name, phonenumber: b.phone }, customizations: { title: 'Elorge Store', description: cp ? `Order ${ref} (code ${cp.code})` : `Order ${ref}` } }),
    }).then((r) => r.json())
    if (!res?.data?.link) throw new Error('Could not start payment. Please try again.')
    return NextResponse.json({ link: res.data.link })
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Checkout failed' }, { status: 400 }) }
}
