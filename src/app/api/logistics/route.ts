import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { notify } from '@/lib/notify'
import { VEHICLES, SERVICES } from '../../../../sanity/vehicles'
const s = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
const pick = (v: any, allowed: string[]) => (Array.isArray(v) ? v.filter((x) => allowed.includes(x)) : [])
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true })
  const d = { company: s(b.company, 120), rcNumber: s(b.rcNumber, 40), name: s(b.name, 100), phone: s(b.phone, 30), email: s(b.email, 120), baseCity: s(b.baseCity, 120), states: s(b.states, 300), fleetSize: s(b.fleetSize, 60), vehicles: pick(b.vehicles, VEHICLES), services: pick(b.services, SERVICES),
    insurance: s(b.insurance, 20), tracking: s(b.tracking, 40), website: s(b.websiteUrl, 160), rates: s(b.rates, 1500), notes: s(b.notes, 1000) }
  if (!d.company || !d.name || d.phone.replace(/\D/g, '').length < 7 || !d.vehicles.length || !d.states) return NextResponse.json({ error: 'Please add your company, contact name, phone, the states you serve and at least one vehicle type.' }, { status: 400 })
  const since = new Date(Date.now() - 3600000).toISOString()
  if ((await writeClient.fetch(`count(*[_type=="logisticsApplication" && createdAt>$since])`, { since })) >= 20) return NextResponse.json({ error: 'Too many applications right now. Please try again later.' }, { status: 429 })
  await writeClient.create({ _type: 'logisticsApplication', ...d, status: 'new', createdAt: new Date().toISOString() })
  await notify(`New logistics partner application\n${d.company}${d.rcNumber ? ' (RC ' + d.rcNumber + ')' : ''} · ${d.name} ${d.phone}\nVehicles: ${d.vehicles.join(', ')}\nStates: ${d.states}`)
  return NextResponse.json({ ok: true })
}
