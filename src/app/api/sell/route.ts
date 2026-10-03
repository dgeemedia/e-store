import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { notify } from '@/lib/notify'
const s = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true })
  const d = { name: s(b.name, 100), business: s(b.business, 120), phone: s(b.phone, 30), email: s(b.email, 120), location: s(b.location, 120), sells: s(b.sells, 2000) }
  if (!d.name || d.phone.length < 7 || !d.sells) return NextResponse.json({ error: 'Please add your name, phone and what you sell.' }, { status: 400 })
  await writeClient.create({ _type: 'sellerApplication', ...d, status: 'new', createdAt: new Date().toISOString() })
  await notify(`🌾 New seller application\n${d.name} (${d.business}) ${d.phone}\nSells: ${d.sells}`)
  return NextResponse.json({ ok: true })
}
