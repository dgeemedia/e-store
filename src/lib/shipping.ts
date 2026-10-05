/** Delivery fee. Inside Nigeria: base fee (Lagos / other) + per-kg rate, free over a threshold, pickup free.
 *  Outside Nigeria (only when the International delivery switch is on): country rate from Studio. Shared by browser + server. */
export function deliveryFee(s: any, state: string, pickup: boolean, subtotal: number, kg: number, country = 'Nigeria') {
  if (country && country !== 'Nigeria') {
    const r = (s.intlRates || []).find((x: any) => x.country === country)
    if (!s.features?.intlDelivery || !r) throw new Error('We do not deliver to that country yet.')
    return Math.round(r.feeNgn + (r.perKgNgn || 0) * (kg || 0))
  }
  if (pickup) return 0
  if (s.freeDeliveryAbove && subtotal >= s.freeDeliveryAbove) return 0
  const lagos = /lagos/i.test(state || '')
  const base = lagos ? s.deliveryFeeLagos ?? 3000 : s.deliveryFeeOther ?? 8000
  const perKg = lagos ? s.perKgLagos ?? 0 : s.perKgOther ?? 0
  return Math.round(base + perKg * (kg || 0))
}

/** Price one delivery partner for a cart. Used by the cart (to show options) and the server (to charge).
 *  Zones (optional) are checked first, top to bottom: the first zone whose keywords appear in "state + area" wins.
 *  A zone is either one base fee (+ per kg) or weight bands. With no matching zone, the partner's plain Lagos / other-states fees apply, if set. */
export function partnerQuote(p: any, state: string, kg: number, subtotal: number, area = ''): { ok: boolean; fee: number; reason?: string; zone?: string; eta?: string; hidden?: boolean } {
  const st = (state || '').trim().toLowerCase()
  if (!st) return { ok: false, fee: 0, reason: 'Enter your state first' }
  const cov: string[] = (p.coverage || []).map((x: string) => x.trim().toLowerCase()).filter(Boolean)
  if (cov.length && !cov.some((c) => st.includes(c) || c.includes(st))) return { ok: false, fee: 0, reason: 'Not available in your state' }
  if (p.minKg && kg < p.minKg) return { ok: false, fee: 0, hidden: true, reason: `For orders of ${p.minKg} kg or more` }
  if (p.maxKg && kg > p.maxKg) return { ok: false, fee: 0, reason: `Too heavy for this option (max ${p.maxKg} kg)` }
  if (p.freeAbove && subtotal >= p.freeAbove) return { ok: true, fee: 0 }
  const text = `${state} ${area}`.toLowerCase()
  const zone = (p.zones || []).find((z: any) => (z.match || []).some((m: string) => m && m.trim() && text.includes(m.trim().toLowerCase())))
  if (zone) {
    const perKg = zone.perKg ?? p.perKg ?? 0
    const bands = [...(zone.bands || [])].sort((a: any, b: any) => a.upToKg - b.upToKg)
    let fee: number
    if (bands.length) { const hit = bands.find((b: any) => kg <= b.upToKg), last = bands[bands.length - 1]; fee = hit ? hit.fee : last.fee + perKg * (kg - last.upToKg) }
    else fee = (zone.fee ?? 0) + perKg * (kg || 0)
    return { ok: true, fee: Math.round(fee), zone: zone.name, eta: zone.etaText }
  }
  if ((p.zones || []).length && p.feeLagos == null && p.feeOther == null) return { ok: false, fee: 0, reason: 'Not available in your area' }
  const lagos = /lagos/i.test(state), base = lagos ? p.feeLagos ?? p.feeOther ?? 0 : p.feeOther ?? p.feeLagos ?? 0
  return { ok: true, fee: Math.round(base + (p.perKg || 0) * (kg || 0)) }
}
