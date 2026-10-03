export type Tier = { minUnits: number; unitPrice: number }
/** Best (lowest) per-unit tier price unlocked by this many units, or null. */
export const tierUnit = (tiers: Tier[] | null | undefined, units: number) =>
  (tiers || []).reduce<number | null>((b, t) => (units >= t.minUnits && (b == null || t.unitPrice < b) ? t.unitPrice : b), null)
/** Price of one unit/pack: the cheaper of list/promo price and the volume-tier price. Shared by browser + server. */
export function linePrice(mode: 'unit' | 'dozen', unit?: number | null, dozen?: number | null, tiers?: Tier[] | null, totalUnits = 1, pack = 12) {
  const base = mode === 'dozen' ? dozen : unit
  if (!base) return null
  const t = tierUnit(tiers, totalUnits)
  return t == null ? base : Math.min(base, mode === 'dozen' ? t * pack : t)
}
