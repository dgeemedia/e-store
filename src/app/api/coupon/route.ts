import { NextResponse } from 'next/server'
import { couponDiscount } from '@/lib/coupon'
export async function POST(req: Request) {
  try { const b = await req.json(); const r = await couponDiscount(String(b.code || ''), Number(b.subtotal) || 0); return r ? NextResponse.json(r) : NextResponse.json({ error: 'Enter a code.' }, { status: 400 }) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }) }
}
