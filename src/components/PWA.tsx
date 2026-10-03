'use client'
import { useEffect, useState } from 'react'
export default function PWA() {
  const [evt, setEvt] = useState<any>(null), [ios, setIos] = useState(false), [hide, setHide] = useState(true)
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {})
    const installed = matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone
    if (installed || localStorage.getItem('elorge-pwa-dismissed')) return
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIos) { setIos(true); setHide(false) }
    const h = (e: any) => { e.preventDefault(); setEvt(e); setHide(false) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  if (hide || (!evt && !ios)) return null
  const close = () => { localStorage.setItem('elorge-pwa-dismissed', '1'); setHide(true) }
  return (<div style={{ position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 40, maxWidth: 440, margin: '0 auto', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 14, boxShadow: '0 8px 30px rgba(0,0,0,.18)', display: 'flex', gap: 12, alignItems: 'center' }}>
    <img src="/icon-192.png" width={44} height={44} alt="" />
    <div style={{ flex: 1, fontSize: 14 }}><b>Install Elorge Store</b><br />{ios ? 'Tap Share, then "Add to Home Screen".' : 'Faster ordering, right from your home screen.'}</div>
    {evt && <button className="btn" onClick={async () => { evt.prompt(); await evt.userChoice; setHide(true) }}>Install</button>}
    <button onClick={close} aria-label="Dismiss" style={{ background: 'none', border: 0, color: 'var(--mute)', fontSize: 20, cursor: 'pointer' }}>×</button>
  </div>)
}
