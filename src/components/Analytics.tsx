'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'
const GA = process.env.NEXT_PUBLIC_GA_ID, PX = process.env.NEXT_PUBLIC_META_PIXEL_ID
/** Loads analytics only after the visitor accepts cookies. */
export default function Analytics() {
  const [c, setC] = useState<string | null>('wait')
  useEffect(() => setC(localStorage.getItem('elorge-consent')), [])
  if (!GA && !PX) return null
  const set = (v: string) => { localStorage.setItem('elorge-consent', v); setC(v) }
  return (<>
    {c === 'yes' && GA && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" /><Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}</Script></>}
    {c === 'yes' && PX && <Script id="px" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PX}');fbq('track','PageView');`}</Script>}
    {c === null && <div className="consent"><span>We use cookies to see how visitors use the site. <a href="/legal/privacy"><u>Privacy</u></a></span><button className="btn" onClick={() => set('yes')}>Accept</button><button className="btn ghost" onClick={() => set('no')}>No thanks</button></div>}
  </>)
}
