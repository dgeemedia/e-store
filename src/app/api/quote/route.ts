import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { notify } from '@/lib/notify'
const s = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true }) // honeypot: bots fill this hidden field
  const d = { name: s(b.name, 100), company: s(b.company, 120), phone: s(b.phone, 30), email: s(b.email, 120), location: s(b.location, 120), vehicle: s(b.vehicle, 60), items: s(b.items, 2000), quantity: s(b.quantity, 200), notes: s(b.notes, 1000) }
  if (!d.name || d.phone.length < 7 || !d.items) return NextResponse.json({ error: 'Please add your name, phone and what you need.' }, { status: 400 })
  await writeClient.create({ _type: 'quote', ...d, status: 'new', createdAt: new Date().toISOString() })
  await notify(`📩 New bulk quote request\n${d.name} (${d.company}) ${d.phone}\n${d.items}${d.vehicle ? '\nVehicle: ' + d.vehicle : ''}`)
  return NextResponse.json({ ok: true })
}
