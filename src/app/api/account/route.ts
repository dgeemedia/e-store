import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/lib/sanity'
import { customerId, isPhoneEmail } from '@/lib/customer'
const s = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
async function me() { const a = await auth(), email = a?.user?.email?.toLowerCase(); return email ? { email, id: customerId(email), name: a?.user?.name || '' } : null }
export async function GET() {
  const u = await me(); if (!u) return NextResponse.json({ error: 'login' }, { status: 401 })
  const c: any = await writeClient.getDocument(u.id)
  const ph = isPhoneEmail(u.email)
  return NextResponse.json({ email: ph ? '' : u.email, name: c?.name || (ph ? '' : u.name), phone: c?.phone || (ph ? u.email.split('@')[0] : ''), addresses: c?.addresses || [] })
}
export async function POST(req: Request) {
  const u = await me(); if (!u) return NextResponse.json({ error: 'login' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const addresses = (Array.isArray(b.addresses) ? b.addresses : []).slice(0, 10).map((a: any, i: number) => ({ _key: `a${i}${Date.now()}`, label: s(a.label, 40), address: s(a.address, 200), state: s(a.state, 40) })).filter((a: any) => a.address)
  await writeClient.createOrReplace({ _id: u.id, _type: 'customer', email: u.email, name: s(b.name, 80), phone: s(b.phone, 30), addresses })
  return NextResponse.json({ ok: true })
}
export async function DELETE() {
  const u = await me(); if (!u) return NextResponse.json({ error: 'login' }, { status: 401 })
  await writeClient.delete(u.id) // removes saved profile and addresses; order records are kept for accounting
  return NextResponse.json({ ok: true })
}
