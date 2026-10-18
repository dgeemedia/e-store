/** "Customer pays the payment-gateway fee" (gross-up). Shared by the cart (preview) and the server (the real charge).
 *  Gateway takes pct% of what the buyer pays, capped. We charge enough extra that after the gateway's cut you still receive `amount`. */
export type FeeCfg = { on?: boolean; pct?: number; cap?: number; flat?: number; intlPct?: number }
export const feeCfg = (s: any): FeeCfg => ({ on: !!s?.passFee, pct: s?.payFeePercent ?? 1.4, cap: s?.payFeeCap ?? 2000, flat: s?.payFeeFlat ?? 0, intlPct: s?.payFeeIntlPercent ?? 3.8 })
/** Extra naira to add to `amount` (goods + delivery). 0 when the switch is off. */
export function processingFee(amount: number, cfg: FeeCfg, foreign = false): number {
  if (!cfg?.on || !(amount > 0)) return 0
  const p = (foreign ? cfg.intlPct ?? 3.8 : cfg.pct ?? 1.4) / 100, cap = foreign ? Infinity : cfg.cap ?? 2000, flat = cfg.flat ?? 0
  let charge = (amount + flat) / (1 - p)
  if (p * charge > cap) charge = amount + flat + cap
  return Math.ceil(charge - amount)
}
