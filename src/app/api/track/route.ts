import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
export async function GET(req: Request) {
  const u = new URL(req.url), ref = u.searchParams.get('ref')?.trim(), phone = (u.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10)
  const o = ref && phone.length >= 7 ? await writeClient.fetch(`*[_type=="order" && reference==$ref][0]{status, carrier, trackingNote, delivery, phone}`, { ref }) : null
  if (!o || (o.phone || '').replace(/\D/g, '').slice(-10) !== phone) return NextResponse.json({ error: 'No order found. Check your reference and phone number.' }, { status: 404 })
  return NextResponse.json({ status: o.status, carrier: o.carrier, note: o.trackingNote, delivery: o.delivery })
}
