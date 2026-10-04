import './globals.css'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { CartProvider } from '@/lib/cart'
import { getSettings } from '@/lib/sanity'
import CartLink from '@/components/CartLink'
import Intro from '@/components/Intro'
import PWA from '@/components/PWA'
import Analytics from '@/components/Analytics'
import ChatWidget from '@/components/ChatWidget'
const font = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font' })
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org'
export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Elorge Store | Factory-direct, Opor! Shikini money', template: '%s | Elorge Store' },
  description: 'Factory-direct prices in Nigeria with warranty. Buy one, by the dozen or by the truckload: the more you buy, the cheaper you pay. For wholesalers, retailers and everyday buyers.',
  keywords: ['factory direct Nigeria', 'wholesale prices Nigeria', 'buy in bulk Nigeria', 'cheap solar street light Nigeria', 'diapers wholesale Nigeria', 'solar fan price Nigeria', 'bulk order truckload Nigeria'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Elorge Store', locale: 'en_NG', url: SITE, title: 'Elorge Store | Factory-direct, Opor! Shikini money', description: 'Factory-direct prices with warranty. The more you buy, the cheaper you pay.', images: ['/icon-512.png'] },
  twitter: { card: 'summary', title: 'Elorge Store', description: 'Factory-direct prices with warranty. The more you buy, the cheaper you pay.', images: ['/icon-512.png'] },
}
const orgLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: 'Elorge Store', legalName: 'Elorge Technologies Limited', url: SITE, logo: `${SITE}/icon-512.png` }, { '@type': 'WebSite', name: 'Elorge Store', url: SITE }] }
export const viewport = { themeColor: '#0056b6' }
export const revalidate = 60
export default async function Root({ children }: { children: React.ReactNode }) {
  const s = (await getSettings()) || {}
  const socials: [string, string][] = ([['Instagram', s.instagramUrl], ['Facebook', s.facebookUrl], ['TikTok', s.tiktokUrl], ['X', s.xUrl], ['YouTube', s.youtubeUrl], ['LinkedIn', s.linkedinUrl], ['Telegram', s.telegramUrl], ['WhatsApp', s.whatsappNumber && `https://wa.me/${s.whatsappNumber}`]] as [string, string][]).filter(([, u]) => u)
  const ld = { ...orgLd, '@graph': [{ ...orgLd['@graph'][0], sameAs: socials.filter(([l]) => l !== 'WhatsApp').map(([, u]) => u) }, orgLd['@graph'][1]] }
  return (
    <html lang="en"><body className={font.variable}><CartProvider>
      <Intro url={s.introVideoUrl} />
      <Analytics />
      <ChatWidget />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {s.announcement && <div className="bar">{s.announcement}</div>}
      <header className="top"><div className="wrap hdr">
        <Link href="/" className="brandmark"><img src="/logo.png" width={38} height={38} alt="" />elorge<span style={{ color: 'var(--green)' }}>store</span></Link>
        <form action="/" method="get" className="hsearch"><input name="q" placeholder="Search products or sellers…" aria-label="Search" /><button className="btn" type="submit">Search</button></form>
        <nav className="hnav"><Link href="/quote">Bulk orders</Link><Link href="/track">Track order</Link><CartLink /></nav>
      </div></header>
      <PWA />
      {children}
      <footer><div className="wrap">
        <div className="fgrid">
          <div><div className="brandmark"><img src="/logo.png" width={34} height={34} alt="" />elorge<span style={{ color: 'var(--green)' }}>store</span></div><p>Factory-direct, Opor! Shikini money. The more you buy, the cheaper you pay.</p></div>
          <div><h4>Shop</h4><Link href="/#shop">All products</Link><Link href="/quote">Bulk &amp; truckload orders</Link><Link href="/track">Track my order</Link><Link href="/cart">Cart</Link><Link href="/sell">Sell on Elorge</Link></div>
          <div><h4>Contact</h4>{s.phone && <span>{s.phone}</span>}{s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}{s.whatsappNumber && <a href={`https://wa.me/${s.whatsappNumber}`}>WhatsApp us</a>}{s.address && <span>{s.address}</span>}{socials.length > 0 && <><h4 style={{ marginTop: 16 }}>Follow us</h4><div className="social">{socials.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer">{l}</a>)}</div></>}</div>
          <div><h4>Why Elorge</h4><span>Factory-direct prices</span><span>Invoiced &amp; documented supply</span><span>Warranty on products</span><span>Secure payments</span></div>
        </div>
        <div className="fbase">© {Math.max(2026, new Date().getFullYear())} Elorge Technologies Limited · RC 9521453 · All rights reserved. · <Link href="/legal/terms">Terms</Link> · <Link href="/legal/privacy">Privacy</Link> · <Link href="/legal/returns">Returns &amp; Warranty</Link></div>
      </div></footer>
    </CartProvider></body></html>
  )
}
