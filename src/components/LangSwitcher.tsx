'use client'
import { useLang } from '@/lib/i18n'
import { LANGS } from '@/lib/dict'
export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  return <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as any)} style={{ width: 'auto', padding: '6px 8px', border: 0, borderBottom: '1px solid var(--line)', background: 'transparent', fontSize: 12, fontWeight: 700, letterSpacing: '.1em' }}>{LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select>
}
