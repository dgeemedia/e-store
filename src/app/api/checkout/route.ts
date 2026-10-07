import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { priceCart } from '@/lib/pricing'
import { couponDiscount } from '@/lib/coupon'
import { deliveryFee, partnerQuote } from '@/lib/shipping'
import { client, getSettings, writeClient } from '@/lib/sanity'
import { normPhone } from '@/lib/customer'
import { normLang } from '@/lib/tserver'
export async function POST(req: Request) {
  try {
    const b = await req.json()
    const { items, subtotal, kg } = await priceCart(b.lines, { email: b.email, phone: b.phone })
    const s = (await getSettings()) || {}
    if (subtotal > (s.truckloadThreshold ?? 2e6)) return NextResponse.json({ error: 'Large orders are quoted for truck delivery. Please use the Bulk / truckload quote page.' }, { status: 400 })
    if (!b.name || !b.email || !b.phone) return NextResponse.json({ error: 'Name, email and phone are required.' }, { status: 400 })
    const country = String(b.country || 'Nigeria').slice(0, 60)
    const pickup = b.delivery === 'pickup' && country === 'Nigeria'
    const cp = b.coupon ? await couponDiscount(b.coupon, subtotal) : null
    const discount = cp?.discount || 0
    let fee: number | undefined, logi: any = {}
    if (country === 'Nigeria' && !pickup && s.features?.logistics) { // delivery partner chosen at checkout; fee is recalculated here, never trusted from the browser
      const parts: any[] = await client.fetch(`*[_type=="deliveryPartner" && active!=false] | order(sortOrder asc){_id,name,kind,vehicle,minKg,coverage,feeLagos,feeOther,perKg,maxKg,freeAbove,etaText,zones[]{name,match,fee,perKg,etaText,bands[]{upToKg,fee}}}`)
      if (parts.length) {
        const p = parts.find((x) => x._id === b.partnerId)
        if (!p) throw new Error('Please choose a delivery option.')
        const q = partnerQuote(p, b.state, kg, subtotal, String(b.area || ''))
        if (!q.ok) throw new Error(`${p.name}: ${q.reason}`)
        fee = q.fee; logi = { logisticsPartner: `${p.name}${p.vehicle ? ' · ' + p.vehicle : ''}`, logisticsPartnerId: p._id, logisticsKind: p.kind, etaText: q.eta || p.etaText || '', logisticsZone: q.zone || '', deliveryArea: String(b.area || '').slice(0, 80), carrier: p.name }
      }
    }
    if (fee === undefined) fee = deliveryFee(s, b.state, pickup, subtotal, kg, country)
    const total = Math.max(1, subtotal - discount + fee)
    // Optional foreign-currency payment for buyers abroad: rate comes from Studio, never from the browser.
    const cur = b.currency && b.currency !== 'NGN' ? (s.currencies || []).find((c: any) => c.code === b.currency) : null
    if (b.currency && b.currency !== 'NGN' && !cur) return NextResponse.json({ error: 'That currency is not available.' }, { status: 400 })
    const payCurrency = cur?.code || 'NGN', payAmount = cur ? Math.round((total / cur.rateNgn) * 100) / 100 : total
    const ref = `elg_${Date.now()}_${randomBytes(3).toString('hex')}`
    await writeClient.createIfNotExists({
      _id: `order-${ref}`, _type: 'order', reference: ref, viewKey: randomBytes(12).toString('hex'), status: 'pending', name: b.name, email: String(b.email).trim(), phone: b.phone,
      address: pickup ? 'PICKUP' : b.address || '', state: b.state || '', delivery: pickup ? 'pickup' : 'delivery', whatsappOptIn: !!b.whatsapp, ...logi, country, phoneNorm: normPhone(b.phone), lang: normLang(b.lang),
      deliveryFee: fee, discount, couponCode: cp?.code || '', total, payCurrency, payAmount, items, createdAt: new Date().toISOString(),
    })
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tx_ref: ref, amount: payAmount, currency: payCurrency, redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?paid=1`,
        customer: { email: b.email, name: b.name, phonenumber: b.phone }, customizations: { title: 'Elorge Store', description: cp ? `Order ${ref} (code ${cp.code})` : `Order ${ref}` } }),
    }).then((r) => r.json())
    if (!res?.data?.link) throw new Error('Could not start payment. Please try again.')
    return NextResponse.json({ link: res.data.link })
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Checkout failed' }, { status: 400 }) }
}
