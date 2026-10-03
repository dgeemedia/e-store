'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
export default function CartLink() { const { count } = useCart(); return <Link href="/cart" className="btn ghost">Cart ({count})</Link> }
