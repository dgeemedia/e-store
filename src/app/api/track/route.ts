import { NextResponse } from 'next/server'
import { writeClient, getSettings } from '@/lib/sanity'
import { getFeatures } from '@/lib/features'
export async function GET(req: Request) {
  const u = new URL(req.url), ref = u.searchParams.get('ref')?.trim(), phone = (u.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10)
  const o = ref && phone.length >= 7 ? await writeClient.fetch(`*[_type=="order" && reference==$ref][0]{status, carrier, trackingNumber, trackingNote, delivery, phone}`, { ref }) : null
  if (!o || (o.phone || '').replace(/\D/g, '').slice(-10) !== phone) return NextResponse.json({ error: 'No order found. Check your reference and phone number.' }, { status: 404 })
  const [s, f, partners] = await Promise.all([getSettings(), getFeatures(), writeClient.fetch(`*[_type=="deliveryPartner"]{name,trackUrl}`)])
  const c = [...(partners || []), ...(s?.carriers || [])].find((x: any) => x.name?.trim().toLowerCase() === String(o.carrier || '').trim().toLowerCase())
  const trackUrl = f.courierLinks && c && o.trackingNumber && /^https:\/\//.test(c.trackUrl || '') ? c.trackUrl.replace('{number}', encodeURIComponent(o.trackingNumber)) : null
  return NextResponse.json({ status: o.status, carrier: o.carrier, trackingNumber: o.trackingNumber, trackUrl, courierLinks: f.courierLinks, note: o.trackingNote, delivery: o.delivery })
}
