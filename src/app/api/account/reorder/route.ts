import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { client, writeClient, urlFor } from '@/lib/sanity'
import { isPhoneEmail } from '@/lib/customer'
/** Rebuilds cart lines from a past order (only the order's own customer). Prices are re-checked on the server at checkout. */
export async function GET(req: Request) {
  const a = await auth(), email = a?.user?.email?.toLowerCase(), ref = new URL(req.url).searchParams.get('ref')
  if (!email || !ref) return NextResponse.json({ lines: [] }, { status: 401 })
  const o: any = await writeClient.fetch(`*[_type=="order" && reference==$ref && (lower(email)==$email || phoneNorm==$p)][0]{items}`, { ref, email, p: isPhoneEmail(email) ? email.split('@')[0] : '-' })
  if (!o?.items?.length) return NextResponse.json({ lines: [] })
  const ps: any[] = await client.fetch(`*[_type=="product" && _id in $ids && active!=false]{_id,name,images,unitPrice,dozenPrice,packSize,packLabel,tiers,weightKg,stockUnits}`, { ids: o.items.map((i: any) => i.productId) })
  const lines = o.items.flatMap((i: any) => {
    const p = ps.find((x) => x._id === i.productId)
    if (!p || p.stockUnits === 0 || !p.images?.length) return []
    const sel = Object.fromEntries(String(i.variant || '').split(' / ').filter(Boolean).map((x: string) => x.split(': ')))
    return [{ productId: p._id, name: p.name, mode: i.mode, quantity: i.quantity, image: urlFor(p.images[0]).width(120).height(120).url(), unit: p.unitPrice, dozen: p.dozenPrice, tiers: p.tiers, pack: p.packSize || 12, packLabel: p.packLabel || 'dozen', sel, kg: p.weightKg }]
  })
  return NextResponse.json({ lines })
}
