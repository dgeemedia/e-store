'use client'
import { useEffect, useState } from 'react'
export default function Countdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => { const t = () => setLeft(Math.max(0, new Date(endsAt).getTime() - Date.now())); t(); const i = setInterval(t, 1000); return () => clearInterval(i) }, [endsAt])
  if (left === null) return null
  const p = (n: number) => String(n).padStart(2, '0'), h = Math.floor(left / 36e5)
  return <div className="clock">{p(h)}:{p(Math.floor(left / 6e4) % 60)}:{p(Math.floor(left / 1e3) % 60)}</div>
}
