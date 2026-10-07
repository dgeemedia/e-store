import { D } from './dict'
export type Lng = 'en' | 'zh' | 'fr'
export const normLang = (x: any): Lng => (x === 'zh' || x === 'fr' ? x : 'en')
/** Server-side translation (emails, SMS, PDFs). Same dictionary as the website. */
export function ts(lang: any, key: string, vars?: Record<string, any>) {
  const i = lang === 'zh' ? 1 : lang === 'fr' ? 2 : 0, e = D[key]
  let s = e ? e[i] || e[0] : key
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]))
  return s
}
