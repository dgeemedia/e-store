'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { D, LANGS, Lang } from './dict'
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string, v?: Record<string, any>) => string; tr: (prefix: string, v: string) => string; te: (msg: string) => string }
const C = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (k) => k, tr: (_, v) => v, te: (m) => m })
const idx = (l: Lang) => (l === 'zh' ? 1 : l === 'fr' ? 2 : 0)
/** English messages sent by the server -> dictionary keys (so the server never needs to know the visitor's language). */
const ERR: [RegExp, string, string[]][] = [
  [/^Enter a code\.$/, 'e.enterCode', []], [/^Large orders are quoted/, 'e.large', []], [/^Name, email and phone are required\.$/, 'e.req3', []], [/^No order found\./, 'e.noOrder', []],
  [/^Phone login is coming soon/, 'lo.phoneSoonG', []], [/^Please add your company, contact name/, 'e.lgReq', []], [/^Please add your name, a rating/, 'e.rvReq', []], [/^Please add your name, phone and what you need\./, 'e.qReq', []], [/^Please add your name, phone and what you sell\./, 'e.sReq', []],
  [/^Please enter a valid Nigerian phone/, 'e.badPhoneNg', []], [/^Please enter a valid email address\.$/, 'c.eEmail', []], [/^Please enter your name, a phone number and a message\./, 'e.chatReq', []],
  [/^Please wait a minute before asking/, 'e.wait1', []], [/^Please wait a moment before asking/, 'e.wait2', []], [/^That currency is not available\./, 'e.cur', []],
  [/^Too many applications/, 'e.manyApps', []], [/^Too many messages/, 'e.manyMsgs', []], [/^Too many requests/, 'e.manyReq', []], [/^We could not send the SMS/, 'e.smsFail', []], [/^We could not send the email/, 'e.mailFail', []],
  [/^An item in your cart is no longer available\./, 'e.itemGone', []], [/^Could not start payment\./, 'e.payFail', []], [/^Please choose a delivery option\./, 'e.chooseDel', []],
  [/^That code has been fully used\./, 'e.codeUsed', []], [/^That code is not valid\./, 'e.codeBad', []], [/^We do not deliver to that country/, 'e.noCountry', []], [/^Your cart is empty or too large\./, 'e.cartBad', []],
  [/^(.+) is not sold by the unit\.$/, 'e.notSoldUnit', ['p']], [/^(.+) is not sold by the dozen\.$/, 'e.notSoldPack', ['p']], [/^Only (\d+) units of (.+) left\.$/, 'e.stock', ['n', 'p']],
  [/^Please choose a (.+) for (.+)\.$/, 'e.optChoose', ['g', 'p']], [/^Promo limit: (\d+) units of (.+) per customer\.$/, 'e.promoLimit', ['n', 'p']], [/^Spend at least ₦([\d,]+) to use this code\.$/, 'e.minSpend', ['n']],
  [/^This deal has ended or is sold out\./, 'e.dealEnded', []], [/^Sold out! Someone was faster/, 'e.dealFast', []], [/^This claim is no longer valid\./, 'e.claimBad', []], [/^Your time ran out/, 'e.timeUp', []], [/^Deal not available\./, 'e.dealNA', []], [/^Please enter your name, a valid email and phone\./, 'e.lgEmailPhone', []],
  [/^Please enter your delivery address and state\./, 'c.eAddr', []],
  [/^Enter your state first$/, 'r.state', []], [/^Not available in your state$/, 'r.notState', []], [/^For orders of (\d+) kg or more$/, 'r.minKg', ['n']], [/^Too heavy for this option \(max (\d+) kg\)$/, 'r.maxKg', ['n']], [/^Not available in your area$/, 'r.notArea', []],
]
/** Language is chosen by: ?lang=zh in the link, then the visitor's saved choice, then their browser language (Chinese or French), then English. */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setL] = useState<Lang>('en')
  useEffect(() => {
    const ok = (x: any) => LANGS.some((l) => l.code === x), q = new URLSearchParams(location.search).get('lang'), saved = localStorage.getItem('elorge-lang'), nav = (navigator.language || '').toLowerCase()
    if (ok(q)) localStorage.setItem('elorge-lang', q as string)
    setL([q, saved, nav.startsWith('zh') ? 'zh' : nav.startsWith('fr') ? 'fr' : 'en'].find(ok) as Lang)
  }, [])
  useEffect(() => { document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang }, [lang])
  const setLang = (l: Lang) => { setL(l); localStorage.setItem('elorge-lang', l) }
  const t = (k: string, v?: Record<string, any>) => { const e = D[k]; let s = e ? e[idx(lang)] || e[0] : k; if (v) for (const n in v) s = s.split(`{${n}}`).join(String(v[n])); return s }
  const tr = (prefix: string, v: string) => (D[prefix + v] ? t(prefix + v) : v)
  const te = (msg: string): string => {
    if (!msg) return msg
    for (const [re, key, names] of ERR) { const m = re.exec(msg); if (m) { const v: Record<string, any> = {}; names.forEach((n, i) => (v[n] = m[i + 1])); return t(key, v) } }
    const i = msg.indexOf(': ') // "Courier name: reason"
    if (i > 0) { const rest = te(msg.slice(i + 2)); if (rest !== msg.slice(i + 2)) return `${msg.slice(0, i)}: ${rest}` }
    return msg
  }
  return <C.Provider value={{ lang, setLang, t, tr, te }}>{children}</C.Provider>
}
export const useLang = () => useContext(C)
/** Translated text that can be dropped into server-rendered pages. */
export function T({ k, vars }: { k: string; vars?: Record<string, any> }) { const { t } = useLang(); return <>{t(k, vars)}</> }
/** Content from Studio in three languages; falls back to English when a translation is empty. */
export function L({ en, zh, fr }: { en?: string; zh?: string; fr?: string }) { const { lang } = useLang(); return <>{(lang === 'zh' ? zh : lang === 'fr' ? fr : '') || en}</> }
export const loc = (p: any, f: 'name' | 'description', lang: Lang) => (lang === 'zh' ? p[f + 'Zh'] : lang === 'fr' ? p[f + 'Fr'] : '') || p[f]
export function LegalNote() { const { lang, t } = useLang(); return lang === 'en' ? null : <small>{t('f.legalEn')}</small> }
