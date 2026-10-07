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
import HeaderSearch from '@/components/HeaderSearch'
import LangSwitcher from '@/components/LangSwitcher'
import { LangProvider, T } from '@/lib/i18n'
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
  const org = { ...orgLd['@graph'][0], sameAs: socials.filter(([l]) => l !== 'WhatsApp').map(([, u]) => u), ...(s.phone || s.email ? { contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', areaServed: 'NG', availableLanguage: 'en', ...(s.phone ? { telephone: s.phone } : {}), ...(s.email ? { email: s.email } : {}) }] } : {}) }
  const site = { ...orgLd['@graph'][1], potentialAction: { '@type': 'SearchAction', target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org'}/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }
  const ld = { ...orgLd, '@graph': [org, site] }
  return (
    <html lang="en"><body className={font.variable}><CartProvider><LangProvider>
      <Intro url={s.introVideoUrl} />
      <Analytics />
      <ChatWidget />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {s.announcement && <div className="bar">{s.announcement}</div>}
      <header className="top"><div className="wrap hdr">
        <Link href="/" className="brandmark"><img src="/logo.png" width={38} height={38} alt="" />elorge<span style={{ color: 'var(--green)' }}>store</span></Link>
        <HeaderSearch />
        <nav className="hnav"><Link href="/quote"><T k="nav.bulk" /></Link><Link href="/track"><T k="nav.track" /></Link><Link href="/account"><T k="nav.account" /></Link><LangSwitcher /><CartLink /></nav>
      </div></header>
      <PWA />
      {children}
      <footer><div className="wrap">
        <div className="fgrid">
          <div><div className="brandmark"><img src="/logo.png" width={34} height={34} alt="" />elorge<span style={{ color: 'var(--green)' }}>store</span></div><p><T k="f.tag" /></p></div>
          <div><h4><T k="f.shop" /></h4><Link href="/#shop"><T k="f.all" /></Link><Link href="/quote"><T k="f.bulk" /></Link><Link href="/track"><T k="f.track" /></Link><Link href="/cart"><T k="f.cart" /></Link><Link href="/sell"><T k="f.sell" /></Link><Link href="/logistics"><T k="f.deliver" /></Link><Link href="/account"><T k="f.account" /></Link></div>
          <div><h4><T k="f.contact" /></h4>{s.phone && <span>{s.phone}</span>}{s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}{s.whatsappNumber && <a href={`https://wa.me/${s.whatsappNumber}`}><T k="f.whatsapp" /></a>}{s.address && <span>{s.address}</span>}{socials.length > 0 && <><h4 style={{ marginTop: 16 }}><T k="f.follow" /></h4><div className="social">{socials.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer">{l}</a>)}</div></>}</div>
          <div><h4><T k="f.why" /></h4><span><T k="f.why1" /></span><span><T k="f.why2" /></span><span><T k="f.why3" /></span><span><T k="f.why4" /></span></div>
        </div>
        <div className="fbase">© {Math.max(2026, new Date().getFullYear())} Elorge Technologies Limited · RC 9521453 · <T k="f.rights" /> · <Link href="/legal/terms"><T k="f.terms" /></Link> · <Link href="/legal/privacy"><T k="f.privacy" /></Link> · <Link href="/legal/returns"><T k="f.returns" /></Link></div>
      </div></footer>
    </LangProvider></CartProvider></body></html>
  )
}
