import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { notify } from '@/lib/notify'
const s = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true })
  const rating = Math.round(Number(b.rating)), name = s(b.name, 60), comment = s(b.comment, 1000)
  if (!b.productId || !(rating >= 1 && rating <= 5) || !name || !comment) return NextResponse.json({ error: 'Please add your name, a rating and a comment.' }, { status: 400 })
  await writeClient.create({ _type: 'review', product: { _type: 'reference', _ref: String(b.productId) }, name, rating, comment, approved: false, createdAt: new Date().toISOString() })
  await notify(`⭐ New review waiting for approval\n${name}: ${rating}/5\n${comment}`)
  return NextResponse.json({ ok: true })
}
