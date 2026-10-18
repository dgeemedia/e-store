'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { useLang } from '@/lib/i18n'
/** Bottom tab bar on phones: the five things people tap most, always within thumb reach. */
export default function MobileNav() {
  const path = usePathname(), { count } = useCart(), { t } = useLang()
  const I = (d: string) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
  const items: [string, string, string, string][] = [
    ['/', t('mn.home'), 'M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', ''],
    ['/#shop', t('mn.shop'), 'M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9zM8 7a4 4 0 0 1 8 0', ''],
    ['/quote', t('mn.quote'), 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01', ''],
    ['/account', t('mn.account'), 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', ''],
    ['/cart', t('mn.cart'), 'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2M9 20.5a.5.5 0 1 0 0-.01M17 20.5a.5.5 0 1 0 0-.01', ''],
  ]
  return (<nav className="mnav" aria-label="Main">{items.map(([href, label, d]) => {
    const on = href === '/' ? path === '/' : href.startsWith('/#') ? false : path.startsWith(href)
    return <Link key={href} href={href} className={on ? 'on' : ''}>{I(d)}<span>{label}</span>{href === '/cart' && count > 0 && <b className="cnt">{count}</b>}</Link>
  })}</nav>)
}
