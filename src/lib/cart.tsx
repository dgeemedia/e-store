'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { linePrice, Tier } from './tiers'
export type Line = { productId: string; name: string; mode: 'unit' | 'dozen'; quantity: number; image?: string; unit?: number; dozen?: number; tiers?: Tier[]; pack?: number; packLabel?: string; sel?: Record<string, string>; kg?: number; price?: number }
const Ctx = createContext<any>(null)
export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
const unitsOf = (l: Line) => (l.mode === 'dozen' ? l.quantity * (l.pack || 12) : l.quantity)
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([])
  useEffect(() => { try { setRaw(JSON.parse(localStorage.getItem('elorge-cart') || '[]')) } catch {} }, [])
  useEffect(() => { localStorage.setItem('elorge-cart', JSON.stringify(raw)) }, [raw])
  const add = (l: Line) => setRaw((c) => {
    const f = c.find((x) => x.productId === l.productId && x.mode === l.mode && JSON.stringify(x.sel || {}) === JSON.stringify(l.sel || {}))
    return f ? c.map((x) => (x === f ? { ...l, quantity: x.quantity + l.quantity } : x)) : [...c, l]
  })
  const setQty = (i: number, q: number) => setRaw((c) => c.flatMap((x, k) => (k !== i ? [x] : q < 1 ? [] : [{ ...x, quantity: q }])))
  const units = new Map<string, number>()
  raw.forEach((l) => units.set(l.productId, (units.get(l.productId) || 0) + unitsOf(l)))
  const lines = raw.map((l) => ({ ...l, price: linePrice(l.mode, l.unit, l.dozen, l.tiers, units.get(l.productId), l.pack || 12) ?? l.price ?? 0 }))
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  return <Ctx.Provider value={{ lines, add, setQty, clear: () => setRaw([]), subtotal, count: lines.length }}>{children}</Ctx.Provider>
}
export const useCart = () => useContext(Ctx)
