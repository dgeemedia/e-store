'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useLang } from '@/lib/i18n'
export default function CartLink() { const { count } = useCart(), { t } = useLang(); return <Link href="/cart" className="btn ghost">{t('nav.cart')} ({count})</Link> }
