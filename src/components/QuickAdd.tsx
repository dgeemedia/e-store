'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
/** Temu/Jumia-style one-tap add. Products with options send the buyer to the product page to choose. */
export default function QuickAdd({ i, image }: { i: any; image: string }) {
  const { add } = useCart()
  const [ok, setOk] = useState(false)
  if (i.hasOptions) return <Link href={`/product/${i.slug}`} className="qa" aria-label="Choose options">+</Link>
  return <button className="qa" aria-label={`Add ${i.name} to cart`} onClick={() => { add({ productId: i._id, name: i.name, mode: 'unit', quantity: 1, image, unit: i.unit, dozen: i.dozen, tiers: i.tiers, pack: i.pack, packLabel: i.packLabel, sel: {}, kg: i.kg }); setOk(true); setTimeout(() => setOk(false), 1200) }}>{ok ? '✓' : '+'}</button>
}
