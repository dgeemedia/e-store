'use client'
import { useEffect, useState } from 'react'
export default function Intro({ url }: { url?: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => { if (url && !sessionStorage.getItem('elorge-intro')) setShow(true) }, [url])
  if (!show) return null
  const close = () => { sessionStorage.setItem('elorge-intro', '1'); setShow(false) }
  return (<div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000' }}>
    <video src={url} autoPlay muted playsInline onEnded={close} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8 }} />
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', color: '#fff', padding: 20 }}>
      <div><img src="/logo.png" width={84} alt="" /><h1 style={{ fontSize: 'clamp(30px,6vw,60px)', margin: '8px 0', letterSpacing: '-.04em' }}>Straight from the factory.</h1><button className="btn green" onClick={close}>Enter store →</button></div></div>
    <button onClick={close} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.5)', color: '#fff', border: 0, padding: '8px 14px', borderRadius: 99, cursor: 'pointer' }}>Skip</button></div>)
}
