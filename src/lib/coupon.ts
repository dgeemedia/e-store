import { client } from './sanity'
export async function couponDiscount(code: string, subtotal: number) {
  const c = (code || '').trim().toUpperCase()
  if (!c) return null
  const d = await client.fetch(`*[_type=="coupon" && code==$c && active!=false && (!defined(startsAt)||startsAt<=now()) && (!defined(endsAt)||endsAt>=now())][0]{code,percentOff,amountOff,minSubtotal,maxUses,"used":count(*[_type=="order" && couponCode==^.code && status in ["paid","shipped","delivered"]])}`, { c })
  if (!d) throw new Error('That code is not valid.')
  if (d.maxUses && d.used >= d.maxUses) throw new Error('That code has been fully used.')
  if (d.minSubtotal && subtotal < d.minSubtotal) throw new Error(`Spend at least ₦${d.minSubtotal.toLocaleString('en-NG')} to use this code.`)
  const off = d.percentOff ? (subtotal * d.percentOff) / 100 : d.amountOff || 0
  return { code: d.code as string, discount: Math.min(Math.round(off), subtotal) }
}
