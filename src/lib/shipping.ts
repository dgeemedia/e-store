/** Delivery fee = base fee (Lagos / other) + per-kg rate x total kg. Free over a threshold. Pickup is free. Shared by browser + server. */
export function deliveryFee(s: any, state: string, pickup: boolean, subtotal: number, kg: number) {
  if (pickup) return 0
  if (s.freeDeliveryAbove && subtotal >= s.freeDeliveryAbove) return 0
  const lagos = /lagos/i.test(state || '')
  const base = lagos ? s.deliveryFeeLagos ?? 3000 : s.deliveryFeeOther ?? 8000
  const perKg = lagos ? s.perKgLagos ?? 0 : s.perKgOther ?? 0
  return Math.round(base + perKg * (kg || 0))
}
