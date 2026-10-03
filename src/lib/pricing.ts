import { client, getActivePromo } from './sanity'
import { linePrice } from './tiers'
/** Server-side pricing: the browser sends ids/modes/quantities only. Prices, volume tiers, promos and stock come from Sanity. */
export async function priceCart(lines: any[], contact: { email?: string; phone?: string } = {}) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 50) throw new Error('Your cart is empty or too large.')
  const ids = [...new Set(lines.map((l) => String(l.productId)))]
  const [products, promo] = await Promise.all([
    client.fetch(`*[_type=="product" && _id in $ids && active!=false]{_id,name,unitPrice,dozenPrice,packSize,tiers,stockUnits,weightKg,options}`, { ids }),
    getActivePromo(),
  ])
  const promoBy = new Map((promo?.items || []).map((i: any) => [i.productId, i]))
  const parsed = lines.map((l) => {
    const p = products.find((x: any) => x._id === l.productId), q = Number(l.quantity)
    if (!p || !Number.isInteger(q) || q < 1 || q > 9999) throw new Error('An item in your cart is no longer available.')
    const mode: 'unit' | 'dozen' = l.mode === 'dozen' ? 'dozen' : 'unit'
    const sel = l.sel && typeof l.sel === 'object' ? l.sel : {}
    const variant = (p.options || []).map((g: any) => { if (!(g.values || []).includes(sel[g.name])) throw new Error(`Please choose a ${g.name} for ${p.name}.`); return `${g.name}: ${sel[g.name]}` }).join(' / ')
    return { p, q, mode, variant, units: mode === 'dozen' ? q * (p.packSize || 12) : q }
  })
  const totals = new Map<string, number>() // total units per product across all lines => "the more you buy, the cheaper"
  parsed.forEach((x) => totals.set(x.p._id, (totals.get(x.p._id) || 0) + x.units))
  const items: any[] = []
  for (const { p, q, mode, units, variant } of parsed) {
    const pr: any = promoBy.get(p._id), total = totals.get(p._id)!
    const price = linePrice(mode, pr?.promoUnitPrice ?? p.unitPrice, pr?.promoDozenPrice ?? p.dozenPrice, p.tiers, total, p.packSize || 12)
    if (!price) throw new Error(`${p.name} is not sold by the ${mode}.`)
    if (p.stockUnits != null && total > p.stockUnits) throw new Error(`Only ${p.stockUnits} units of ${p.name} left.`)
    if (pr?.limitPerCustomer) {
      const prior = (await client.fetch(`math::sum(*[_type=="order" && status in ["paid","shipped","delivered"] && (email==$e || phone==$ph) && createdAt>=$s].items[productId==$id].units)`, { e: contact.email || '-', ph: contact.phone || '-', s: promo.startsAt, id: p._id })) || 0
      if (prior + total > pr.limitPerCustomer) throw new Error(`Promo limit: ${pr.limitPerCustomer} units of ${p.name} per customer.`)
    }
    items.push({ _key: `${p._id}-${mode}-${variant.replace(/\W+/g, '')}`, variant, productId: p._id, productName: p.name, mode, quantity: q, price, units })
  }
  return { items, subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0), kg: parsed.reduce((s, x) => s + (x.p.weightKg || 0) * x.units, 0) }
}
